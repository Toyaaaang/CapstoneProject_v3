"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, Trash2 } from "lucide-react";
import useNotifications from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns"; // Import for time formatting

export default function SidebarNotifications() {
  const {
    notifications = [], // Default to an empty array if notifications is undefined
    loading,
    error,
    markAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

  // console.log("Notifications in SidebarNotifications:", notifications); // Debugging log

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
                className={`flex items-center justify-between space-x-2 p-2 rounded-md ${
                  notification.is_read ? "text-gray-500" : "font-bold"
                }`}
              >
                <div
                  className="flex items-center space-x-2 flex-grow cursor-pointer"
                  onClick={() => markAsRead(notification.id)} // Mark as read on click
                >
                  {!notification.is_read && (
                    <span className="h-2 w-2 bg-red-500 rounded-full flex-shrink-0"></span>
                  )}
                  <span>{notification.message}</span>
                </div>
                <div className="text-xs text-gray-400">
                  {/* Display the time passed since creation */}
                  {formatDistanceToNow(new Date(notification.created_at))} ago
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-red-100 p-1"
                  onClick={() => deleteNotification(notification.id)} // Delete notification
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem className="flex justify-center mt-2">
              <Button
                variant="ghost"
                className="text-red-500 hover:bg-red-100"
                onClick={clearAllNotifications} // Clear all notifications
              >
                Clear All
              </Button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
