import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  link?: string;
}

export default function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}notification/`;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(BASE_URL, {
        credentials: "include", // ✅ Send cookies
      });

      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
  let shouldReconnect = true;

  const connectWebSocket = () => {
    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    const wsHost = process.env.NEXT_PUBLIC_WS_URL || window.location.host;
    const ws = new WebSocket(`${wsScheme}://${wsHost}/ws/notifications/`);


    socketRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const newNotif: Notification = {
          id: data.id ?? Date.now(),
          message: data.message,
          is_read: false,
          created_at: data.timestamp ?? new Date().toISOString(),
          link: data.link ?? undefined,
        };

        setNotifications((prev) => [newNotif, ...prev]);

        toast(data.message || "📬 New notification", {
          description: data.link ? `Go to: ${data.link}` : undefined,
        });
      } catch {}
    };

    ws.onclose = () => {
      if (shouldReconnect) {
        setTimeout(connectWebSocket, 5000);
      }
    };

    ws.onerror = () => {}; // silent fail
  };

  connectWebSocket();

  return () => {
    shouldReconnect = false;
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }
  };
}, []);


  return {
    notifications,
    loading,
    error,

    markAsRead: async (id: number) => {
      await fetch(`${BASE_URL}${id}/mark_as_read/`, {
        method: "PATCH",
        credentials: "include",
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    },

    deleteNotification: async (id: number) => {
      await fetch(`${BASE_URL}${id}/`, {
        method: "DELETE",
        credentials: "include",
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    },

    clearAllNotifications: async () => {
      await fetch(`${BASE_URL}clear_all/`, {
        method: "DELETE",
        credentials: "include",
      });
      setNotifications([]);
    },

    markAllAsRead: async () => {
      const unread = notifications.filter((n) => !n.is_read);
      await Promise.all(
        unread.map((n) =>
          fetch(`${BASE_URL}${n.id}/mark_as_read/`, {
            method: "PATCH",
            credentials: "include",
          })
        )
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    },
  };
}
