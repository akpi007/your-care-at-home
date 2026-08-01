import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileCheck, Loader2, Upload } from "lucide-react";
import {
  DOC_TYPES,
  useProviderDocuments,
  useUploadProviderDocument,
} from "@/hooks/useProviderDocuments";
import { useToast } from "@/hooks/use-toast";

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-healthcare-green/15 text-healthcare-green",
  pending: "bg-amber-500/15 text-amber-600",
  rejected: "bg-destructive/15 text-destructive",
};

const ProviderDocumentsPanel = ({ professionalId }: { professionalId?: string }) => {
  const { data: docs = [], isLoading } = useProviderDocuments(professionalId);
  const upload = useUploadProviderDocument(professionalId);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeType, setActiveType] = useState<string>(DOC_TYPES[0].key);
  const [expiry, setExpiry] = useState("");

  const latest = (key: string) => docs.find((d) => d.doc_type === key);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    try {
      await upload.mutateAsync({ file, docType: activeType, expiresAt: expiry || null });
      toast({ title: "Document uploaded", description: "An admin will review it shortly." });
      setExpiry("");
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="rounded-xl bg-card p-5 shadow-card">
      <div className="flex items-center gap-2">
        <FileCheck className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-semibold text-foreground">Background checks</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Upload each document below. Verification is only completed once all required documents are
        approved.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {DOC_TYPES.map((t) => {
            const doc = latest(t.key);
            return (
              <li
                key={t.key}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{t.label}</p>
                  {doc?.expires_at && (
                    <p className="text-xs text-muted-foreground">Expires {doc.expires_at}</p>
                  )}
                  {doc?.note && <p className="text-xs text-destructive">{doc.note}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={STATUS_STYLES[doc?.status ?? ""] ?? "bg-muted text-muted-foreground"}>
                    {doc?.status ?? "not uploaded"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={upload.isPending || !professionalId}
                    onClick={() => {
                      setActiveType(t.key);
                      setTimeout(() => inputRef.current?.click(), 0);
                    }}
                  >
                    <Upload className="mr-1 h-3.5 w-3.5" />
                    {doc ? "Replace" : "Upload"}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-4 max-w-xs">
        <Label htmlFor="doc-expiry" className="text-xs">
          Expiry date (licences only, optional)
        </Label>
        <Input
          id="doc-expiry"
          type="date"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          className="mt-1"
        />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
};

export default ProviderDocumentsPanel;
