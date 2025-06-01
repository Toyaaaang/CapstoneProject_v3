from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView, CustomTokenObtainPairView, 
    ConfirmRoleView, GetUserView, SaveSignatureView, GetSignatureView, AccountView, PendingRoleRequestsView,
    AcceptRoleRequestView, ApprovalHistoryView, RejectRoleRequestView, MeView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("confirm-role/<int:user_id>/", ConfirmRoleView.as_view(), name="confirm_role"),
    path("user/", GetUserView.as_view(), name="get_user"),
    path("me/", MeView.as_view(), name="me"),
    
    path("save-signature/", SaveSignatureView.as_view(), name="save-signature"),
    path("get-signature/", GetSignatureView.as_view(), name="get-signature"),
    path("account/", AccountView.as_view(), name="account"),
    
    path("pending-roles/", PendingRoleRequestsView.as_view(), name="pending_roles"),
    path("accept-role/<int:user_id>/", AcceptRoleRequestView.as_view(), name="accept_role"),
    path("reject-role/<int:user_id>/", RejectRoleRequestView.as_view(), name="reject_role"),
    
    path("approval-history/", ApprovalHistoryView.as_view(), name="approval_history"),
]
