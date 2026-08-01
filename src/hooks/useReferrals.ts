import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useMyReferral() {
  const { user } = useAuth();

  const codeQuery = useQuery({
    queryKey: ["my-referral-code", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data?.referral_code ?? null;
    },
    enabled: !!user,
  });

  const invitedQuery = useQuery({
    queryKey: ["my-referrals", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referrals")
        .select("id, code, status, created_at")
        .eq("referrer_user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  return { code: codeQuery.data ?? null, isLoading: codeQuery.isLoading, invited: invitedQuery.data ?? [] };
}

export function useApplyReferralCode() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (rawCode: string) => {
      const code = rawCode.trim().toUpperCase();
      if (!user) throw new Error("You must be signed in");
      if (!code) throw new Error("Enter a referral code");

      const { data: mine } = await supabase
        .from("profiles")
        .select("referral_code, referred_by")
        .eq("user_id", user.id)
        .maybeSingle();

      if (mine?.referred_by) throw new Error("You have already used a referral code");
      if (mine?.referral_code === code) throw new Error("You can't use your own code");

      const { data: referrer, error: refErr } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("referral_code", code)
        .maybeSingle();
      if (refErr) throw refErr;
      if (!referrer) throw new Error("That referral code doesn't exist");

      const { error: upErr } = await supabase
        .from("profiles")
        .update({ referred_by: code })
        .eq("user_id", user.id);
      if (upErr) throw upErr;

      const { error } = await supabase.from("referrals").insert({
        code,
        referrer_user_id: referrer.user_id,
        referred_user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-referral-code", user?.id] });
      qc.invalidateQueries({ queryKey: ["my-referrals", user?.id] });
    },
  });
}
