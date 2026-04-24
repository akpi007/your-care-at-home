import { CheckCircle2, UserCheck, Car, MapPin, ClipboardCheck, Clock } from "lucide-react";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "assigned"
  | "on_the_way"
  | "arrived"
  | "completed"
  | "cancelled";

// Ordered timeline (cancelled is excluded — it's a terminal side path)
export const BOOKING_STATUS_FLOW: BookingStatus[] = [
  "confirmed",
  "assigned",
  "on_the_way",
  "arrived",
  "completed",
];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  assigned: "Professional assigned",
  on_the_way: "On the way",
  arrived: "Arrived",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const BOOKING_STATUS_SHORT_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  assigned: "Assigned",
  on_the_way: "On the way",
  arrived: "Arrived",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const BOOKING_STATUS_ICONS: Record<BookingStatus, typeof CheckCircle2> = {
  pending: Clock,
  confirmed: CheckCircle2,
  assigned: UserCheck,
  on_the_way: Car,
  arrived: MapPin,
  completed: ClipboardCheck,
  cancelled: Clock,
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "bg-healthcare-warm text-amber-700",
  confirmed: "bg-healthcare-soft-green text-healthcare-green",
  assigned: "bg-primary/10 text-primary",
  on_the_way: "bg-blue-100 text-blue-700",
  arrived: "bg-purple-100 text-purple-700",
  completed: "bg-secondary text-secondary-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

export function getStatusIndex(status: string): number {
  return BOOKING_STATUS_FLOW.indexOf(status as BookingStatus);
}

// Active = booking is in-flight and patient should see live tracking option
export function isActiveBooking(status: string): boolean {
  return ["assigned", "on_the_way", "arrived"].includes(status);
}
