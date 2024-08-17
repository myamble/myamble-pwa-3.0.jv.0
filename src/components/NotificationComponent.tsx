// src/components/NotificationComponent.tsx
import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "~/components/shadcn/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useSSE } from "~/lib/hooks/useSSE";
import { api } from "~/trpc/react";

export const NotificationComponent: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const notifications = useSSE();
  const { data: initialNotifications, refetch } =
    api.notifications.getUnreadNotifications.useQuery();
  const markAsRead = api.notifications.markAsRead.useMutation();

  useEffect(() => {
    if (initialNotifications) {
      setUnreadCount(initialNotifications.length);
    }
  }, [initialNotifications]);

  useEffect(() => {
    if (notifications.length > 0) {
      setUnreadCount((prevCount) => prevCount + 1);
    }
  }, [notifications]);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead.mutateAsync({ id });
    setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
    refetch();
  };

  const allNotifications = [...(initialNotifications || []), ...notifications];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <h4 className="font-medium leading-none">Notifications</h4>
          {allNotifications.length > 0 ? (
            allNotifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-center justify-between space-x-4"
              >
                <div>{notification.content}</div>
                <Button
                  size="sm"
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  Mark as read
                </Button>
              </div>
            ))
          ) : (
            <p>No new notifications</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
