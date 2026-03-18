import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, CheckCircle2 } from "lucide-react";
import { useAppointmentReminders } from "@/hooks/useAppointmentReminders";

const NotificationBanner = () => {
  const { permission, requestPermission } = useAppointmentReminders();
  const [dismissed, setDismissed] = useState(false);

  if (permission === "granted" || permission === "unsupported" || dismissed) return null;
  if (permission === "denied") return null;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
      <Bell className="h-5 w-5 text-primary shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">Enable appointment reminders</p>
        <p className="text-xs text-muted-foreground">Get notified before your appointments</p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => setDismissed(true)}>
          <BellOff className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="hero" onClick={requestPermission}>
          Enable
        </Button>
      </div>
    </div>
  );
};

export default NotificationBanner;
