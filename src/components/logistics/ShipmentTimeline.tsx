"use client";

import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Circle,
  Package,
  MapPin,
  Truck,
  Warehouse,
  Globe,
  Home,
  Loader2,
  AlertCircle,
} from "lucide-react";

export interface TimelineEvent {
  id: string;
  status: string;
  location?: string;
  timestamp: Date;
  description?: string;
  type: "order" | "pickup" | "hub" | "transit" | "customs" | "delivery";
  statusType: "completed" | "in_progress" | "pending" | "failed";
}

interface ShipmentTimelineProps {
  shipmentId: string;
  events?: TimelineEvent[];
}

const STATUS_ICONS: Record<TimelineEvent["type"], typeof Package> = {
  order: Package,
  pickup: MapPin,
  hub: Warehouse,
  transit: Truck,
  customs: Globe,
  delivery: Home,
};

const STATUS_BADGE: Record<TimelineEvent["statusType"], { label: string; variant: "success" | "warning" | "default" | "outline" }> = {
  completed: { label: "Completed", variant: "success" },
  in_progress: { label: "In Progress", variant: "warning" },
  pending: { label: "Pending", variant: "outline" },
  failed: { label: "Failed", variant: "default" },
};

const TYPE_LABELS: Record<TimelineEvent["type"], string> = {
  order: "Order",
  pickup: "Pickup",
  hub: "Hub",
  transit: "Transit",
  customs: "Customs",
  delivery: "Delivery",
};

function StatusIndicatorIcon({
  statusType,
  className,
}: {
  statusType: TimelineEvent["statusType"];
  className?: string;
}) {
  if (statusType === "completed") return <CheckCircle2 className={cn("text-success", className)} />;
  if (statusType === "failed") return <XCircle className={cn("text-red-500", className)} />;
  if (statusType === "in_progress") return <Clock className={cn("text-orange", className)} />;
  return <Circle className={cn("text-text-4", className)} />;
}

function TimelineConnector({ isLast }: { isLast: boolean }) {
  return (
    <div className={cn("absolute left-[19px] top-9 w-0.5 bg-border", isLast ? "h-0" : "h-full")} />
  );
}

function TimelineEventCard({ event, isLast }: { event: TimelineEvent; isLast: boolean }) {
  const TypeIcon = STATUS_ICONS[event.type];
  const badge = STATUS_BADGE[event.statusType];

  return (
    <div className="relative flex gap-4 pb-8 last:pb-0">
      <TimelineConnector isLast={isLast} />

      <div className="relative z-10 flex flex-col items-center">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-sm transition-colors",
            event.statusType === "completed" && "bg-success/10",
            event.statusType === "in_progress" && "bg-orange/10",
            event.statusType === "failed" && "bg-red-50",
            event.statusType === "pending" && "bg-gray-50"
          )}
        >
          <TypeIcon
            className={cn(
              "w-4 h-4",
              event.statusType === "completed" && "text-success",
              event.statusType === "in_progress" && "text-orange",
              event.statusType === "failed" && "text-red-500",
              event.statusType === "pending" && "text-text-4"
            )}
          />
        </div>
        <StatusIndicatorIcon
          statusType={event.statusType}
          className="w-3.5 h-3.5 -mt-1"
        />
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-1 truncate">
              {event.status}
            </p>
            {event.location && (
              <p className="text-xs text-text-4 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" />
                {event.location}
              </p>
            )}
          </div>
          <Badge variant={badge.variant} className="shrink-0 text-[10px] px-2 py-0.5">
            {badge.label}
          </Badge>
        </div>

        {event.description && (
          <p className="text-xs text-text-3 mt-1.5 leading-relaxed">
            {event.description}
          </p>
        )}

        <div className="flex items-center gap-2 mt-2">
          <span className="text-[11px] text-text-4 font-medium">
            {new Date(event.timestamp).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="text-text-4">·</span>
          <span className="text-[11px] text-text-4">
            {new Date(event.timestamp).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span className="text-text-4">·</span>
          <span className="text-[10px] font-medium text-text-4 uppercase tracking-wider">
            {TYPE_LABELS[event.type]}
          </span>
        </div>
      </div>
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/5" />
            <div className="h-3 bg-gray-100 rounded w-2/5" />
            <div className="h-3 bg-gray-100 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function fetchTimelineEvents(shipmentId: string): Promise<TimelineEvent[]> {
  const res = await fetch(`/api/v1/logistics/tracking?shipmentId=${encodeURIComponent(shipmentId)}`);
  if (!res.ok) throw new Error("Failed to fetch tracking events");
  const data = await res.json();
  return data.events ?? [];
}

export default function ShipmentTimeline({ shipmentId, events: propEvents }: ShipmentTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>(propEvents ?? []);
  const [loading, setLoading] = useState(!propEvents);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propEvents) {
      setEvents(propEvents);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchTimelineEvents(shipmentId)
      .then((data) => {
        if (!cancelled) setEvents(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "An error occurred");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [shipmentId, propEvents]);

  const merged = useMemo(() => {
    const byTimestamp = (a: TimelineEvent, b: TimelineEvent) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();

    const grouped = [...events].sort(byTimestamp);

    const mergedEvents: TimelineEvent[] = [];
    let pending: TimelineEvent | null = null;

    for (const event of grouped) {
      if (event.statusType === "in_progress") {
        mergedEvents.push(event);
        pending = null;
      } else if (event.statusType === "pending") {
        mergedEvents.push(event);
        pending = event;
      } else {
        if (pending && pending.type === event.type) {
          mergedEvents.pop();
        }
        mergedEvents.push(event);
        pending = null;
      }
    }

    return mergedEvents;
  }, [events]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-6">
          <Loader2 className="w-4 h-4 text-orange animate-spin" />
          <h3 className="text-sm font-semibold text-text-1">Loading timeline...</h3>
        </div>
        <TimelineSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-sm font-semibold text-text-1 mb-1">Failed to load tracking</p>
          <p className="text-xs text-text-4 mb-4">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchTimelineEvents(shipmentId)
                .then(setEvents)
                .catch((err) => setError(err instanceof Error ? err.message : "An error occurred"))
                .finally(() => setLoading(false));
            }}
            className="text-xs font-semibold text-orange hover:text-orange/80 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!merged.length) {
    return (
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Package className="w-6 h-6 text-text-4" />
          </div>
          <p className="text-sm font-semibold text-text-1">No tracking events yet</p>
          <p className="text-xs text-text-4 mt-1">
            Tracking updates will appear here once the shipment is processed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-text-1">Shipment Timeline</h3>
        <span className="text-[11px] text-text-4 font-medium">
          {merged.length} {merged.length === 1 ? "event" : "events"}
        </span>
      </div>
      <div className="relative">
        {merged.map((event, i) => (
          <TimelineEventCard key={event.id} event={event} isLast={i === merged.length - 1} />
        ))}
      </div>
    </div>
  );
}
