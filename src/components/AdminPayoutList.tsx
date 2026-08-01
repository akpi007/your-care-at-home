import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Banknote, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PAYOUT_STATUS_COLORS, PAYOUT_STATUS_LABELS, useAdminPayouts, useProcessPayout } from "@/hooks/usePayouts";

const AdminPayoutList = () => {
  const { data: payouts = [], isLoading } = useAdminPayouts();
  const process = useProcessPayout();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const act = async (id: string, status: "approved" | "paid" | "rejected") => {
    try {
      await process.mutateAsync({ id, status, adminNote: notes[id] || undefined });
      toast({ title: `Payout ${PAYOUT_STATUS_LABELS[status].toLowerCase()}` });
    } catch (error: any) {
      toast({ title: "Could not update payout", description: error.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (payouts.length === 0) {
    return (
      <div className="py-12 text-center">
        <Banknote className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-muted-foreground">No payout requests yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payouts.map((p: any) => (
        <div key={p.id} className="rounded-xl bg-card p-4 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-card-foreground">
                ${Number(p.amount).toFixed(2)} — {p.professionals?.display_name || "Provider"}
              </h4>
              <p className="text-xs text-muted-foreground">
                {p.method} · {p.destination} · requested {new Date(p.created_at).toLocaleDateString()}
              </p>
            </div>
            <Badge className={PAYOUT_STATUS_COLORS[p.status] || "bg-muted text-muted-foreground"}>
              {PAYOUT_STATUS_LABELS[p.status] || p.status}
            </Badge>
          </div>

          {["requested", "approved"].includes(p.status) ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Input
                className="h-9 max-w-xs"
                placeholder="Note / reference (optional)"
                value={notes[p.id] ?? ""}
                onChange={(e) => setNotes((n) => ({ ...n, [p.id]: e.target.value }))}
              />
              {p.status === "requested" && (
                <Button size="sm" variant="outline" onClick={() => act(p.id, "approved")} disabled={process.isPending}>
                  Approve
                </Button>
              )}
              <Button size="sm" variant="hero" onClick={() => act(p.id, "paid")} disabled={process.isPending}>
                Mark paid
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => act(p.id, "rejected")}
                disabled={process.isPending}
              >
                Reject
              </Button>
            </div>
          ) : (
            p.admin_note && <p className="mt-2 text-xs text-muted-foreground">Note: {p.admin_note}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminPayoutList;
