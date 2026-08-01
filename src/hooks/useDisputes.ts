import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const DISPUTE_CATEGORIES = [
  { value: "no_show", label: "Professional did not show up" },
  { value: "service_not_delivered", label: "Service was not delivered" },
  { value: "quality", label: "Quality of care" },
  { value: "billing", label: "Billing or amount charged" },
  { value: "conduct", label: "Professional conduct" },
  { value: "other", label: "Something else" },
] as const;

export const DISPUTE_STATUS_LABELS: Record<string, string> = {
  open: "Open",
  under_review: "Under review",
  resolved: "Resolved",
  rejected: "Closed",
};

export const DISPUTE_STATUS_COLORS: Record<string, string> = {
  open: "bg-healthcare-warm text-amber-700",
  under_review: "bg-primary/10 text-primary",
  resolved: "bg-healthcare-soft-green text-healthcare-green",
  rejected: "bg-muted text-muted-foreground",
};

/** Disputes raised by the signed-in patient. */
export function useMyDisputes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-disputes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("disputes")
        .select("*, bookings(booking_date, booking_time, professionals(display_name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useRaiseDispute() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { bookingId: string; category: string; description: string; evidenceUrl?: string | null }) => {
      if (!user) throw new Error("You must be signed in to raise a dispute.");
      const { error } = await supabase.from("disputes").insert({
        booking_id: input.bookingId,
        raised_by: user.id,
        category: input.category,
        description: input.description,
        evidence_url: input.evidenceUrl ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-disputes"] });
      queryClient.invalidateQueries({ queryKey: ["admin-disputes"] });
    },
  });
}

/** All disputes — admin only (RLS restricts non-admins to their own). */
export function useAdminDisputes() {
  return useQuery({
    queryKey: ["admin-disputes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("disputes")
        .select("*, bookings(booking_date, booking_time, address), professionals(display_name, specialization)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useResolveDispute() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      status: "under_review" | "resolved" | "rejected";
      resolutionNote?: string;
      refundAmount?: number;
    }) => {
      const closing = input.status !== "under_review";
      const patch = {
        status: input.status,
        ...(closing
          ? {
              resolution_note: input.resolutionNote ?? null,
              refund_amount: input.refundAmount ?? 0,
              resolved_by: user?.id ?? null,
              resolved_at: new Date().toISOString(),
            }
          : {}),
      };
      const { error } = await supabase.from("disputes").update(patch).eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-disputes"] });
      queryClient.invalidateQueries({ queryKey: ["my-disputes"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
  });
}
