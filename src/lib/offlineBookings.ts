import { supabase } from "@/integrations/supabase/client";

const KEY = "rapha_pending_bookings";

export interface PendingBooking {
  localId: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export function getPendingBookings(): PendingBooking[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function queueBooking(payload: Record<string, unknown>) {
  const pending = getPendingBookings();
  pending.push({
    localId: crypto.randomUUID(),
    payload,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(KEY, JSON.stringify(pending));
}

function removePending(localId: string) {
  localStorage.setItem(
    KEY,
    JSON.stringify(getPendingBookings().filter((p) => p.localId !== localId)),
  );
}

/** Attempts to submit any bookings that were created while offline. */
export async function flushPendingBookings(): Promise<number> {
  const pending = getPendingBookings();
  if (pending.length === 0 || !navigator.onLine) return 0;

  let synced = 0;
  for (const item of pending) {
    const { error } = await supabase.from("bookings").insert(item.payload as any);
    if (!error) {
      removePending(item.localId);
      synced++;
    } else if (error.code && error.code.startsWith("23")) {
      // Permanent data error — drop it so it doesn't retry forever
      removePending(item.localId);
    }
  }
  return synced;
}

export function installOfflineBookingSync() {
  if (typeof window === "undefined") return;
  window.addEventListener("online", () => {
    void flushPendingBookings();
  });
  void flushPendingBookings();
}
