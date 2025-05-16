import { useState, useEffect } from "react";

interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}notification/`;

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      setLoading(true);
      const response = await fetch(BASE_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
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
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, []);

  return {
    notifications,
    loading,
    error,

    markAsRead: async (id: number) => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        await fetch(`${BASE_URL}${id}/mark_as_read/`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
      } catch (err) {
        console.error("Failed to mark notification as read", err);
      }
    },

    deleteNotification: async (id: number) => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        await fetch(`${BASE_URL}${id}/`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        setNotifications((prev) => prev.filter((n) => n.id !== id));
      } catch (err) {
        console.error("Failed to delete notification", err);
      }
    },

    clearAllNotifications: async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        await fetch(`${BASE_URL}clear_all/`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        setNotifications([]);
      } catch (err) {
        console.error("Failed to clear notifications", err);
      }
    },

    
    markAllAsRead: async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const unread = notifications.filter((n) => !n.is_read);
      await Promise.all(
        unread.map((n) =>
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}notification/${n.id}/mark_as_read/`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          })
        )
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  },

  };
  
}
