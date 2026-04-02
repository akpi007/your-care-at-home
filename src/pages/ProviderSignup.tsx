import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, Mail, Lock, User, ArrowRight, Stethoscope, Briefcase, MapPin } from "lucide-react";
import { ZAMBIAN_CITIES } from "@/components/ProfessionalsFilter";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const specializations = [
  "General Physician",
  "Nurse",
  "Physiotherapist",
  "Caregiver",
  "Lab Technician",
  "Pediatrician",
  "Cardiologist",
  "Dermatologist",
  "Orthopedic",
  "Other",
];

const ProviderSignup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Create auth user with professional metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          is_professional: true,
          specialization,
          years_experience: parseInt(yearsExperience) || 0,
          license_number: licenseNumber,
          bio,
          city,
        },
        emailRedirectTo: window.location.origin,
      },
    });

    if (authError) {
      toast({ title: "Signup failed", description: authError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    toast({
      title: "Application submitted!",
      description:
        "Check your email to verify your account. Your provider profile will be reviewed and activated shortly.",
    });
    navigate("/login");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/70 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/20 backdrop-blur">
            <Stethoscope className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="font-display text-3xl font-bold text-primary-foreground">
            Join Rapha Telehealth as a Provider
          </h2>
          <p className="mt-3 text-primary-foreground/80 text-lg">
            Expand your practice, reach more patients, and deliver healthcare at their doorstep.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-left">
            {[
              { label: "Flexible Schedule", desc: "Set your own availability" },
              { label: "Verified Badge", desc: "Build trust with patients" },
              { label: "Grow Earnings", desc: "Competitive compensation" },
              { label: "Easy Booking", desc: "Patients come to you" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-primary-foreground/10 p-3 backdrop-blur">
                <p className="font-semibold text-primary-foreground text-sm">{item.label}</p>
                <p className="text-primary-foreground/70 text-xs mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <Link to="/" className="mb-8 inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              Med<span className="text-primary">Home</span>
            </span>
          </Link>

          <h1 className="font-display text-2xl font-bold text-foreground">
            Register as a Service Provider
          </h1>
          <p className="mt-1 text-muted-foreground">
            Fill in your details to start serving patients at home
          </p>

          <form onSubmit={handleSignup} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Dr. Jane Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Select value={specialization} onValueChange={setSpecialization} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your specialization" />
                </SelectTrigger>
                <SelectContent>
                  {specializations.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="experience"
                    type="number"
                    min={0}
                    max={50}
                    placeholder="5"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="license">License Number</Label>
                <Input
                  id="license"
                  placeholder="MED-12345"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City / Location</Label>
              <Select value={city} onValueChange={setCity} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your city" />
                </SelectTrigger>
                <SelectContent>
                  {ZAMBIAN_CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Short Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell patients about your experience and approach to care..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
              />
            </div>

            <Button type="submit" variant="hero" className="w-full" size="lg" disabled={loading}>
              {loading ? "Submitting…" : "Register as Provider"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Looking for care instead?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Sign up as a patient
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProviderSignup;
