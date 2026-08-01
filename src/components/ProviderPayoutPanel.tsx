import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Banknote, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PAYOUT_STATUS_COLORS, PAYOUT_STATUS_LABELS, useMyPayouts, useRequestPayout } from "@/hooks/usePayouts";
import { logError } from "@/lib/errorLogger";

interface Props {
  /** Net earnings not yet paid out. */
  availableBalance: number;
}

const PAYOUT_METHODS = [
  { value: "mobile_money", label: "Mobile money" },
  { value: "bank_transfer", label: "Bank transfer" },
];

const ProviderPayoutPanel = ({ availableBalance }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: payouts = [], isLoading } = useMyPayouts();
  const requestPayout = useRequestPayout();

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("mobile_money");
  const [destination, setDestination] = useState("");

  const { data: professional } = useQuery({
    queryKey: ["my-professional-id", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("professionals")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const pendingRequested = payouts
    .filter((p) => ["requested", "approved"].includes(p.status))
    .reduce((s, p) => s + Number(p.amount ?? 0), 0);
  const withdrawable = Math.max(0, Math.round((availableBalance - pendingRequested) * 100) / 100);

  const submit = async () => {
    const value = Number(amount);
    if (!professional?.id) {
      toast({ title: "Provider profile not found", variant: "destructive" });
      return;
    }
    if (!value || value <= 0 || value > withdrawable) {
      toast({
        title: "Invalid amount",
        description: `Enter an amount between $0.01 and $${withdrawable.toFixed(2)}.`,
        variant: "destructive",
      });
      return;
    }
    if (destination.trim().length < 5) {
      toast({ title: "Add payout details", description: "Enter the account or mobile number to pay to.", variant: "destructive" });
      return;
    }
    try {
      await requestPayout.mutateAsync({
        professionalId: professional.id,
        amount: value,
        method,
        destination: destination.trim(),
      });
      toast({ title: "Payout requested", description: "Our team will process this shortly." });
      setAmount("");
    } catch (error: any) {
      logError(error, { source: "requestPayout" });
      toast({ title: "Could not request payout", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center gap-2">
        <Banknote className="h-5 w-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">Withdraw earnings</h3>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        Available to withdraw: <strong className="text-foreground">${withdrawable.toFixed(2)}</strong>
        {pendingRequested > 0 && ` (${`$${pendingRequested.toFixed(2)}`} already requested)`}
      </p>

      <div className="grid gap-3 sm:grid-cols-[140px_1fr_1fr_auto] sm:items-end">
        <div className="space-y-1">
          <Label htmlFor="payout-amount" className="text-xs">
            Amount
          </Label>
          <Input
            id="payout-amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Method</Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYOUT_METHODS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="payout-destination" className="text-xs">
            Send to
          </Label>
          <Input
            id="payout-destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Mobile number or account"
          />
        </div>
        <Button variant="hero" onClick={submit} disabled={requestPayout.isPending || withdrawable <= 0}>
          {requestPayout.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
          Request
        </Button>
      </div>

      <div className="mt-5">
        <h4 className="mb-2 text-sm font-semibold text-foreground">Payout requests</h4>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : payouts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payout requests yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {payouts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-foreground">${Number(p.amount).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.method} · {new Date(p.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={PAYOUT_STATUS_COLORS[p.status] || "bg-muted text-muted-foreground"}>
                  {PAYOUT_STATUS_LABELS[p.status] || p.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
};

export default ProviderPayoutPanel;
