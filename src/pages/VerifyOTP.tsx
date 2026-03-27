import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Heart, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
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

  // Countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    setLoading(true);

    try {
      const res = await supabase.functions.invoke("verify-otp", {
        body: { phone, code: otp },
      });

      if (res.error || res.data?.error) {
        const msg = res.data?.error || res.error?.message || "Verification failed";
        toast({ title: "Verification failed", description: msg, variant: "destructive" });
        setLoading(false);
        return;
      }

      const { session, isNewUser } = res.data;

      if (session) {
        // Set the session in the client
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
      }

      if (isNewUser) {
        navigate("/onboarding/profile", { replace: true });
      } else {
        // Check if profile is completed
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (profile?.full_name) {
          navigate("/home", { replace: true });
        } else {
          navigate("/onboarding/profile", { replace: true });
        }
      }
    } catch (err: any) {
      toast({ title: "Verification failed", description: err.message, variant: "destructive" });
    }

    setLoading(false);
  };

  const handleResend = async () => {
    try {
      const res = await supabase.functions.invoke("send-otp", {
        body: { phone },
      });
      if (res.error || res.data?.error) {
        toast({ title: "Resend failed", description: res.data?.error || "Failed", variant: "destructive" });
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate("/onboarding/phone")}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Change number
        </button>

        <div className="rounded-2xl border border-border bg-card shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
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
