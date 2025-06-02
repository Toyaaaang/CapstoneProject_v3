from notification.models import Notification
from django.utils.timezone import now
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib.auth import get_user_model

User = get_user_model()

def send_notification(user: User = None, message: str = None, link: str = None, role: str = None):
    if not message:
        message = "No message provided."

    try:
        channel_layer = get_channel_layer()
        timestamp = now().isoformat()

        # 🎯 User-specific
        if user:
            notif = Notification.objects.create(
                recipient=user,
                message=message,
                link=link,
                created_at=now(),
            )
            async_to_sync(channel_layer.group_send)(
                f"user_{user.id}",
                {
                    "type": "send_notification",
                    "id": notif.id,
                    "message": message,
                    "timestamp": notif.created_at.isoformat(),
                    "link": link,
                }
            )

        # 👥 Role-based (only one DB entry + channel broadcast)
        elif role:
            notif = Notification.objects.create(
                role=role,
                message=message,
                link=link,
                created_at=now(),
            )
            async_to_sync(channel_layer.group_send)(
                role.lower(),  # e.g., "auditor"
                {
                    "type": "send_notification",
                    "id": notif.id,
                    "message": message,
                    "timestamp": notif.created_at.isoformat(),
                    "link": link,
                }
            )
        else:
            raise ValueError("No user or role specified for notification")

    except Exception as e:
        print(f"[send_notification ❌] {str(e)}")
