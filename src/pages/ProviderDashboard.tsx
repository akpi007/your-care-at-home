import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  DollarSign,
  Star,
  Briefcase,
  ShieldCheck,
  Loader2,
  User,
  AlertCircle,
} from "lucide-react";
import { useProviderProfile, useProviderBookings, useProviderEarnings } from "@/hooks/useProviderData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import ProviderProfileEdit from "@/components/ProviderProfileEdit";
import ProviderBookingCard from "@/components/ProviderBookingCard";
import AvailabilityScheduler from "@/components/AvailabilityScheduler";

const verificationBadge: Record<string, { label: string; className: string }> = {
  verified: { label: "Verified", className: "bg-healthcare-soft-green text-healthcare-green" },
  pending: { label: "Pending Review", className: "bg-healthcare-warm text-amber-700" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive" },
};

const ProviderDashboard = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProviderProfile();
  const { data: bookings = [], isLoading: bookingsLoading } = useProviderBookings();
  const { data: earnings } = useProviderEarnings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const toggleAvailability = async () => {
    if (!profile) return;
    const { error } = await supabase
      .from("professionals")
      .update({ available: !profile.available })
      .eq("id", profile.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["provider-profile"] });
      toast({ title: profile.available ? "Set to unavailable" : "Set to available" });
    }
  };

  const isLoading = profileLoading || bookingsLoading;

  const upcoming = bookings.filter((b) => ["pending", "confirmed"].includes(b.status));
  const past = bookings.filter((b) => ["completed", "cancelled"].includes(b.status));

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold text-foreground">No Provider Profile Found</h2>
            <p className="text-muted-foreground mt-2">
              You don't have a provider profile yet. If you recently signed up, please check your email to verify your account.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const vBadge = verificationBadge[profile.verificationStatus] ?? verificationBadge.pending;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="container py-8 flex-1">
        {/* Profile header */}
        <div className="mb-8 rounded-2xl bg-card p-6 shadow-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 overflow-hidden">
              {profile.passportPhotoUrl ? (
                <img src={profile.passportPhotoUrl} alt={profile.displayName} className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl font-bold text-foreground">
                  {profile.displayName || "Provider"}
                </h1>
                <Badge className={vBadge.className}>{vBadge.label}</Badge>
              </div>
              <p className="text-muted-foreground">{profile.specialization}</p>
              {profile.bio && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{profile.bio}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1"><Star className="h-4 w-4 text-primary" />{profile.rating.toFixed(1)} ({profile.totalReviews} reviews)</span>
                <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{profile.yearsExperience} yrs exp</span>
                <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" />${profile.consultationFee}/visit</span>
                <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4" />License: {profile.licenseNumber}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <Button
                variant={profile.available ? "hero" : "outline"}
                onClick={toggleAvailability}
                size="sm"
              >
                {profile.available ? "Available ✓" : "Set Available"}
              </Button>
              <div className="flex gap-2">
                <ProviderProfileEdit profile={profile} />
                <AvailabilityScheduler professionalId={profile.id} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: Calendar, label: "Upcoming", value: upcoming.length },
            { icon: Star, label: "Rating", value: profile.rating.toFixed(1) },
            { icon: DollarSign, label: "Total Earned", value: `$${earnings?.total ?? 0}` },
            { icon: Clock, label: "Pending Payout", value: `$${earnings?.pending ?? 0}` },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 rounded-xl bg-card p-4 shadow-card">
              <stat.icon className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">{stat.value}</span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Bookings tabs */}
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcoming.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">No upcoming bookings.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((b) => (
                  <ProviderBookingCard key={b.id} booking={b} showActions />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {past.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">No past bookings yet.</p>
            ) : (
              <div className="space-y-3">
                {past.map((b) => (
                  <ProviderBookingCard key={b.id} booking={b} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default ProviderDashboard;
