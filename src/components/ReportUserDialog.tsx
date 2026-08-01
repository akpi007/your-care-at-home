import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flag, Loader2, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { REPORT_REASONS, useBlockUser, useBlockedUsers, useReportUser } from "@/hooks/useReports";
import { logError } from "@/lib/errorLogger";

interface Props {
  reportedUserId: string;
  reportedName?: string;
  bookingId?: string | null;
  trigger?: React.ReactNode;
}

const ReportUserDialog = ({ reportedUserId, reportedName, bookingId, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("unprofessional");
  const [details, setDetails] = useState("");
  const [alsoBlock, setAlsoBlock] = useState(false);
  const { toast } = useToast();
  const report = useReportUser();
  const block = useBlockUser();
  const { data: blocks = [] } = useBlockedUsers();

  const isBlocked = blocks.some((b) => b.blocked_user_id === reportedUserId);

  const submit = async () => {
    try {
      await report.mutateAsync({ reportedUserId, bookingId, reason, details: details.trim() || undefined });
      if (alsoBlock && !isBlocked) {
        await block.mutateAsync({ blockedUserId: reportedUserId });
      }
      toast({ title: "Report submitted", description: "Thanks — our team will review this." });
      setDetails("");
      setOpen(false);
    } catch (error: any) {
      logError(error, { source: "reportUser" });
      toast({ title: "Could not submit report", description: error.message, variant: "destructive" });
    }
  };

  const toggleBlock = async () => {
    try {
      await block.mutateAsync({ blockedUserId: reportedUserId, unblock: isBlocked });
      toast({ title: isBlocked ? "User unblocked" : "User blocked" });
    } catch (error: any) {
      logError(error, { source: "blockUser" });
      toast({ title: "Could not update block", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Flag className="mr-1 h-4 w-4" /> Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report {reportedName || "this user"}</DialogTitle>
          <DialogDescription>
            Reports are confidential and reviewed by our team. Blocking stops this person from messaging you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-details" className="text-sm font-medium">
              Details (optional)
            </Label>
            <Textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Anything else we should know?"
            />
          </div>

          {!isBlocked && (
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={alsoBlock}
                onChange={(e) => setAlsoBlock(e.target.checked)}
                className="h-4 w-4 rounded border-input accent-[hsl(var(--primary))]"
              />
              Also block this user
            </label>
          )}

          <div className="flex gap-2">
            <Button variant="hero" className="flex-1" onClick={submit} disabled={report.isPending}>
              {report.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Submit report
            </Button>
            <Button variant="outline" onClick={toggleBlock} disabled={block.isPending}>
              <Ban className="mr-1 h-4 w-4" />
              {isBlocked ? "Unblock" : "Block"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportUserDialog;
