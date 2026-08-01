import { Loader2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DISPUTE_CATEGORIES, DISPUTE_STATUS_COLORS, DISPUTE_STATUS_LABELS, useMyDisputes } from "@/hooks/useDisputes";
import { CANCELLATION_POLICY_SUMMARY } from "@/lib/cancellationPolicy";

const categoryLabel = (value: string) =>
  DISPUTE_CATEGORIES.find((c) => c.value === value)?.label ?? value;

const DashboardDisputes = () => {
  const { data: disputes = [], isLoading } = useMyDisputes();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
        <p className="mb-1 font-semibold text-foreground">Cancellation &amp; refund policy</p>
        {CANCELLATION_POLICY_SUMMARY} Approved refunds are returned to your original payment method within 5–10
        business days.
      </div>

      {disputes.length === 0 ? (
        <div className="rounded-xl bg-card p-10 text-center shadow-card">
          <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            You haven't reported any issues. You can report a problem from any past booking.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map((d: any) => (
            <div key={d.id} className="rounded-xl bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="font-semibold text-card-foreground">{categoryLabel(d.category)}</h4>
                  <p className="text-xs text-muted-foreground">
                    {d.bookings?.professionals?.display_name || "Professional"} ·{" "}
                    {d.bookings?.booking_date || new Date(d.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={DISPUTE_STATUS_COLORS[d.status] || "bg-muted text-muted-foreground"}>
                  {DISPUTE_STATUS_LABELS[d.status] || d.status}
                </Badge>
              </div>

              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{d.description}</p>

              {d.resolution_note && (
                <div className="mt-3 rounded-lg bg-muted/50 p-3">
                  <p className="text-xs font-semibold text-foreground">Resolution</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{d.resolution_note}</p>
                  {Number(d.refund_amount) > 0 && (
                    <p className="mt-1 text-sm font-semibold text-healthcare-green">
                      Refund approved: ${Number(d.refund_amount).toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardDisputes;
