import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Repeat } from "lucide-react";
import { DAY_NAMES, useRecurringBookings, useUpdateRecurringBooking } from "@/hooks/useRecurringBookings";

const DashboardRecurring = () => {
  const { data = [], isLoading } = useRecurringBookings();
  const update = useUpdateRecurringBooking();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No recurring visits yet. You can set one up when booking a provider.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((r) => (
        <div key={r.id} className="rounded-xl bg-card p-4 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={r.professionals?.image_url || "/placeholder.svg"}
                alt={r.professionals?.display_name || "Provider"}
                className="h-11 w-11 rounded-xl object-cover"
              />
              <div>
                <p className="font-semibold text-card-foreground">
                  {r.professionals?.display_name ?? "Provider"}
                </p>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Repeat className="h-3.5 w-3.5" />
                  {r.frequency} · {DAY_NAMES[r.day_of_week]} at {String(r.booking_time).slice(0, 5)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={
                  r.active ? "bg-healthcare-green/15 text-healthcare-green" : "bg-muted text-muted-foreground"
                }
              >
                {r.active ? "Active" : "Paused"}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                disabled={update.isPending}
                onClick={() => update.mutate({ id: r.id, active: !r.active })}
              >
                {r.active ? "Pause" : "Resume"}
              </Button>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Starts {r.start_date}
            {r.end_date ? ` · ends ${r.end_date}` : ""}
          </p>
        </div>
      ))}
    </div>
  );
};

export default DashboardRecurring;
