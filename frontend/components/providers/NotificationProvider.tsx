"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import axios from "@/lib/axios";
import { toast } from "sonner";

interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  link?: string;
}

export type NotificationContextType = {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean | null; // Add this
  markAsRead: (id: number) => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
  reconnect: () => Promise<void>;
  disconnect: () => void; // Add this line
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}notification/`;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(BASE_URL, { withCredentials: true });
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setIsAuthenticated(false);
        setNotifications([]);
        return;
      }
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    if (!pollingRef.current) {
      pollingRef.current = setInterval(fetchNotifications, 20000);
    }
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const connectWebSocket = () => {
    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    const wsHost = process.env.NEXT_PUBLIC_WS_URL || window.location.host;
    const ws = new WebSocket(`${wsScheme}://${wsHost}/ws/notifications/`);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      stopPolling();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const newNotif: Notification = {
          id: Number(data.id) || Date.now() + Math.random(),
          message: data.message,
          is_read: false,
          created_at: data.timestamp ?? new Date().toISOString(),
          link: data.link ?? undefined,
        };

        setNotifications((prev) => {
          const exists = prev.some((n) => n.id === newNotif.id);
          if (!exists) {
            toast(data.message || "📬 New notification");
            return [newNotif, ...prev];
          }
          return prev;
        });
      } catch (err) {
        console.error("Failed to parse notification:", err);
      }
    };

    ws.onclose = () => {
      console.warn("❌ WebSocket closed. Falling back to polling.");
      startPolling();
    };

    ws.onerror = () => {
      console.error("❌ WebSocket error");
    };
  };

  const checkAuthAndInit = async () => {
    try {
      await axios.get("/authentication/me/", { withCredentials: true });
      setIsAuthenticated(true);
      fetchNotifications();
      connectWebSocket();
    } catch {
      setIsAuthenticated(false);
      fetchNotifications();
      startPolling();
    }
  };

  useEffect(() => {
    checkAuthAndInit();
    return () => {
      stopPolling();
      socketRef.current?.close();
    };
  }, []);

  const disconnect = () => {
    stopPolling();
    socketRef.current?.close();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loading,
        error,
        isAuthenticated, // Add this
        markAsRead: async (id) => {
          await axios.patch(`${BASE_URL}${id}/mark_as_read/`, {}, { withCredentials: true });
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
          );
        },
        deleteNotification: async (id) => {
          await axios.delete(`${BASE_URL}${id}/`, { withCredentials: true });
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        },
        clearAllNotifications: async () => {
          await axios.delete(`${BASE_URL}clear_all/`, { withCredentials: true });
          setNotifications([]);
        },
        markAllAsRead: async () => {
          const unread = notifications.filter((n) => !n.is_read);
          await Promise.all(
            unread.map((n) =>
              axios.patch(`${BASE_URL}${n.id}/mark_as_read/`, {}, { withCredentials: true })
            )
          );
          setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        },
        reconnect: async () => {
          await checkAuthAndInit();
        },
        disconnect,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
