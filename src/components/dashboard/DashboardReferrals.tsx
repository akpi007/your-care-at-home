import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Gift, Loader2, Share2 } from "lucide-react";
import { useApplyReferralCode, useMyReferral } from "@/hooks/useReferrals";
import { useToast } from "@/hooks/use-toast";

const DashboardReferrals = () => {
  const { code, isLoading, invited } = useMyReferral();
  const apply = useApplyReferralCode();
  const { toast } = useToast();
  const [input, setInput] = useState("");

  const link = code ? `${window.location.origin}/?ref=${code}` : "";

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    toast({ title: "Invite link copied" });
  };

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: "Rapha Telehealth", text: "Book healthcare at home", url: link });
    } else {
      void copy();
    }
  };

  const submit = async () => {
    try {
      await apply.mutateAsync(input);
      toast({ title: "Referral code applied" });
      setInput("");
    } catch (e: any) {
      toast({ title: "Could not apply code", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-card p-5 shadow-card">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold text-foreground">Invite friends</h3>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : code ? (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              Share your code and get credit each time someone signs up and books.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-muted px-4 py-2 font-mono text-lg font-bold tracking-widest text-foreground">
                {code}
              </span>
              <Button size="sm" variant="outline" onClick={copy}>
                <Copy className="mr-1 h-4 w-4" /> Copy link
              </Button>
              <Button size="sm" variant="hero" onClick={share}>
                <Share2 className="mr-1 h-4 w-4" /> Share
              </Button>
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Your referral code will appear once your profile is complete.
          </p>
        )}
      </div>

      <div className="rounded-xl bg-card p-5 shadow-card">
        <h3 className="font-display text-lg font-semibold text-foreground">Have a code?</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <Input
            placeholder="Enter referral code"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            className="max-w-xs"
          />
          <Button variant="hero" disabled={apply.isPending || !input.trim()} onClick={submit}>
            Apply
          </Button>
        </div>
      </div>

      <div className="rounded-xl bg-card p-5 shadow-card">
        <h3 className="font-display text-lg font-semibold text-foreground">
          People you invited ({invited.length})
        </h3>
        {invited.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No referrals yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {invited.map((r: any) => (
              <li key={r.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-sm text-muted-foreground">
                  Joined {new Date(r.created_at).toLocaleDateString()}
                </span>
                <Badge className="bg-primary/10 text-primary">{r.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DashboardReferrals;
