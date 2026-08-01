import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DISPUTE_CATEGORIES, useRaiseDispute } from "@/hooks/useDisputes";
import { logError } from "@/lib/errorLogger";

interface Props {
  bookingId: string;
  trigger?: React.ReactNode;
}

const RaiseDisputeDialog = ({ bookingId, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>("no_show");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const raise = useRaiseDispute();

  const submit = async () => {
    if (description.trim().length < 10) {
      toast({ title: "Please add a bit more detail", description: "Tell us what happened in at least 10 characters.", variant: "destructive" });
      return;
    }
    try {
      await raise.mutateAsync({ bookingId, category, description: description.trim() });
      toast({ title: "Issue reported", description: "Our team will review your case and get back to you." });
      setDescription("");
      setOpen(false);
    } catch (error: any) {
      logError(error, { source: "raiseDispute" });
      toast({ title: "Could not submit", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
            <ShieldAlert className="mr-1 h-4 w-4" /> Report an issue
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report an issue with this booking</DialogTitle>
          <DialogDescription>
            Tell us what went wrong. An administrator will review your case and decide on an outcome, including a refund
            where appropriate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">What happened?</Label>
            <RadioGroup value={category} onValueChange={setCategory} className="gap-2">
              {DISPUTE_CATEGORIES.map((c) => (
                <div key={c.value} className="flex items-center gap-2">
                  <RadioGroupItem value={c.value} id={`dispute-${c.value}`} />
                  <Label htmlFor={`dispute-${c.value}`} className="text-sm font-normal text-muted-foreground">
                    {c.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dispute-description" className="text-sm font-medium">
              Details
            </Label>
            <Textarea
              id="dispute-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened, including dates and times where relevant."
              rows={4}
              maxLength={2000}
            />
          </div>

          <Button variant="hero" className="w-full" onClick={submit} disabled={raise.isPending}>
            {raise.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            Submit report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RaiseDisputeDialog;
