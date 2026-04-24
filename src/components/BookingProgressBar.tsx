import { cn } from "@/lib/utils";
import {
  BOOKING_STATUS_FLOW,
  BOOKING_STATUS_SHORT_LABELS,
  getStatusIndex,
  type BookingStatus,
} from "@/lib/bookingStatus";

interface BookingProgressBarProps {
  status: string;
  className?: string;
}

/**
 * Compact horizontal progress indicator for booking cards.
 * Shows dots+connectors for each stage of the flow with the current
 * stage highlighted. Hidden for pending / cancelled.
 */
const BookingProgressBar = ({ status, className }: BookingProgressBarProps) => {
  if (status === "cancelled" || status === "pending") return null;

  const currentIdx = getStatusIndex(status);
  const pct =
    currentIdx < 0
      ? 0
      : (currentIdx / (BOOKING_STATUS_FLOW.length - 1)) * 100;

  return (
    <div className={cn("w-full", className)}>
      <div className="relative h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between">
        {BOOKING_STATUS_FLOW.map((step, idx) => {
          const reached = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <span
              key={step}
              className={cn(
                "text-[10px] leading-tight",
                reached ? "text-foreground font-medium" : "text-muted-foreground",
                isCurrent && "text-primary"
              )}
            >
              {BOOKING_STATUS_SHORT_LABELS[step as BookingStatus]}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default BookingProgressBar;
