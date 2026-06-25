"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InAppNotification {
  id: string;
  type: "order" | "payment" | "delivery" | "alert" | "error" | "promotion";
  title: string;
  body: string;
  time: string;
  read: boolean;
  href?: string;
}

const typeColors: Record<InAppNotification["type"], string> = {
  order: "bg-kauvex-orange",
  payment: "bg-brand-success",
  delivery: "bg-brand-info",
  alert: "bg-brand-warning",
  error: "bg-brand-error",
  promotion: "bg-violet",
};

const typeIcons: Record<InAppNotification["type"], string> = {
  order: "📦",
  payment: "💳",
  delivery: "🚴",
  alert: "⚠️",
  error: "❌",
  promotion: "🎉",
};

interface NotificationCentreProps {
  notifications: InAppNotification[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  className?: string;
}

export function NotificationCentre({
  notifications,
  onMarkRead,
  onMarkAllRead,
  className,
}: NotificationCentreProps) {
  const [filter, setFilter] = React.useState<string>("all");

  const filters = ["all", "order", "payment", "delivery", "alert", "error", "promotion"] as const;

  const filtered = filter === "all"
    ? notifications
    : notifications.filter((n) => n.type === filter);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={cn("w-full max-w-md", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-kauvex-navy">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-kauvex-orange rounded-full">
              {unreadCount}
            </span>
          )}
        </h2>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-sm text-kauvex-orange hover:text-kauvex-orange-dark font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="flex gap-1 mb-4 overflow-x-auto hide-scrollbar">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors",
              filter === f
                ? "bg-kauvex-navy text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No notifications
          </div>
        )}
        {filtered.map((notification) => (
          <button
            key={notification.id}
            onClick={() => onMarkRead?.(notification.id)}
            className={cn(
              "w-full text-left flex items-start gap-3 p-3 rounded-lg transition-colors",
              notification.read ? "bg-white" : "bg-gray-50",
              "hover:bg-gray-50 border border-transparent hover:border-gray-200"
            )}
          >
            <div
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm",
                typeColors[notification.type]
              )}
            >
              {typeIcons[notification.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p
                  className={cn(
                    "text-sm font-semibold truncate",
                    notification.read ? "text-gray-600" : "text-kauvex-navy"
                  )}
                >
                  {notification.title}
                </p>
                {!notification.read && (
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-kauvex-orange" />
                )}
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {notification.body}
              </p>
              <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
