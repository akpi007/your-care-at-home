import { useState, useEffect } from "react";
import BackButton from "@/components/BackButton";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Heart, ArrowRight, Loader2, MapPin, User, Stethoscope } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { locationData } from "@/data/locationData";
import { medicalSpecializations } from "@/data/specializations";

const CompleteProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const role = localStorage.getItem("medhome_selected_role") || "user";

  // Common fields
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");

  // Provider-specific
  const [specialization, setSpecialization] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [bio, setBio] = useState("");

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Auto-detect location
  useEffect(() => {
    const detect = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (!res.ok) return;
        const data = await res.json();
        const countryMatch = locationData.find(
          (l) => l.country.toLowerCase() === (data.country_name || "").toLowerCase()
        );
        if (countryMatch) {
          setCountry(countryMatch.country);
          const regionMatch = countryMatch.regions.find(
            (r) => r.name.toLowerCase() === (data.region || "").toLowerCase()
          );
          if (regionMatch) {
            setRegion(regionMatch.name);
            const cityMatch = regionMatch.cities.find(
              (c) => c.toLowerCase() === (data.city || "").toLowerCase()
            );
            if (cityMatch) setCity(cityMatch);
          }
        }
      } catch {}
    };
    detect();
  }, []);

  const selectedCountry = locationData.find((l) => l.country === country);
  const selectedRegion = selectedCountry?.regions.find((r) => r.name === region);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !fullName.trim() || !city) return;
    setSubmitting(true);

    // Save location
    localStorage.setItem("medhome_location", JSON.stringify({ country, region, city }));

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() })
      .eq("user_id", user.id);

    if (profileError) {
      toast({ title: "Error", description: profileError.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    // If provider, call edge function to set up provider profile
    if (role === "provider") {
      const { error: fnError } = await supabase.functions.invoke("complete-onboarding", {
        body: {
          role: "professional",
          display_name: fullName.trim(),
          specialization,
          years_experience: parseInt(yearsExperience) || 0,
          license_number: licenseNumber,
          bio,
          city,
        },
      });

      if (fnError) {
        toast({ title: "Error", description: "Failed to create provider profile", variant: "destructive" });
        setSubmitting(false);
        return;
      }
    }

    toast({ title: "Welcome to Rapha Telehealth!", description: "Your profile has been created successfully." });
    navigate("/home", { replace: true });
    setSubmitting(false);
  };

  if (authLoading) return null;

  return (
    <PageTransition>
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <BackButton />
      <div className="w-full max-w-lg">
        <div className="rounded-2xl border border-border bg-card shadow-xl p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary mb-3">
              {role === "provider" ? (
                <Stethoscope className="h-6 w-6 text-primary-foreground" />
              ) : (
                <User className="h-6 w-6 text-primary-foreground" />
              )}
            </div>
            <h1 className="font-display text-xl font-bold text-foreground">
              {role === "provider" ? "Set up your provider profile" : "Complete your profile"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground text-center">
              {role === "provider"
                ? "Tell us about your qualifications and practice"
                : "Help us personalize your healthcare experience"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {/* Location */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Location</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select value={country} onValueChange={(v) => { setCountry(v); setRegion(""); setCity(""); }}>
                  <SelectTrigger><SelectValue placeholder="Country" /></SelectTrigger>
                  <SelectContent>
                    {locationData.map((l) => (
                      <SelectItem key={l.country} value={l.country}>{l.country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={region} onValueChange={(v) => { setRegion(v); setCity(""); }} disabled={!country}>
                  <SelectTrigger><SelectValue placeholder="Region" /></SelectTrigger>
                  <SelectContent>
                    {selectedCountry?.regions.map((r) => (
                      <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={city} onValueChange={setCity} disabled={!region}>
                  <SelectTrigger><SelectValue placeholder="City" /></SelectTrigger>
                  <SelectContent>
                    {selectedRegion?.cities.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Provider-specific fields */}
            {role === "provider" && (
              <>
                <div className="border-t border-border pt-4 mt-4">
                  <p className="text-sm font-medium text-foreground mb-3">Professional Details</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="specialization">Specialization *</Label>
                  <Select value={specialization} onValueChange={setSpecialization}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicalSpecializations.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      placeholder="e.g. 5"
                      min={0}
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="license">License Number</Label>
                    <Input
                      id="license"
                      placeholder="Medical license #"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell patients about yourself and your practice…"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full mt-2"
              disabled={submitting || !fullName.trim() || !city}
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
              ) : (
                <>Get Started <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default CompleteProfile;
