import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const REPORT_REASONS = [
  { value: "harassment", label: "Harassment or abusive language" },
  { value: "unprofessional", label: "Unprofessional behaviour" },
  { value: "safety", label: "Safety concern" },
  { value: "fraud", label: "Fraud or scam attempt" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Other" },
] as const;

export function useReportUser() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      reportedUserId: string;
      bookingId?: string | null;
      reason: string;
      details?: string;
    }) => {
      if (!user) throw new Error("You must be signed in to report a user.");
      const { error } = await supabase.from("user_reports").insert({
        reporter_id: user.id,
        reported_user_id: input.reportedUserId,
        booking_id: input.bookingId ?? null,
        reason: input.reason,
        details: input.details ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
  });
}

export function useBlockedUsers() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-blocks", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_blocks").select("*");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useBlockUser() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ blockedUserId, unblock }: { blockedUserId: string; unblock?: boolean }) => {
      if (!user) throw new Error("You must be signed in.");
      if (unblock) {
        const { error } = await supabase
          .from("user_blocks")
          .delete()
          .eq("blocker_id", user.id)
          .eq("blocked_user_id", blockedUserId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_blocks")
          .insert({ blocker_id: user.id, blocked_user_id: blockedUserId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-blocks"] });
    },
  });
}

/** All reports — admin only (RLS restricts non-admins to their own). */
export function useAdminReports() {
  return useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_reports")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useReviewReport() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; status: "reviewing" | "actioned" | "dismissed"; adminNote?: string }) => {
      const { error } = await supabase
        .from("user_reports")
        .update({
          status: input.status,
          admin_note: input.adminNote ?? null,
          reviewed_by: user?.id ?? null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
  });
}
