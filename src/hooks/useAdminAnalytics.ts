import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsPoint {
  label: string;
  bookings: number;
  revenue: number;
}

export interface CityBreakdown {
  city: string;
  providers: number;
  bookings: number;
}

function monthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const [bookingsRes, profsRes, earningsRes, disputesRes, payoutsRes] = await Promise.all([
        supabase.from("bookings").select("id, status, booking_date, created_at, professional_id"),
        supabase.from("professionals").select("id, city, verification_status, available, created_at"),
        supabase.from("earnings").select("amount, commission, payout_status, created_at"),
        supabase.from("disputes").select("id, status, refund_amount, created_at"),
        supabase.from("payout_requests").select("id, status, amount"),
      ]);

      const bookings = bookingsRes.data ?? [];
      const professionals = profsRes.data ?? [];
      const earnings = earningsRes.data ?? [];
      const disputes = disputesRes.data ?? [];
      const payouts = payoutsRes.data ?? [];

      // --- Monthly trend (last 6 months) ---
      const months: string[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
      }

      const monthly: AnalyticsPoint[] = months.map((m) => {
        const label = new Date(`${m}-01T00:00:00`).toLocaleString(undefined, { month: "short" });
        const b = bookings.filter((x) => x.created_at && monthKey(x.created_at) === m).length;
        const r = earnings
          .filter((x) => x.created_at && monthKey(x.created_at) === m)
          .reduce((sum, x) => sum + Number(x.amount ?? 0), 0);
        return { label, bookings: b, revenue: Math.round(r * 100) / 100 };
      });

      // --- City breakdown ---
      const cityMap = new Map<string, CityBreakdown>();
      for (const p of professionals) {
        const city = p.city?.trim() || "Unspecified";
        const entry = cityMap.get(city) ?? { city, providers: 0, bookings: 0 };
        entry.providers += 1;
        cityMap.set(city, entry);
      }
      const profCity = new Map(professionals.map((p) => [p.id, p.city?.trim() || "Unspecified"]));
      for (const b of bookings) {
        const city = profCity.get(b.professional_id) ?? "Unspecified";
        const entry = cityMap.get(city) ?? { city, providers: 0, bookings: 0 };
        entry.bookings += 1;
        cityMap.set(city, entry);
      }
      const byCity = [...cityMap.values()].sort((a, b) => b.bookings - a.bookings).slice(0, 8);

      // --- Status breakdown ---
      const statusCounts = bookings.reduce<Record<string, number>>((acc, b) => {
        acc[b.status] = (acc[b.status] ?? 0) + 1;
        return acc;
      }, {});

      const grossRevenue = earnings.reduce((s, e) => s + Number(e.amount ?? 0), 0);
      const commission = earnings.reduce((s, e) => s + Number(e.commission ?? 0), 0);
      const refunded = disputes.reduce((s, d) => s + Number(d.refund_amount ?? 0), 0);
      const completed = bookings.filter((b) => b.status === "completed").length;
      const cancelled = bookings.filter((b) => b.status === "cancelled").length;

      return {
        monthly,
        byCity,
        statusCounts,
        summary: {
          grossRevenue: Math.round(grossRevenue * 100) / 100,
          commission: Math.round(commission * 100) / 100,
          refunded: Math.round(refunded * 100) / 100,
          netRevenue: Math.round((commission - refunded) * 100) / 100,
          totalBookings: bookings.length,
          completed,
          cancelled,
          completionRate: bookings.length ? Math.round((completed / bookings.length) * 100) : 0,
          activeProviders: professionals.filter((p) => p.verification_status === "verified" && p.available).length,
          verifiedProviders: professionals.filter((p) => p.verification_status === "verified").length,
          openDisputes: disputes.filter((d) => ["open", "under_review"].includes(d.status)).length,
          pendingPayouts: payouts.filter((p) => p.status === "requested").length,
          pendingPayoutAmount:
            Math.round(
              payouts.filter((p) => p.status === "requested").reduce((s, p) => s + Number(p.amount ?? 0), 0) * 100,
            ) / 100,
        },
      };
    },
  });
}

export function useAdminErrorLogs() {
  return useQuery({
    queryKey: ["admin-error-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("error_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });
}
