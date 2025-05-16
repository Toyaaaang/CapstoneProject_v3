from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        queryset = Notification.objects.filter(recipient=request.user).order_by("-created_at")
        serializer = NotificationSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        try:
            # Ensure pk is an integer
            if not pk or not pk.isdigit():
                return Response({"error": "Invalid notification ID"}, status=400)

            notification = Notification.objects.get(id=pk, recipient=request.user)
            serializer = NotificationSerializer(notification)
            return Response(serializer.data)
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found"}, status=404)
        
    def destroy(self, request, pk=None):
        try:
            notification = Notification.objects.get(id=pk, recipient=request.user)
            notification.delete()
            return Response({"message": "Notification deleted"})
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found"}, status=404)

    @action(detail=True, methods=["patch"])
    def mark_as_read(self, request, pk=None):
        try:
            notification = Notification.objects.get(id=pk, recipient=request.user)
            notification.is_read = True
            notification.save()
            return Response({"message": "Marked as read"})
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found"}, status=404)

    @action(detail=False, methods=["delete"])
    def clear_all(self, request):
        Notification.objects.filter(recipient=request.user).delete()
        return Response({"message": "All notifications cleared"})

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        count = Notification.objects.filter(recipient=request.user, is_read=False).count()
        return Response({"unread_count": count})
