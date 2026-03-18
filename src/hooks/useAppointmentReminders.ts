import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useAppointmentReminders() {
  const { user } = useAuth();

  const checkAndNotify = useCallback(async () => {
    if (!user || Notification.permission !== "granted") return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const today = new Date().toISOString().split("T")[0];

    const { data: bookings } = await supabase
      .from("bookings")
      .select("booking_date, booking_time, professionals(display_name), services(name)")
      .eq("user_id", user.id)
      .in("status", ["confirmed", "pending"])
      .gte("booking_date", today)
      .lte("booking_date", tomorrowStr)
      .order("booking_date", { ascending: true })
      .limit(5);

    if (!bookings || bookings.length === 0) return;

    // Check if we already notified today (avoid spam)
    const lastNotified = localStorage.getItem("last_reminder_date");
    const nowDate = new Date().toISOString().split("T")[0];
    if (lastNotified === nowDate) return;
    localStorage.setItem("last_reminder_date", nowDate);

    for (const b of bookings) {
      const prof = (b as any).professionals?.display_name ?? "your provider";
      const service = (b as any).services?.name ?? "appointment";
      const isToday = b.booking_date === today;

      new Notification("Appointment Reminder 🏥", {
        body: `${isToday ? "Today" : "Tomorrow"} at ${b.booking_time} — ${service} with ${prof}`,
        icon: "/pwa-icon-192.png",
        tag: `reminder-${b.booking_date}-${b.booking_time}`,
      });
    }
  }, [user]);

  useEffect(() => {
    // Check on mount and every 30 minutes
    checkAndNotify();
    const interval = setInterval(checkAndNotify, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkAndNotify]);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "unsupported";
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      checkAndNotify();
    }
    return permission;
  }, [checkAndNotify]);

  return {
    permission: typeof Notification !== "undefined" ? Notification.permission : "unsupported",
    requestPermission,
  };
}
