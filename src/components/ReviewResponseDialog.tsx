import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquareReply } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Props {
  reviewId: string;
  existing?: string | null;
}

const ReviewResponseDialog = ({ reviewId, existing }: Props) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(existing ?? "");
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();
  const { toast } = useToast();

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("reviews")
      .update({ provider_response: text.trim() })
      .eq("id", reviewId);
    setSaving(false);

    if (error) {
      toast({ title: "Could not save reply", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Reply published" });
    qc.invalidateQueries({ queryKey: ["provider-reviews"] });
    qc.invalidateQueries({ queryKey: ["reviews"] });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <MessageSquareReply className="mr-1 h-4 w-4" />
          {existing ? "Edit reply" : "Reply"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reply to this review</DialogTitle>
        </DialogHeader>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          maxLength={600}
          placeholder="Thank the patient or clarify what happened. Your reply is public."
        />
        <DialogFooter>
          <Button variant="hero" disabled={saving || !text.trim()} onClick={save}>
            {saving ? "Saving…" : "Publish reply"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewResponseDialog;
