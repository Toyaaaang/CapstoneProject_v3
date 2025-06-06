"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Trash2, CheckCircle2 } from "lucide-react";
import { useNotifications } from "@/components/providers/NotificationProvider"; // ✅ from context
import { formatDistanceToNow } from "date-fns";

export default function SidebarNotifications() {
  const {
    notifications = [],
    loading,
    error,
    isAuthenticated,
    markAsRead,
    deleteNotification,
    clearAllNotifications,
    markAllAsRead,
  } = useNotifications();

  if (isAuthenticated === false) {
    // Not authenticated, don't show notifications
    return null;
  }

  if (isAuthenticated === null) {
    // Still checking auth, optionally show a loader or nothing
    return null;
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className="h-10 w-10" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-100 p-2 mr-6">
        {loading ? (
          <DropdownMenuItem disabled className="text-gray-500">
            Loading notifications...
          </DropdownMenuItem>
        ) : error ? (
          <DropdownMenuItem disabled className="text-red-500">
            Error: {error}
          </DropdownMenuItem>
        ) : notifications.length === 0 ? (
          <DropdownMenuItem disabled className="text-gray-500">
            No notifications
          </DropdownMenuItem>
        ) : (
          <>
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onSelect={(e) => e.preventDefault()}
                className={`flex items-center justify-between space-x-2 p-2 rounded-md ${
                  notification.is_read ? "text-gray-500" : "font-bold"
                }`}
              >
                <div
                  className="flex items-center space-x-2 flex-grow cursor-pointer"
                  onClick={() => markAsRead(notification.id)}
                >
                  {!notification.is_read && (
                    <span className="h-2 w-2 bg-red-500 rounded-full flex-shrink-0"></span>
                  )}
                  <span>{notification.message}</span>
                </div>
                <div className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(notification.created_at))} ago
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-red-100 p-1"
                  onClick={() => deleteNotification(notification.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </DropdownMenuItem>
            ))}

            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="flex justify-center mt-2"
            >
              <Button
                variant="ghost"
                className="text-green-600 w-full"
                onClick={markAllAsRead}
              >
                <CheckCircle2 className="w-full h-4 mr-1" />
                Mark All as Read
              </Button>
            </DropdownMenuItem>

            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="flex justify-center"
            >
              <Button
                variant="ghost"
                className="text-red-500 w-full"
                onClick={clearAllNotifications}
              >
                <Trash2 className="w-full h-4 mr-1" />
                Clear All
              </Button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
