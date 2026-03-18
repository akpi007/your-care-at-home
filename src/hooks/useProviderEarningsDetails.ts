import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface EarningRecord {
  id: string;
  amount: number;
  commission: number;
  netAmount: number;
  payoutStatus: string;
  createdAt: string;
  bookingDate: string;
  patientName: string;
  serviceName: string;
}

export interface MonthlyRevenue {
  month: string;
  gross: number;
  commission: number;
  net: number;
}

export function useProviderEarningsDetails() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["provider-earnings-details", user?.id],
    queryFn: async () => {
      if (!user) return { records: [], monthly: [], summary: { total: 0, commission: 0, net: 0, pending: 0, paid: 0 } };

      const { data: prof } = await supabase
        .from("professionals")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!prof) return { records: [], monthly: [], summary: { total: 0, commission: 0, net: 0, pending: 0, paid: 0 } };

      const { data, error } = await supabase
        .from("earnings")
        .select("*, bookings(booking_date, patient_profiles(name), services(name))")
        .eq("professional_id", prof.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const records: EarningRecord[] = (data ?? []).map((e: any) => ({
        id: e.id,
        amount: Number(e.amount),
        commission: Number(e.commission ?? 0),
        netAmount: Number(e.amount) - Number(e.commission ?? 0),
        payoutStatus: e.payout_status ?? "pending",
        createdAt: e.created_at,
        bookingDate: e.bookings?.booking_date ?? "",
        patientName: e.bookings?.patient_profiles?.name ?? "Patient",
        serviceName: e.bookings?.services?.name ?? "Service",
      }));

      // Build monthly aggregation
      const monthMap = new Map<string, { gross: number; commission: number; net: number }>();
      records.forEach((r) => {
        const d = new Date(r.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const existing = monthMap.get(key) ?? { gross: 0, commission: 0, net: 0 };
        existing.gross += r.amount;
        existing.commission += r.commission;
        existing.net += r.netAmount;
        monthMap.set(key, existing);
      });

      const monthly: MonthlyRevenue[] = Array.from(monthMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([month, vals]) => ({
          month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
          ...vals,
        }));

      const total = records.reduce((s, r) => s + r.amount, 0);
      const commission = records.reduce((s, r) => s + r.commission, 0);
      const net = total - commission;
      const pending = records.filter((r) => r.payoutStatus === "pending").reduce((s, r) => s + r.netAmount, 0);
      const paid = records.filter((r) => r.payoutStatus === "paid").reduce((s, r) => s + r.netAmount, 0);

      return { records, monthly, summary: { total, commission, net, pending, paid } };
    },
    enabled: !!user,
  });
}
