import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const DOC_TYPES = [
  { key: "national_id", label: "National ID / Passport" },
  { key: "practising_licence", label: "Practising licence" },
  { key: "qualification", label: "Qualification certificate" },
  { key: "police_clearance", label: "Police clearance" },
  { key: "reference_letter", label: "Reference letter" },
] as const;

export interface ProviderDocument {
  id: string;
  professional_id: string;
  doc_type: string;
  document_url: string | null;
  status: string;
  note: string | null;
  expires_at: string | null;
  created_at: string;
}

export function useProviderDocuments(professionalId?: string) {
  return useQuery({
    queryKey: ["provider-documents", professionalId],
    queryFn: async (): Promise<ProviderDocument[]> => {
      const { data, error } = await supabase
        .from("professional_documents")
        .select("*")
        .eq("professional_id", professionalId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!professionalId,
  });
}

export function useUploadProviderDocument(professionalId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      file,
      docType,
      expiresAt,
    }: {
      file: File;
      docType: string;
      expiresAt?: string | null;
    }) => {
      if (!professionalId) throw new Error("Missing professional profile");
      const ext = file.name.split(".").pop() ?? "pdf";
      const path = `${professionalId}/${docType}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("provider-documents")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;

      const { error } = await supabase.from("professional_documents").insert({
        professional_id: professionalId,
        doc_type: docType,
        document_url: path,
        expires_at: expiresAt || null,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["provider-documents", professionalId] });
      qc.invalidateQueries({ queryKey: ["admin-provider-documents"] });
    },
  });
}

export function useAdminProviderDocuments() {
  return useQuery({
    queryKey: ["admin-provider-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("professional_documents")
        .select("*, professionals(display_name, specialization)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useReviewProviderDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note?: string }) => {
      const { data: userRes } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("professional_documents")
        .update({
          status,
          note: note ?? null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: userRes.user?.id ?? null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-provider-documents"] });
      qc.invalidateQueries({ queryKey: ["provider-documents"] });
    },
  });
}
