import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useIsAdmin() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      return !!data;
    },
    enabled: !!user,
  });
}

export function useAdminProfessionals() {
  return useQuery({
    queryKey: ["admin-professionals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("professionals")
        .select("*, services(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error: pError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (pError) throw pError;

      const { data: roles, error: rError } = await supabase
        .from("user_roles")
        .select("*");
      if (rError) throw rError;

      return (profiles ?? []).map((p: any) => ({
        ...p,
        roles: (roles ?? [])
          .filter((r: any) => r.user_id === p.user_id)
          .map((r: any) => r.role),
      }));
    },
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [profRes, bookRes, patientRes] = await Promise.all([
        supabase.from("professionals").select("id, verification_status"),
        supabase.from("bookings").select("id, status"),
        supabase.from("patient_profiles").select("id"),
      ]);

      const profs = profRes.data ?? [];
      const bookings = bookRes.data ?? [];
      const patients = patientRes.data ?? [];

      return {
        totalProfessionals: profs.length,
        pendingVerifications: profs.filter((p: any) => p.verification_status === "pending").length,
        verifiedProfessionals: profs.filter((p: any) => p.verification_status === "verified").length,
        totalBookings: bookings.length,
        activeBookings: bookings.filter((b: any) => ["pending", "confirmed"].includes(b.status)).length,
        totalPatients: patients.length,
      };
    },
  });
}
