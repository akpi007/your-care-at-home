import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { BOOKING_STATUS_LABELS } from "@/lib/bookingStatus";

export function useBookings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ["bookings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          "*, professionals(user_id, display_name, image_url, specialization, consultation_fee), services(name)",
        )
        .eq("user_id", user!.id)
        .order("booking_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  // Realtime: live status updates for the patient's own bookings
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`bookings-patient-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newRow: any = payload.new;
          const oldRow: any = payload.old;
          if (newRow?.status && newRow.status !== oldRow?.status) {
            const label =
              BOOKING_STATUS_LABELS[newRow.status as keyof typeof BOOKING_STATUS_LABELS] ??
              newRow.status;
            toast({
              title: "Booking update",
              description: `Status changed to: ${label}`,
            });
          }
          queryClient.invalidateQueries({ queryKey: ["bookings", user.id] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookings",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["bookings", user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, toast]);

  return query;
}

interface CreateBookingInput {
  professional_id: string;
  service_id: string;
  patient_profile_id: string;
  booking_date: string;
  booking_time: string;
  address?: string;
  symptoms_notes?: string;
  latitude?: number;
  longitude?: number;
}

export function useCreateBooking() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBookingInput) => {
      const { data, error } = await supabase
        .from("bookings")
        .insert({ ...input, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
