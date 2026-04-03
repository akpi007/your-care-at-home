import { useState, useEffect } from "react";
import BackButton from "@/components/BackButton";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import raphaLogoNav from "@/assets/rapha-logo-nav.png";
import { countryCodes, findCountryByIso, type CountryCode } from "@/data/countryCodes";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageTransition from "@/components/PageTransition";

const PhoneAuth = () => {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCodes[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const role = localStorage.getItem("medhome_selected_role") || "user";

  // Auto-detect country from IP
  useEffect(() => {
    const detect = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        const match = findCountryByIso(data.country_code || "");
        if (match) setSelectedCountry(match);
      } catch {
        // default stays
      } finally {
        setDetecting(false);
      }
    };
    detect();
  }, []);

  const fullPhone = `${selectedCountry.code}${phoneNumber.replace(/^0+/, "")}`;

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 6) {
      toast({ title: "Invalid number", description: "Please enter a valid phone number", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await supabase.functions.invoke("send-otp", {
        body: { phone: fullPhone },
      });

      if (res.error || res.data?.error) {
        const msg = res.data?.error || res.error?.message || "Failed to send code";
        toast({ title: "Failed to send code", description: msg, variant: "destructive" });
      } else {
        localStorage.setItem("medhome_otp_phone", fullPhone);
        toast({ title: "Code sent!", description: `We sent a verification code to ${fullPhone}` });
        navigate("/onboarding/verify");
      }
    } catch (err: any) {
      toast({ title: "Failed to send code", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <PageTransition>
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <BackButton />
      <div className="w-full max-w-md">
        {/* Back */}
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="rounded-2xl border border-border bg-card shadow-xl p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img src={raphaLogoNav} alt="Rapha Telehealth" className="h-10 mb-3" />
            <h1 className="font-display text-xl font-bold text-foreground">
              Enter your phone number
            </h1>
            <p className="mt-1 text-sm text-muted-foreground text-center">
              We'll send you a verification code via SMS
            </p>
          </div>

          <form onSubmit={handleSendOTP} className="space-y-5">
            {/* Country selector */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Country</label>
              <select
                value={selectedCountry.iso}
                onChange={(e) => {
                  const c = countryCodes.find((cc) => cc.iso === e.target.value);
                  if (c) setSelectedCountry(c);
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {countryCodes.map((c) => (
                  <option key={c.iso} value={c.iso}>
                    {c.flag} {c.country} ({c.code})
                  </option>
                ))}
              </select>
              {detecting && (
                <p className="flex items-center gap-1.5 text-xs text-primary">
                  <Loader2 className="h-3 w-3 animate-spin" /> Detecting your country…
                </p>
              )}
            </div>

            {/* Phone number */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Phone Number</label>
              <div className="flex gap-2">
                <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm font-medium text-foreground min-w-[70px] justify-center">
                  {selectedCountry.flag} {selectedCountry.code}
                </div>
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="97 123 4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                    className="pl-10"
                    required
                    maxLength={15}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading || !phoneNumber}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending code…
                </>
              ) : (
                <>
                  Send Verification Code <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-4 text-xs text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default PhoneAuth;
