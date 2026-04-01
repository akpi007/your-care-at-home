import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, CheckCircle2, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallApp = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 container max-w-lg py-12">
        <div className="text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <Smartphone className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Install Rapha Telehealth</h1>
          <p className="text-muted-foreground">
            Install our app for a faster, native-like experience with offline access and instant notifications.
          </p>

          {isInstalled ? (
            <div className="flex items-center justify-center gap-2 text-primary font-semibold">
              <CheckCircle2 className="h-5 w-5" /> App is already installed!
            </div>
          ) : deferredPrompt ? (
            <Button variant="hero" size="lg" onClick={handleInstall} className="w-full">
              <Download className="h-5 w-5 mr-2" /> Install App
            </Button>
          ) : isIOS ? (
            <div className="rounded-xl bg-card p-6 shadow-card text-left space-y-3">
              <h3 className="font-semibold text-foreground">Install on iPhone/iPad</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
                  Tap the <Share className="inline h-4 w-4 mx-1" /> Share button in Safari
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">2</span>
                  Scroll down and tap "Add to Home Screen"
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">3</span>
                  Tap "Add" to install
                </li>
              </ol>
            </div>
          ) : (
            <div className="rounded-xl bg-card p-6 shadow-card text-sm text-muted-foreground">
              Open this page in your mobile browser to install the app.
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { icon: "⚡", label: "Fast & Smooth" },
              { icon: "📴", label: "Works Offline" },
              { icon: "🔔", label: "Push Alerts" },
            ].map((f) => (
              <div key={f.label} className="rounded-xl bg-card p-4 shadow-card text-center">
                <div className="text-2xl mb-1">{f.icon}</div>
                <div className="text-xs font-medium text-muted-foreground">{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default InstallApp;
