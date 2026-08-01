import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flag, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { REPORT_REASONS, useAdminReports, useReviewReport } from "@/hooks/useReports";

const REPORT_STATUS_COLORS: Record<string, string> = {
  open: "bg-healthcare-warm text-amber-700",
  reviewing: "bg-primary/10 text-primary",
  actioned: "bg-healthcare-soft-green text-healthcare-green",
  dismissed: "bg-muted text-muted-foreground",
};

const reasonLabel = (v: string) => REPORT_REASONS.find((r) => r.value === v)?.label ?? v;

const AdminReportList = () => {
  const { data: reports = [], isLoading } = useAdminReports();
  const review = useReviewReport();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const act = async (id: string, status: "reviewing" | "actioned" | "dismissed") => {
    try {
      await review.mutateAsync({ id, status, adminNote: notes[id] || undefined });
      toast({ title: "Report updated" });
    } catch (error: any) {
      toast({ title: "Could not update report", description: error.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="py-12 text-center">
        <Flag className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-muted-foreground">No user reports.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((r: any) => (
        <div key={r.id} className="rounded-xl bg-card p-4 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-card-foreground">{reasonLabel(r.reason)}</h4>
              <p className="text-xs text-muted-foreground">
                Reported user {String(r.reported_user_id).slice(0, 8)}… ·{" "}
                {new Date(r.created_at).toLocaleDateString()}
              </p>
            </div>
            <Badge className={REPORT_STATUS_COLORS[r.status] || "bg-muted text-muted-foreground"}>{r.status}</Badge>
          </div>

          {r.details && <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{r.details}</p>}

          {["open", "reviewing"].includes(r.status) ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Input
                className="h-9 max-w-xs"
                placeholder="Admin note (optional)"
                value={notes[r.id] ?? ""}
                onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
              />
              {r.status === "open" && (
                <Button size="sm" variant="outline" onClick={() => act(r.id, "reviewing")} disabled={review.isPending}>
                  Reviewing
                </Button>
              )}
              <Button size="sm" variant="hero" onClick={() => act(r.id, "actioned")} disabled={review.isPending}>
                Action taken
              </Button>
              <Button size="sm" variant="ghost" onClick={() => act(r.id, "dismissed")} disabled={review.isPending}>
                Dismiss
              </Button>
            </div>
          ) : (
            r.admin_note && <p className="mt-2 text-xs text-muted-foreground">Admin note: {r.admin_note}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminReportList;
