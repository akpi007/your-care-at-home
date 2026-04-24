import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BookingLocation {
  booking_id: string;
  professional_id: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  is_sharing: boolean;
  updated_at: string;
}

/**
 * Subscribes to live location updates for a booking.
 * Returns latest location row (or null if provider isn't sharing).
 */
export function useBookingLocation(bookingId: string | null | undefined) {
  const [location, setLocation] = useState<BookingLocation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setLocation(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const fetchInitial = async () => {
      const { data } = await supabase
        .from("booking_locations")
        .select("*")
        .eq("booking_id", bookingId)
        .maybeSingle();
      if (!cancelled) {
        setLocation((data as BookingLocation) ?? null);
        setLoading(false);
      }
    };
    fetchInitial();

    const channel = supabase
      .channel(`booking-location-${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "booking_locations",
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setLocation(null);
          } else {
            setLocation(payload.new as BookingLocation);
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [bookingId]);

  return { location, loading };
}
