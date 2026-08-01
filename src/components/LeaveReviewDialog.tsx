import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLeaveReview } from "@/hooks/useReviews";
import { logError } from "@/lib/errorLogger";

interface Props {
  bookingId: string;
  professionalId: string;
  professionalName?: string;
}

const LeaveReviewDialog = ({ bookingId, professionalId, professionalName }: Props) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const leaveReview = useLeaveReview();

  const submit = async () => {
    if (rating < 1) {
      toast({ title: "Pick a rating", description: "Choose between 1 and 5 stars.", variant: "destructive" });
      return;
    }
    try {
      await leaveReview.mutateAsync({ bookingId, professionalId, rating, comment: comment.trim() || undefined });
      toast({ title: "Thanks for your review!" });
      setOpen(false);
    } catch (error: any) {
      logError(error, { source: "leaveReview" });
      toast({ title: "Could not save review", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Star className="mr-1 h-4 w-4" /> Leave a review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Review {professionalName || "your professional"}</DialogTitle>
          <DialogDescription>Reviews are only possible after a completed visit, and once per booking.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(n)}
                className="p-1"
              >
                <Star
                  className={cn(
                    "h-8 w-8 transition-colors",
                    (hovered || rating) >= n ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
                  )}
                />
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-comment" className="text-sm font-medium">
              Comment (optional)
            </Label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="How was your visit?"
            />
          </div>

          <Button variant="hero" className="w-full" onClick={submit} disabled={leaveReview.isPending}>
            {leaveReview.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            Submit review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveReviewDialog;
