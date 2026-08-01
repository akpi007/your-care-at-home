import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  profile: any;
}

const ProviderOnboardingChecklist = ({ profile }: Props) => {
  const { data: availabilityCount = 0 } = useQuery({
    queryKey: ["availability-count", profile?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("availability")
        .select("id", { count: "exact", head: true })
        .eq("professional_id", profile.id);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!profile?.id,
  });

  const { data: certCount = 0 } = useQuery({
    queryKey: ["certification-count", profile?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("professional_certifications")
        .select("id", { count: "exact", head: true })
        .eq("professional_id", profile.id);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!profile?.id,
  });

  const steps = [
    {
      label: "Add a profile photo",
      done: !!profile?.imageUrl || !!profile?.image_url,
      hint: "Patients are far more likely to book a provider they can see.",
    },
    {
      label: "Write your bio",
      done: (profile?.bio?.length ?? 0) >= 40,
      hint: "Describe your experience and the care you offer (40+ characters).",
    },
    {
      label: "Set your consultation fee",
      done: Number(profile?.consultationFee ?? profile?.consultation_fee ?? 0) > 0,
      hint: "Set a fee so patients know what a visit costs.",
    },
    {
      label: "Upload licence & ID documents",
      done: certCount > 0 || !!profile?.id_proof_url,
      hint: "Required for verification before you can accept bookings.",
    },
    {
      label: "Set your weekly availability",
      done: availabilityCount > 0,
      hint: "Add at least one time slot so patients can book you.",
    },
    {
      label: "Get verified",
      done: profile?.verificationStatus === "verified",
      hint: "Our team reviews your documents — usually within 48 hours.",
    },
    {
      label: "Go online",
      done: !!profile?.available,
      hint: "Toggle availability on to start receiving bookings.",
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  const percent = Math.round((completed / steps.length) * 100);

  if (percent === 100) return null;

  return (
    <Card className="mb-6 p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-display font-semibold text-foreground">Finish setting up your profile</h3>
          <p className="text-sm text-muted-foreground">
            Complete these steps to appear higher in search and start earning.
          </p>
        </div>
        <Badge className="bg-primary/10 text-primary">
          {completed}/{steps.length} done
        </Badge>
      </div>

      <Progress value={percent} className="mb-4 h-2" />

      <ul className="space-y-2">
        {steps.map((s) => (
          <li key={s.label} className="flex items-start gap-2">
            {s.done ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-healthcare-green" />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />
            )}
            <div className="min-w-0">
              <p className={`text-sm ${s.done ? "text-muted-foreground line-through" : "font-medium text-foreground"}`}>
                {s.label}
              </p>
              {!s.done && <p className="text-xs text-muted-foreground">{s.hint}</p>}
            </div>
          </li>
        ))}
      </ul>

      <Button variant="soft" size="sm" className="mt-4" asChild>
        <Link to="/provider-dashboard#profile">Update my profile</Link>
      </Button>
    </Card>
  );
};

export default ProviderOnboardingChecklist;
