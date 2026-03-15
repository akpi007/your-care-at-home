import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ProviderProfile {
  id: string;
  displayName: string;
  specialization: string;
  verificationStatus: string;
  rating: number;
  totalReviews: number;
  yearsExperience: number;
  consultationFee: number;
  bio: string;
  available: boolean;
  licenseNumber: string;
  passportPhotoUrl: string;
  idProofUrl: string;
  city: string;
}

export interface ProviderBooking {
  id: string;
  bookingDate: string;
  bookingTime: string;
  status: string;
  symptomsNotes: string | null;
  address: string | null;
  patientName: string;
  serviceName: string;
}

export function useProviderProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["provider-profile", user?.id],
    queryFn: async (): Promise<ProviderProfile | null> => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("professionals")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        displayName: data.display_name ?? "",
        specialization: data.specialization ?? "",
        verificationStatus: data.verification_status ?? "pending",
        rating: Number(data.rating) || 0,
        totalReviews: data.total_reviews ?? 0,
        yearsExperience: data.years_experience ?? 0,
        consultationFee: Number(data.consultation_fee) || 0,
        bio: data.bio ?? "",
        available: data.available ?? true,
        licenseNumber: data.license_number ?? "",
        passportPhotoUrl: (data as any).passport_photo_url ?? "",
        idProofUrl: (data as any).id_proof_url ?? "",
        city: (data as any).city ?? "",
      };
    },
    enabled: !!user,
  });
}

export function useProviderBookings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["provider-bookings", user?.id],
    queryFn: async (): Promise<ProviderBooking[]> => {
      if (!user) return [];

      // Get professional id first
      const { data: prof } = await supabase
        .from("professionals")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!prof) return [];

      const { data, error } = await supabase
        .from("bookings")
        .select("*, patient_profiles(name), services(name)")
        .eq("professional_id", prof.id)
        .order("booking_date", { ascending: false });

      if (error) throw error;

      return (data ?? []).map((b: any) => ({
        id: b.id,
        bookingDate: b.booking_date,
        bookingTime: b.booking_time,
        status: b.status,
        symptomsNotes: b.symptoms_notes,
        address: b.address,
        patientName: b.patient_profiles?.name ?? "Patient",
        serviceName: b.services?.name ?? "Service",
      }));
    },
    enabled: !!user,
  });
}

export function useProviderEarnings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["provider-earnings", user?.id],
    queryFn: async () => {
      if (!user) return { total: 0, pending: 0, paid: 0 };

      const { data: prof } = await supabase
        .from("professionals")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!prof) return { total: 0, pending: 0, paid: 0 };

      const { data, error } = await supabase
        .from("earnings")
        .select("amount, payout_status")
        .eq("professional_id", prof.id);

      if (error) throw error;

      const total = (data ?? []).reduce((s, e) => s + Number(e.amount), 0);
      const pending = (data ?? []).filter((e) => e.payout_status === "pending").reduce((s, e) => s + Number(e.amount), 0);
      const paid = (data ?? []).filter((e) => e.payout_status === "paid").reduce((s, e) => s + Number(e.amount), 0);

      return { total, pending, paid };
    },
    enabled: !!user,
  });
}
