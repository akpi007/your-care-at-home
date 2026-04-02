import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Professional {
  id: string;
  name: string;
  specialization: string;
  service: string;
  serviceId: string;
  rating: number;
  reviews: number;
  experience: number;
  fee: number;
  imageUrl: string;
  available: boolean;
  bio: string;
  city: string;
}

async function fetchProfessionals(): Promise<Professional[]> {
  const { data, error } = await supabase
    .from("professionals_public" as any)
    .select("*, services(name)")
    .eq("verification_status", "verified")
    .order("rating", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((p: any) => ({
    id: p.id,
    name: p.display_name ?? p.specialization ?? "Unknown",
    specialization: p.specialization ?? "",
    service: p.services?.name ?? "",
    serviceId: p.service_id ?? "",
    rating: Number(p.rating) || 0,
    reviews: p.total_reviews ?? 0,
    experience: p.years_experience ?? 0,
    fee: Number(p.consultation_fee) || 0,
    imageUrl: p.image_url ?? "/placeholder.svg",
    available: p.available ?? true,
    bio: p.bio ?? "",
    city: p.city ?? "",
  }));
}

export function useProfessionals() {
  return useQuery({
    queryKey: ["professionals"],
    queryFn: fetchProfessionals,
  });
}

export function useProfessional(id: string | undefined) {
  return useQuery({
    queryKey: ["professional", id],
    queryFn: async (): Promise<Professional | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("professionals_public" as any)
        .select("*, services(name)")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      const p = data as any;

      return {
        id: data.id,
        name: data.display_name ?? data.specialization ?? "Unknown",
        specialization: data.specialization ?? "",
        service: (data as any).services?.name ?? "",
        serviceId: data.service_id ?? "",
        rating: Number(data.rating) || 0,
        reviews: data.total_reviews ?? 0,
        experience: data.years_experience ?? 0,
        fee: Number(data.consultation_fee) || 0,
        imageUrl: data.image_url ?? "/placeholder.svg",
        available: data.available ?? true,
        bio: data.bio ?? "",
        city: (data as any).city ?? "",
      };
    },
    enabled: !!id,
  });
}
