# notification/utils.py
from notification.models import Notification
from django.utils.timezone import now
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

def send_notification(user=None, message=None, link=None, role=None):
    try:
        if not message:
            message = "No message provided."

        channel_layer = get_channel_layer()

        if user:
            notif = Notification.objects.create(
                recipient=user,
                message=message,
                created_at=now(),
                link=link,
            )
            async_to_sync(channel_layer.group_send)(
                f"user_{user.id}",
                {
                    "type": "send_notification",
                    "message": message,
                    "link": link,
                    "id": notif.id,
                    "timestamp": notif.created_at.isoformat(),
                }
            )
            print(f"✅ Notification sent to user_{user.id}")

        elif role:
            async_to_sync(channel_layer.group_send)(
                str(role).lower(),
                {
                    "type": "send_notification",
                    "message": message,
                    "link": link,
                    "id": None,
                    "timestamp": now().isoformat(),
                }
            )
            print(f"📢 Notification sent to role: {role}")

        else:
            print("❌ No user or role provided for notification.")

    except Exception as e:
        print(f"❌ Failed to send notification: {e}")
