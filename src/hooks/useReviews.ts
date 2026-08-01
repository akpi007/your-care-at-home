import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/** Booking ids the signed-in patient has already reviewed. */
export function useMyReviewedBookingIds() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["my-reviews", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("booking_id");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  return new Set((query.data ?? []).map((r) => r.booking_id));
}

export function useLeaveReview() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      bookingId: string;
      professionalId: string;
      rating: number;
      comment?: string;
    }) => {
      if (!user) throw new Error("Please sign in to leave a review.");
      const { error } = await supabase.from("reviews").insert({
        booking_id: input.bookingId,
        patient_id: user.id,
        professional_id: input.professionalId,
        rating: input.rating,
        comment: input.comment ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
    },
  });
}
