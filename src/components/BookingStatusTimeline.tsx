import { cn } from "@/lib/utils";
import {
  BOOKING_STATUS_FLOW,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_ICONS,
  getStatusIndex,
  type BookingStatus,
} from "@/lib/bookingStatus";
import { XCircle } from "lucide-react";

interface BookingStatusTimelineProps {
  status: string;
}

const BookingStatusTimeline = ({ status }: BookingStatusTimelineProps) => {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
        <XCircle className="h-5 w-5" />
        <span className="text-sm font-medium">Booking cancelled</span>
      </div>
    );
  }

  const currentIdx = getStatusIndex(status);
  const effectiveIdx = currentIdx === -1 ? -1 : currentIdx; // pending = -1 → nothing reached yet

  return (
    <div className="rounded-lg border border-border bg-card/50 p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Booking progress
      </p>
      <ol className="space-y-3">
        {BOOKING_STATUS_FLOW.map((step, idx) => {
          const Icon = BOOKING_STATUS_ICONS[step as BookingStatus];
          const reached = idx <= effectiveIdx;
          const isCurrent = idx === effectiveIdx;
          return (
            <li key={step} className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  reached
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground",
                  isCurrent && "ring-4 ring-primary/20 animate-pulse"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p
                  className={cn(
                    "text-sm",
                    reached ? "font-medium text-foreground" : "text-muted-foreground"
                  )}
                >
                  {BOOKING_STATUS_LABELS[step as BookingStatus]}
                </p>
                {isCurrent && (
                  <p className="text-xs text-primary">Current</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default BookingStatusTimeline;
