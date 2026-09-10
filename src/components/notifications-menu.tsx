"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationIcon } from "@/components/notification-icon";
import { useNotificationStore } from "@/stores/notification-store";
import { cn } from "@/lib/utils";
import { BellIcon, CheckCheckIcon } from "lucide-react";

export function NotificationsMenu() {
  const notifications = useNotificationStore((state) => state.notifications);
  const markRead = useNotificationStore((state) => state.markRead);
  const markAllRead = useNotificationStore((state) => state.markAllRead);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label={`Notifications (${unreadCount} unread)`}
            size="icon"
            variant="ghost"
            className="relative"
          />
        }
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-destructive px-0.5 font-medium text-[9px] leading-none text-white">
            {unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 overflow-hidden p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="flex items-center gap-2 font-medium text-sm">
            Notifications
            {unreadCount > 0 && (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-muted-foreground text-[10px] tabular-nums">
                {unreadCount} new
              </span>
            )}
          </p>
          <Button
            className="h-auto gap-1 px-1 text-muted-foreground text-xs"
            disabled={unreadCount === 0}
            onClick={markAllRead}
            size="sm"
            variant="ghost"
          >
            <CheckCheckIcon className="size-3.5" />
            Mark all as read
          </Button>
        </div>
        <div className="max-h-96 overflow-y-auto border-t">
          {notifications.map((notification) => (
            <DropdownMenuItem
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-none border-l-2 border-l-transparent px-4 py-3",
                "focus:bg-accent focus:text-accent-foreground",
                "not-last:border-b not-last:border-b-border/50",
                notification.unread &&
                  "border-l-primary bg-primary/5 focus:bg-primary/10",
              )}
              key={notification.id}
              onSelect={() => markRead(notification.id)}
            >
              <NotificationIcon type={notification.type} />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="flex items-center gap-2 font-medium text-sm">
                  {notification.title}
                  {notification.unread && (
                    <span className="ml-auto size-1.5 shrink-0 rounded-full bg-primary" />
                  )}
                </p>
                <p className="line-clamp-1 text-muted-foreground text-xs">
                  {notification.description}
                </p>
                <p className="text-muted-foreground/70 text-[11px]">
                  {notification.time}
                </p>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        <div className="border-t p-1">
          <button
            className="w-full rounded-lg px-3 py-2 text-center text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
            type="button"
          >
            View all notifications
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
