import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface RecurringBooking {
  id: string;
  professional_id: string;
  patient_profile_id: string;
  service_id: string | null;
  frequency: string;
  day_of_week: number;
  booking_time: string;
  start_date: string;
  end_date: string | null;
  address: string | null;
  notes: string | null;
  active: boolean;
  professionals?: { display_name: string | null; image_url: string | null } | null;
}

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function useRecurringBookings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["recurring-bookings", user?.id],
    queryFn: async (): Promise<RecurringBooking[]> => {
      const { data, error } = await supabase
        .from("recurring_bookings")
        .select("*, professionals(display_name, image_url)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any;
    },
    enabled: !!user,
  });
}

export function useCreateRecurringBooking() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      professional_id: string;
      patient_profile_id: string;
      service_id?: string | null;
      frequency: string;
      day_of_week: number;
      booking_time: string;
      start_date: string;
      end_date?: string | null;
      address?: string | null;
      notes?: string | null;
      latitude?: number | null;
      longitude?: number | null;
    }) => {
      if (!user) throw new Error("You must be signed in");
      const { error } = await supabase.from("recurring_bookings").insert({ ...input, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recurring-bookings", user?.id] }),
  });
}

export function useUpdateRecurringBooking() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("recurring_bookings").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recurring-bookings", user?.id] }),
  });
}
