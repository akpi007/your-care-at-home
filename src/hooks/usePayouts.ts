import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const PAYOUT_STATUS_LABELS: Record<string, string> = {
  requested: "Requested",
  approved: "Approved",
  paid: "Paid",
  rejected: "Rejected",
};

export const PAYOUT_STATUS_COLORS: Record<string, string> = {
  requested: "bg-healthcare-warm text-amber-700",
  approved: "bg-primary/10 text-primary",
  paid: "bg-healthcare-soft-green text-healthcare-green",
  rejected: "bg-destructive/10 text-destructive",
};

/** Payout requests for the signed-in professional. */
export function useMyPayouts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-payouts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payout_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useRequestPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      professionalId: string;
      amount: number;
      method: string;
      destination: string;
    }) => {
      const { error } = await supabase.from("payout_requests").insert({
        professional_id: input.professionalId,
        amount: input.amount,
        method: input.method,
        destination: input.destination,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
    },
  });
}

/** All payout requests — admin only (RLS restricts non-admins to their own). */
export function useAdminPayouts() {
  return useQuery({
    queryKey: ["admin-payouts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payout_requests")
        .select("*, professionals(display_name, specialization)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useProcessPayout() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; status: "approved" | "paid" | "rejected"; adminNote?: string }) => {
      const { error } = await supabase
        .from("payout_requests")
        .update({
          status: input.status,
          admin_note: input.adminNote ?? null,
          processed_by: user?.id ?? null,
          processed_at: new Date().toISOString(),
        })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["my-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
  });
}
