import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Siren } from "lucide-react";
import { useResolveSos, useSosAlerts } from "@/hooks/useSos";

const AdminSosAlerts = () => {
  const { data: alerts = [], isLoading } = useSosAlerts();
  const resolve = useResolveSos();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (alerts.length === 0) {
    return <p className="py-12 text-center text-muted-foreground">No emergency alerts raised.</p>;
  }

  return (
    <div className="space-y-3">
      {alerts.map((a: any) => (
        <div key={a.id} className="rounded-xl bg-card p-4 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Siren className="h-4 w-4 text-destructive" />
              <div>
                <p className="font-semibold text-card-foreground">
                  Raised by {a.raised_role}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(a.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <Badge
              className={
                a.status === "resolved"
                  ? "bg-healthcare-green/15 text-healthcare-green"
                  : "bg-destructive/15 text-destructive"
              }
            >
              {a.status}
            </Badge>
          </div>

          {a.note && <p className="mt-2 text-sm text-muted-foreground">{a.note}</p>}

          <div className="mt-3 flex flex-wrap gap-2">
            {a.latitude && a.longitude && (
              <Button size="sm" variant="outline" asChild>
                <a
                  href={`https://www.google.com/maps?q=${a.latitude},${a.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="mr-1 h-4 w-4" /> View location
                </a>
              </Button>
            )}
            {a.status !== "resolved" && (
              <Button size="sm" variant="hero" disabled={resolve.isPending} onClick={() => resolve.mutate(a.id)}>
                Mark resolved
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminSosAlerts;
