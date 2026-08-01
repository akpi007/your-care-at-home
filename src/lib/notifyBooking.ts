import { supabase } from "@/integrations/supabase/client";

export type BookingSmsEvent =
  | "new_request"
  | "confirmed"
  | "assigned"
  | "on_the_way"
  | "arrived"
  | "completed"
  | "cancelled";

/** Fire-and-forget booking notification (SMS + in-app). Never throws. */
export async function notifyBooking(bookingId: string, event: BookingSmsEvent) {
  try {
    await supabase.functions.invoke("send-booking-sms", { body: { bookingId, event } });
  } catch (e) {
    console.error("Booking notification failed", e);
  }
}
