import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, X, Eye, ShieldCheck, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
  verified: { label: "Verified", className: "bg-healthcare-soft-green text-healthcare-green", icon: ShieldCheck },
  pending: { label: "Pending", className: "bg-healthcare-warm text-amber-700", icon: Clock },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive", icon: AlertTriangle },
};

interface Props {
  professionals: any[];
}

const AdminProviderList = ({ professionals }: Props) => {
  const [selected, setSelected] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from("professionals")
      .update({ verification_status: status })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["admin-professionals"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({ title: `Provider ${status}` });
      if (selected?.id === id) setSelected({ ...selected, verification_status: status });
    }
    setUpdating(false);
  };

  // Log admin action
  const logAction = async (action: string, targetId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("admin_logs").insert({
        admin_id: user.id,
        action,
        target_id: targetId,
      });
    }
  };

  const handleVerify = async (id: string) => {
    await updateStatus(id, "verified");
    await logAction("verify_provider", id);
  };

  const handleReject = async (id: string) => {
    await updateStatus(id, "rejected");
    await logAction("reject_provider", id);
  };

  return (
    <>
      <div className="rounded-xl bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead className="hidden sm:table-cell">Specialization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professionals.map((p) => {
                const sc = statusConfig[p.verification_status] ?? statusConfig.pending;
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                          {p.passport_photo_url || p.image_url ? (
                            <img src={p.passport_photo_url || p.image_url} className="h-full w-full object-cover" alt="" />
                          ) : (
                            <span className="text-xs font-bold text-primary">
                              {(p.display_name ?? "?")[0]}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{p.display_name ?? "Unknown"}</p>
                          <p className="text-xs text-muted-foreground truncate sm:hidden">{p.specialization}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{p.specialization ?? "—"}</TableCell>
                    <TableCell>
                      <Badge className={sc.className}>
                        <sc.icon className="h-3 w-3 mr-1" />
                        {sc.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelected(p)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {p.verification_status === "pending" && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleVerify(p.id)} disabled={updating} className="text-healthcare-green">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleReject(p.id)} disabled={updating} className="text-destructive">
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Provider Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                  {selected.passport_photo_url || selected.image_url ? (
                    <img src={selected.passport_photo_url || selected.image_url} className="h-full w-full object-cover" alt="" />
                  ) : (
                    <span className="text-xl font-bold text-primary">{(selected.display_name ?? "?")[0]}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">{selected.display_name}</h3>
                  <p className="text-muted-foreground">{selected.specialization}</p>
                  <Badge className={(statusConfig[selected.verification_status] ?? statusConfig.pending).className}>
                    {(statusConfig[selected.verification_status] ?? statusConfig.pending).label}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-muted-foreground">Experience</p>
                  <p className="font-semibold text-foreground">{selected.years_experience ?? 0} years</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-muted-foreground">License</p>
                  <p className="font-semibold text-foreground">{selected.license_number || "—"}</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-muted-foreground">Fee</p>
                  <p className="font-semibold text-foreground">${selected.consultation_fee ?? 0}</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-muted-foreground">Rating</p>
                  <p className="font-semibold text-foreground">{selected.rating ?? 0} ({selected.total_reviews ?? 0} reviews)</p>
                </div>
              </div>

              {selected.bio && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-muted-foreground text-sm mb-1">Bio</p>
                  <p className="text-sm text-foreground">{selected.bio}</p>
                </div>
              )}

              {selected.id_proof_url && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-muted-foreground text-sm mb-2">ID Proof / Licence</p>
                  {selected.id_proof_url.endsWith(".pdf") ? (
                    <a href={selected.id_proof_url} target="_blank" rel="noopener noreferrer" className="text-primary underline text-sm">View PDF Document</a>
                  ) : (
                    <img src={selected.id_proof_url} alt="ID Proof" className="rounded-lg max-h-48 object-contain" />
                  )}
                </div>
              )}

              {selected.verification_status === "pending" && (
                <div className="flex gap-2">
                  <Button variant="hero" className="flex-1" onClick={() => handleVerify(selected.id)} disabled={updating}>
                    <Check className="h-4 w-4 mr-1" /> Verify Provider
                  </Button>
                  <Button variant="outline" className="flex-1 text-destructive border-destructive/30" onClick={() => handleReject(selected.id)} disabled={updating}>
                    <X className="h-4 w-4 mr-1" /> Reject
                  </Button>
                </div>
              )}

              {selected.verification_status !== "pending" && (
                <div className="flex gap-2">
                  {selected.verification_status !== "verified" && (
                    <Button variant="hero" className="flex-1" onClick={() => handleVerify(selected.id)} disabled={updating}>
                      <Check className="h-4 w-4 mr-1" /> Verify
                    </Button>
                  )}
                  {selected.verification_status !== "rejected" && (
                    <Button variant="outline" className="flex-1 text-destructive border-destructive/30" onClick={() => handleReject(selected.id)} disabled={updating}>
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminProviderList;
