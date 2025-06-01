from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from .serializers import UserSerializer, LoginSerializer, RoleRequestRecordSerializer, PendingUserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from notification.models import Notification
from notification.serializers import NotificationSerializer
from rest_framework.exceptions import ValidationError
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
import os
from .models import RoleRequestRecord
from rest_framework.pagination import PageNumberPagination
from django.http import JsonResponse

class RoleRequestPagination(PageNumberPagination):
    page_size = 10


User = get_user_model()

# Custom Token Serializer to Include Role and Role Confirmation
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["is_role_confirmed"] = user.is_role_confirmed
        return token

# Custom Token View
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
# Function to Generate Notification Message Dynamically
def generate_notification_message(user):
    username = user.username
    role = user.role

    if role != "employee":
        return f"Welcome to the Warehouse Operations Management System!\nHi {username}, your requested role as '{role}' is pending admin approval."
    else:
        return (
            f"Welcome {username} to the Warehouse Operations Management System! "
            "As an employee, you can request materials and track your requisitions seamlessly."
        )
        

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # Allows anyone to register


    def perform_create(self, serializer):
        try:
            user = serializer.save()

            # Send notification to the new user
            user_message = generate_notification_message(user)
            Notification.objects.create(recipient=user, message=user_message)

            # Send notification to warehouse admins
            warehouse_admins = User.objects.filter(role="warehouse_admin")
            admin_message = f"New user '{user.username}' is requesting role approval for '{user.role}'."
            
            for admin in warehouse_admins:
                Notification.objects.create(recipient=admin, message=admin_message)

        except ValidationError as e:
            print("Validation Error:", e.detail)  # Logs errors
            return Response({"error": e.detail}, status=status.HTTP_400_BAD_REQUEST)


# Login View (Token-Based)
class LoginView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            # 🍪 Create response and set access token in secure cookie
            response = JsonResponse({
                "refresh": str(refresh),  # keep this if you still want to allow manual logout via refresh token
                "role": user.role,
                "is_role_confirmed": user.is_role_confirmed,
                "last_login": user.last_login,
            })

            # 🍪 Set cookie
            response.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,       # 🔐 protects from JavaScript access
                secure=False,        # 🔐 set to True in production (requires HTTPS)
                samesite="Lax",      # or "Strict" for more protection
                max_age=3600,        # 1 hour expiry (adjust as needed)
            )

            return response

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class LogoutView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        # Blacklist refresh token if present
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass

        # 🍪 Clear cookie
        response = JsonResponse({"message": "Logged out successfully"})
        response.delete_cookie("access_token")
        return response
   
        
# View to Confirm User Role (Only Admins Can Confirm)
class ConfirmRoleView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        if request.user.role != "warehouse admin":
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            user = User.objects.get(id=user_id)
            user.is_role_confirmed = True
            user.save()
            return Response({"message": f"{user.username}'s role confirmed!"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

# Fetch User Details for Role-Based Redirect
class GetUserView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "username": user.username,
            "role": user.role,
            "is_role_confirmed": user.is_role_confirmed
        })

# Save User Signature
class SaveSignatureView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        signature_file = request.FILES.get("signature")

        if not signature_file:
            return Response({"error": "Signature file is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Save the file to the media directory
            signature_path = os.path.join("signatures", f"{user.id}_signature.png")
            full_path = os.path.join(settings.MEDIA_ROOT, signature_path)
            default_storage.save(full_path, ContentFile(signature_file.read()))

            # Save the file path in the user's signature field
            user.signature = signature_path
            user.save()

            return Response({"message": "Signature saved successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Get User Signature
class GetSignatureView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.signature:
            signature_url = request.build_absolute_uri(user.signature.url)  # Use .url to get the file URL
            return Response({"signature": signature_url}, status=status.HTTP_200_OK)
        return Response({"signature": None}, status=status.HTTP_200_OK)

# Account View to Get and Update User Details
class AccountView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "first_name": user.first_name,
            "last_name": user.last_name,
        })

    def patch(self, request):
        user = request.user
        user.first_name = request.data.get("first_name", user.first_name)
        user.last_name = request.data.get("last_name", user.last_name)
        user.save()
        return Response({"detail": "Name updated successfully"})

    def put(self, request):
        user = request.user
        user.first_name = request.data.get("first_name", user.first_name)
        user.last_name = request.data.get("last_name", user.last_name)
        user.save()
        return Response({"message": "Account details updated successfully."}, status=status.HTTP_200_OK)


# View to Get Pending Role Requests
class PendingRoleRequestsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "warehouse_admin":
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        # ✅ Make sure this is outside the if-block!
        pending_users = User.objects.filter(is_role_confirmed=False)

        paginator = RoleRequestPagination()
        result_page = paginator.paginate_queryset(pending_users, request)

        serializer = PendingUserSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

# Accept Role Request View
class AcceptRoleRequestView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        if request.user.role != "warehouse_admin":
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        try:
            user = User.objects.get(id=user_id, is_role_confirmed=False)
            user.is_role_confirmed = True
            user.save()
            # Create a RoleRequestRecord for the approved request
            RoleRequestRecord.objects.create(
                user=user,
                requested_role=user.role,
                status="approved",
                processed_by=request.user,
            )
            return Response({"message": f"{user.username}'s role has been accepted!"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found or already confirmed"}, status=status.HTTP_404_NOT_FOUND)
        
class RejectRoleRequestView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        if request.user.role != "warehouse_admin":
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        try:
            user = User.objects.get(id=user_id, is_role_confirmed=False)

            # Create a RoleRequestRecord for the rejected request
            RoleRequestRecord.objects.create(
                user=user,
                requested_role=user.role,
                status="rejected",
                processed_by=request.user,
            )

            return Response({"message": f"{user.username}'s role request has been rejected!"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found or already confirmed"}, status=status.HTTP_404_NOT_FOUND)

class ApprovalHistoryView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "warehouse_admin":
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        role_requests = RoleRequestRecord.objects.all().order_by("-processed_at")  # optional ordering

        paginator = RoleRequestPagination()
        result_page = paginator.paginate_queryset(role_requests, request)

        serializer = RoleRequestRecordSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
class MeView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "is_role_confirmed": user.is_role_confirmed,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
        })