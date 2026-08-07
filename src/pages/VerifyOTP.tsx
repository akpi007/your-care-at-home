import { useState, useEffect } from "react";
import BackButton from "@/components/BackButton";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, Loader2 } from "lucide-react";
import raphaLogoNav from "@/assets/rapha-logo-nav.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageTransition from "@/components/PageTransition";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const navigate = useNavigate();
  const { toast } = useToast();

  const phone = localStorage.getItem("medhome_otp_phone") || "";

  useEffect(() => {
    if (!phone) {
      navigate("/onboarding/phone", { replace: true });
    }
  }, [phone, navigate]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    setLoading(true);

    try {
      const res = await supabase.functions.invoke("verify-otp", { body: { phone, code: otp } });
      const errMsg = res.data?.error || res.error?.message;
      if (errMsg || !res.data?.password) {
        toast({
          title: "Verification failed",
          description: errMsg || "Invalid or expired code",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { phone: normalizedPhone, password } = res.data;
      const { data: signIn, error: signInErr } = await supabase.auth.signInWithPassword({
        phone: normalizedPhone,
        password,
      });

      if (signInErr || !signIn.session) {
        toast({
          title: "Sign-in failed",
          description: signInErr?.message || "Could not establish session",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check if profile already completed
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", signIn.session.user.id)
        .maybeSingle();

      if (profile?.full_name) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/onboarding/profile", { replace: true });
      }
    } catch (err: any) {
      toast({ title: "Verification failed", description: err.message, variant: "destructive" });
    }

    setLoading(false);
  };

  const handleResend = async () => {
    try {
      const res = await supabase.functions.invoke("send-otp", { body: { phone } });
      const errMsg = res.data?.error || res.error?.message;
      if (errMsg) {
        toast({ title: "Resend failed", description: errMsg, variant: "destructive" });
      } else {
        toast({ title: "Code resent", description: "Check your phone for the new code" });
        setResendTimer(60);
      }
    } catch {
      toast({ title: "Resend failed", description: "Something went wrong", variant: "destructive" });
    }
  };

  const maskedPhone = phone ? `${phone.slice(0, 4)}****${phone.slice(-3)}` : "";

  return (
    <PageTransition>
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <BackButton />
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate("/onboarding/phone")}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Change number
        </button>

        <div className="rounded-2xl border border-border bg-card shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <img src={raphaLogoNav} alt="Rapha Telehealth" className="h-10 mb-3" />
            <h1 className="font-display text-xl font-bold text-foreground">
              Verify your number
            </h1>
            <p className="mt-1 text-sm text-muted-foreground text-center">
              Enter the 6-digit code sent to{" "}
              <span className="font-medium text-foreground">{maskedPhone}</span>
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            variant="hero"
            size="lg"
            className="w-full"
            disabled={otp.length !== 6 || loading}
            onClick={handleVerify}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
              </>
            ) : (
              "Verify & Continue"
            )}
          </Button>

          <div className="mt-4 text-center">
            {resendTimer > 0 ? (
              <p className="text-xs text-muted-foreground">
                Resend code in{" "}
                <span className="font-medium text-foreground">{resendTimer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-xs font-medium text-primary hover:underline"
              >
                Resend verification code
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default VerifyOTP;
