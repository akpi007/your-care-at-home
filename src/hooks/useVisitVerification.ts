import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VisitVerification {
  id: string;
  booking_id: string;
  professional_id: string;
  phase: string;
  photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export function useVisitVerifications(bookingId?: string) {
  return useQuery({
    queryKey: ["visit-verifications", bookingId],
    queryFn: async (): Promise<VisitVerification[]> => {
      const { data, error } = await supabase
        .from("visit_verifications")
        .select("*")
        .eq("booking_id", bookingId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!bookingId,
  });
}

export function useRecordVisitVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      bookingId,
      professionalId,
      phase,
      file,
    }: {
      bookingId: string;
      professionalId: string;
      phase: "start" | "finish";
      file?: File | null;
    }) => {
      let photoPath: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${bookingId}/${phase}-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("visit-photos").upload(path, file);
        if (upErr) throw upErr;
        photoPath = path;
      }

      const coords = await new Promise<{ lat: number | null; lng: number | null }>((resolve) => {
        if (!navigator.geolocation) return resolve({ lat: null, lng: null });
        navigator.geolocation.getCurrentPosition(
          (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
          () => resolve({ lat: null, lng: null }),
          { timeout: 8000 },
        );
      });

      const { error } = await supabase.from("visit_verifications").insert({
        booking_id: bookingId,
        professional_id: professionalId,
        phase,
        photo_url: photoPath,
        latitude: coords.lat,
        longitude: coords.lng,
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["visit-verifications", vars.bookingId] });
    },
  });
}

export function useSignedVisitPhoto(path: string | null) {
  return useQuery({
    queryKey: ["visit-photo", path],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("visit-photos")
        .createSignedUrl(path!, 60 * 10);
      if (error) throw error;
      return data.signedUrl;
    },
    enabled: !!path,
  });
}
