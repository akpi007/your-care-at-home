import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DISPUTE_CATEGORIES,
  DISPUTE_STATUS_COLORS,
  DISPUTE_STATUS_LABELS,
  useAdminDisputes,
  useResolveDispute,
} from "@/hooks/useDisputes";

const categoryLabel = (v: string) => DISPUTE_CATEGORIES.find((c) => c.value === v)?.label ?? v;

const AdminDisputeList = () => {
  const { data: disputes = [], isLoading } = useAdminDisputes();
  const resolve = useResolveDispute();
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<Record<string, { note: string; refund: string }>>({});

  const setDraft = (id: string, patch: Partial<{ note: string; refund: string }>) =>
    setDrafts((d) => ({ ...d, [id]: { note: "", refund: "", ...d[id], ...patch } }));

  const act = async (id: string, status: "under_review" | "resolved" | "rejected") => {
    const draft = drafts[id] ?? { note: "", refund: "" };
    try {
      await resolve.mutateAsync({
        id,
        status,
        resolutionNote: draft.note || undefined,
        refundAmount: draft.refund ? Number(draft.refund) : 0,
      });
      toast({ title: `Dispute marked as ${DISPUTE_STATUS_LABELS[status].toLowerCase()}` });
    } catch (error: any) {
      toast({ title: "Could not update dispute", description: error.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (disputes.length === 0) {
    return (
      <div className="py-12 text-center">
        <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-healthcare-green" />
        <p className="text-muted-foreground">No disputes have been raised.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {disputes.map((d: any) => {
        const open = ["open", "under_review"].includes(d.status);
        const draft = drafts[d.id] ?? { note: "", refund: "" };
        return (
          <div key={d.id} className="rounded-xl bg-card p-4 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-card-foreground">{categoryLabel(d.category)}</h4>
                <p className="text-xs text-muted-foreground">
                  {d.bookings?.professionals?.display_name || "Professional"} · booking{" "}
                  {d.bookings?.booking_date || "—"} · raised {new Date(d.created_at).toLocaleDateString()}
                </p>
              </div>
              <Badge className={DISPUTE_STATUS_COLORS[d.status] || "bg-muted text-muted-foreground"}>
                {DISPUTE_STATUS_LABELS[d.status] || d.status}
              </Badge>
            </div>

            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{d.description}</p>

            {open ? (
              <div className="mt-3 space-y-2 rounded-lg border border-border p-3">
                <div className="grid gap-2 sm:grid-cols-[1fr_140px]">
                  <div className="space-y-1">
                    <Label htmlFor={`note-${d.id}`} className="text-xs">
                      Resolution note
                    </Label>
                    <Textarea
                      id={`note-${d.id}`}
                      rows={2}
                      value={draft.note}
                      onChange={(e) => setDraft(d.id, { note: e.target.value })}
                      placeholder="Explain the outcome for the patient"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`refund-${d.id}`} className="text-xs">
                      Refund amount
                    </Label>
                    <Input
                      id={`refund-${d.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={draft.refund}
                      onChange={(e) => setDraft(d.id, { refund: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {d.status === "open" && (
                    <Button size="sm" variant="outline" onClick={() => act(d.id, "under_review")} disabled={resolve.isPending}>
                      Mark under review
                    </Button>
                  )}
                  <Button size="sm" variant="hero" onClick={() => act(d.id, "resolved")} disabled={resolve.isPending}>
                    Resolve{draft.refund ? ` + refund $${draft.refund}` : ""}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-destructive/30 text-destructive hover:bg-destructive/10"
                    onClick={() => act(d.id, "rejected")}
                    disabled={resolve.isPending}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ) : (
              d.resolution_note && (
                <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm">
                  <p className="text-xs font-semibold text-foreground">Resolution</p>
                  <p className="text-muted-foreground">{d.resolution_note}</p>
                  {Number(d.refund_amount) > 0 && (
                    <p className="mt-1 font-semibold text-healthcare-green">
                      Refunded ${Number(d.refund_amount).toFixed(2)}
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AdminDisputeList;
