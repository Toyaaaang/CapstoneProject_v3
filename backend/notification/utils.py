from notification.models import Notification
from django.utils.timezone import now

def send_notification(user, message, link=None):
    try:
        if user is None:
            print("❌ No user provided for notification.")
            return

        Notification.objects.create(
            recipient=user,
            message=message or "No message provided.",
            created_at=now(),
            link=link,
        )
        print(f"✅ Notification created for {user.username} | Message: {message}")
    except Exception as e:
        print(f"❌ Failed to create notification for {user}: {e}")
