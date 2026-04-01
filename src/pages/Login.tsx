import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowRight, Phone, Loader2, ArrowLeft } from "lucide-react";
import raphaLogoNav from "@/assets/rapha-logo-nav.png";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useToast } from "@/hooks/use-toast";
import { countryCodes, findCountryByIso, type CountryCode } from "@/data/countryCodes";

type AuthMode = "phone" | "email";

const Login = () => {
  const [mode, setMode] = useState<AuthMode>("phone");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCodes[0]);
  const [detecting, setDetecting] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const detect = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (!res.ok) throw new Error();
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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back!", description: "You've been logged in successfully." });
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 6) {
      toast({ title: "Invalid number", description: "Please enter a valid phone number", variant: "destructive" });
      return;
    }
    setLoading(true);
    const fullPhone = `${selectedCountry.code}${phoneNumber.replace(/^0+/, "")}`;
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

  const handleForgotPassword = async () => {
    if (!email) {
      toast({ title: "Enter your email", description: "Please enter your email address first.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We've sent you a password reset link." });
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast({ title: "Google login failed", description: String(error), variant: "destructive" });
    }
  };

  return (
    <div className="relative min-h-screen flex">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-card/80 backdrop-blur border border-border text-foreground shadow-sm transition-colors hover:bg-accent"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="mb-6">
            <img src={raphaLogoNav} alt="Rapha Telehealth" className="h-20 w-auto mx-auto" />
          </div>
          <h2 className="font-display text-3xl font-bold text-primary-foreground">Welcome to Rapha Telehealth</h2>
          <p className="mt-3 text-primary-foreground/80 text-lg">
            Quality healthcare delivered to your doorstep by verified professionals.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-flex items-center gap-2">
            <img src={raphaLogoNav} alt="Rapha Telehealth" className="h-9 w-auto" />
            <span className="font-display text-xl font-bold text-foreground">
              Rapha<span className="text-primary"> Telehealth</span>
            </span>
          </Link>

          <h1 className="font-display text-2xl font-bold text-foreground">Sign in to your account</h1>
          <p className="mt-1 text-muted-foreground">Choose how you'd like to sign in</p>

          {/* Mode toggle */}
          <div className="mt-6 flex rounded-lg border border-border bg-muted p-1">
            <button
              type="button"
              onClick={() => setMode("phone")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                mode === "phone"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Phone className="h-4 w-4" /> Phone
            </button>
            <button
              type="button"
              onClick={() => setMode("email")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                mode === "email"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mail className="h-4 w-4" /> Email
            </button>
          </div>

          {/* Phone form */}
          {mode === "phone" && (
            <form onSubmit={handlePhoneLogin} className="mt-6 space-y-5">
              <div className="space-y-1.5">
                <Label>Country</Label>
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

              <div className="space-y-1.5">
                <Label>Phone Number</Label>
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

              <Button type="submit" variant="hero" className="w-full" size="lg" disabled={loading || !phoneNumber}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Sending code…</>
                ) : (
                  <>Send Verification Code <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
            </form>
          )}

          {/* Email form */}
          {mode === "email" && (
            <form onSubmit={handleEmailLogin} className="mt-6 space-y-5">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" variant="hero" className="w-full" size="lg" disabled={loading}>
                {loading ? "Signing in…" : "Sign In"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with</span></div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full"
              size="lg"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
