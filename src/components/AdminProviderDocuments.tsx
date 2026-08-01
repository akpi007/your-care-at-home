import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck, X } from "lucide-react";
import { useAdminProviderDocuments, useReviewProviderDocument } from "@/hooks/useProviderDocuments";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminProviderDocuments = () => {
  const { data: docs = [], isLoading } = useAdminProviderDocuments();
  const review = useReviewProviderDocument();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const openDoc = async (path: string | null) => {
    if (!path) return;
    const { data, error } = await supabase.storage
      .from("provider-documents")
      .createSignedUrl(path, 300);
    if (error) {
      toast({ title: "Could not open document", description: error.message, variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (docs.length === 0) {
    return <p className="py-12 text-center text-muted-foreground">No documents submitted yet.</p>;
  }

  return (
    <div className="space-y-3">
      {docs.map((d: any) => (
        <div key={d.id} className="rounded-xl bg-card p-4 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-card-foreground">
                {d.professionals?.display_name ?? "Provider"}
              </p>
              <p className="text-sm text-muted-foreground">
                {d.doc_type.replace(/_/g, " ")}
                {d.expires_at ? ` · expires ${d.expires_at}` : ""}
              </p>
            </div>
            <Badge
              className={
                d.status === "approved"
                  ? "bg-healthcare-green/15 text-healthcare-green"
                  : d.status === "rejected"
                    ? "bg-destructive/15 text-destructive"
                    : "bg-amber-500/15 text-amber-600"
              }
            >
              {d.status}
            </Badge>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => openDoc(d.document_url)}>
              View document
            </Button>
            <Input
              placeholder="Note (required to reject)"
              value={notes[d.id] ?? ""}
              onChange={(e) => setNotes((n) => ({ ...n, [d.id]: e.target.value }))}
              className="h-9 max-w-xs"
            />
            <Button
              size="sm"
              variant="hero"
              disabled={review.isPending}
              onClick={() => review.mutate({ id: d.id, status: "approved", note: notes[d.id] })}
            >
              <ShieldCheck className="mr-1 h-4 w-4" /> Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
              disabled={review.isPending || !(notes[d.id] ?? "").trim()}
              onClick={() => review.mutate({ id: d.id, status: "rejected", note: notes[d.id] })}
            >
              <X className="mr-1 h-4 w-4" /> Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminProviderDocuments;
