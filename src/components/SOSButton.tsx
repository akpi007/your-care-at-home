import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Siren } from "lucide-react";
import { useRaiseSos } from "@/hooks/useSos";
import { useToast } from "@/hooks/use-toast";

interface Props {
  bookingId?: string | null;
  role: "patient" | "professional";
  className?: string;
}

const SOSButton = ({ bookingId, role, className }: Props) => {
  const raise = useRaiseSos();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    try {
      await raise.mutateAsync({ bookingId, role });
      toast({
        title: "Emergency alert sent",
        description: "Our support team has been alerted with your location.",
      });
    } catch (e: any) {
      toast({ title: "Could not send alert", description: e.message, variant: "destructive" });
    }
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className={`border-destructive/40 text-destructive hover:bg-destructive/10 ${className ?? ""}`}
        >
          <Siren className="mr-1 h-4 w-4" /> Emergency
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Send an emergency alert?</AlertDialogTitle>
          <AlertDialogDescription>
            This notifies the Rapha support team immediately and shares your current location. Only
            use this if you feel unsafe or there is a medical emergency. For life-threatening
            emergencies, call your local emergency number first.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              void handleConfirm();
            }}
            disabled={raise.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {raise.isPending ? "Sending…" : "Send alert"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SOSButton;
