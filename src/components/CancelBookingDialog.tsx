import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { assessCancellation, CANCELLATION_POLICY_SUMMARY } from "@/lib/cancellationPolicy";
import { logError } from "@/lib/errorLogger";

interface Props {
  booking: any;
  consultationFee?: number;
  onCancelled?: () => void;
}

const CancelBookingDialog = ({ booking, consultationFee = 0, onCancelled }: Props) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const assessment = assessCancellation(booking, consultationFee);

  const handleConfirm = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled", cancellation_reason: reason || null })
      .eq("id", booking.id);

    if (error) {
      logError(error, { source: "cancelBooking" });
      toast({ title: "Could not cancel", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Booking cancelled",
        description: assessment.isLate
          ? `A late-cancellation fee of $${assessment.estimatedFee.toFixed(2)} applies.`
          : "No cancellation fee applies.",
      });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["provider-bookings"] });
      setOpen(false);
      onCancelled?.();
    }
    setSaving(false);
  };

  if (!assessment.canCancel) {
    return (
      <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        {assessment.blockedReason}
      </div>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive border-destructive/30 hover:bg-destructive/10"
        onClick={() => setOpen(true)}
      >
        <X className="mr-1 h-4 w-4" /> Cancel Booking
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-left">
                {assessment.isLate ? (
                  <div className="flex gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="text-sm">
                      This is a late cancellation — your appointment is in{" "}
                      {Math.max(0, Math.round(assessment.hoursUntil))} hour
                      {Math.round(assessment.hoursUntil) === 1 ? "" : "s"}. A fee of{" "}
                      <strong>${assessment.estimatedFee.toFixed(2)}</strong> applies.
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    You're cancelling more than 12 hours ahead, so no fee applies.
                  </p>
                )}
                <p className="text-xs text-muted-foreground">{CANCELLATION_POLICY_SUMMARY}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <Label htmlFor="cancel-reason" className="text-sm">
              Reason (optional)
            </Label>
            <Textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Let the professional know why you're cancelling"
              maxLength={500}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Keep booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Confirm cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CancelBookingDialog;
