import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Slot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  enabled: boolean;
  id?: string;
}

const defaultSlots: Slot[] = DAYS.map((_, i) => ({
  dayOfWeek: i,
  startTime: "09:00",
  endTime: "17:00",
  enabled: i >= 1 && i <= 5, // Mon-Fri
}));

interface Props {
  professionalId: string;
}

const AvailabilityScheduler = ({ professionalId }: Props) => {
  const [open, setOpen] = useState(false);
  const [slots, setSlots] = useState<Slot[]>(defaultSlots);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("availability")
        .select("*")
        .eq("professional_id", professionalId);

      if (data && data.length > 0) {
        setSlots(
          DAYS.map((_, i) => {
            const existing = data.find((d: any) => d.day_of_week === i);
            return existing
              ? { dayOfWeek: i, startTime: existing.start_time.slice(0, 5), endTime: existing.end_time.slice(0, 5), enabled: true, id: existing.id }
              : { dayOfWeek: i, startTime: "09:00", endTime: "17:00", enabled: false };
          })
        );
      }
      setLoading(false);
    };
    load();
  }, [open, professionalId]);

  const updateSlot = (index: number, updates: Partial<Slot>) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, ...updates } : s)));
  };

  const handleSave = async () => {
    setSaving(true);

    // Delete all existing and re-insert enabled ones
    await supabase.from("availability").delete().eq("professional_id", professionalId);

    const toInsert = slots
      .filter((s) => s.enabled)
      .map((s) => ({
        professional_id: professionalId,
        day_of_week: s.dayOfWeek,
        start_time: s.startTime,
        end_time: s.endTime,
      }));

    if (toInsert.length > 0) {
      const { error } = await supabase.from("availability").insert(toInsert);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
    }

    toast({ title: "Availability saved" });
    setSaving(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Clock className="h-4 w-4 mr-1" /> Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Weekly Availability</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3 mt-2">
            {slots.map((slot, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                <Switch checked={slot.enabled} onCheckedChange={(v) => updateSlot(i, { enabled: v })} />
                <span className="w-20 text-sm font-medium text-foreground">{DAYS[i].slice(0, 3)}</span>
                {slot.enabled ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateSlot(i, { startTime: e.target.value })}
                      className="h-8 text-xs w-auto"
                    />
                    <span className="text-muted-foreground text-xs">to</span>
                    <Input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateSlot(i, { endTime: e.target.value })}
                      className="h-8 text-xs w-auto"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Off</span>
                )}
              </div>
            ))}

            <Button onClick={handleSave} disabled={saving} className="w-full mt-4" variant="hero">
              <Save className="h-4 w-4 mr-1" />
              {saving ? "Saving..." : "Save Schedule"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AvailabilityScheduler;
