import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, CheckCircle2, Loader2 } from "lucide-react";
import { useRecordVisitVerification, useVisitVerifications } from "@/hooks/useVisitVerification";
import { useToast } from "@/hooks/use-toast";

interface Props {
  bookingId: string;
  professionalId: string;
}

const VisitVerificationPanel = ({ bookingId, professionalId }: Props) => {
  const { data: records = [] } = useVisitVerifications(bookingId);
  const record = useRecordVisitVerification();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<"start" | "finish">("start");

  const done = (p: string) => records.some((r) => r.phase === p);

  const handleFile = async (file: File | null) => {
    try {
      await record.mutateAsync({ bookingId, professionalId, phase, file });
      toast({ title: phase === "start" ? "Visit start confirmed" : "Visit completion confirmed" });
    } catch (e: any) {
      toast({ title: "Could not save", description: e.message, variant: "destructive" });
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const trigger = (p: "start" | "finish") => {
    setPhase(p);
    setTimeout(() => inputRef.current?.click(), 0);
  };

  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-sm font-medium text-foreground">Visit verification</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Take a photo at arrival and at completion. This protects you against no-show disputes.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {(["start", "finish"] as const).map((p) => (
          <Button
            key={p}
            size="sm"
            variant={done(p) ? "outline" : "hero"}
            disabled={done(p) || record.isPending}
            onClick={() => trigger(p)}
          >
            {record.isPending && phase === p ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : done(p) ? (
              <CheckCircle2 className="mr-1 h-4 w-4 text-healthcare-green" />
            ) : (
              <Camera className="mr-1 h-4 w-4" />
            )}
            {p === "start" ? "Confirm arrival" : "Confirm completion"}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default VisitVerificationPanel;
