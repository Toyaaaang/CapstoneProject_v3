# notification/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if user.is_anonymous:
            await self.close()
            return

        self.user_group = f"user_{user.id}"
        await self.channel_layer.group_add(self.user_group, self.channel_name)

        if hasattr(user, "role"):
            self.role_group = str(user.role).lower()
            await self.channel_layer.group_add(self.role_group, self.channel_name)
        else:
            self.role_group = None

        await self.accept()
        print(f"🔗 {user.username} connected to {self.user_group} and {self.role_group}")

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.user_group, self.channel_name)
        if self.role_group:
            await self.channel_layer.group_discard(self.role_group, self.channel_name)

    async def send_notification(self, event):
        await self.send(text_data=json.dumps({
            "message": event["message"],
            "link": event.get("link"),
            "id": event.get("id"),
            "timestamp": event.get("timestamp"),
        }))
