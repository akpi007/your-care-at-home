import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User, Briefcase } from "lucide-react";
import raphaLogoIcon from "@/assets/rapha-logo.png";
import africaMap from "@/assets/africa-map.jpg";
import worldMap from "@/assets/world-map.jpg";
import PageTransition from "@/components/PageTransition";

const RoleSelect = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/home", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSelect = (role: "user" | "provider") => {
    localStorage.setItem("medhome_selected_role", role);
    navigate("/onboarding/phone");
  };

  if (loading) return null;

  return (
    <PageTransition>
      <div className="relative min-h-screen flex flex-col lg:flex-row bg-[hsl(220,20%,8%)]">
        {/* Mobile background - faint Africa map */}
        <div className="absolute inset-0 lg:hidden opacity-[0.12] pointer-events-none">
          <img
            src={africaMap}
            alt=""
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Left panel – role selection */}
        <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <img src={raphaLogoIcon} alt="Rapha Telehealth" className="h-12 w-auto object-contain" />
              <span className="font-display text-xl font-bold text-white">
                Rapha<span className="text-primary"> Telehealth</span>
              </span>
            </div>

            <h1 className="font-display text-3xl font-bold text-white mb-2">
              Get Started
            </h1>
            <p className="text-white/60 text-base mb-10">
              Choose how you'd like to use Rapha Telehealth
            </p>

            {/* Role buttons */}
            <div className="space-y-4">
              <button
                onClick={() => handleSelect("user")}
                className="group w-full rounded-xl border border-white/10 bg-white/5 p-5 text-left transition-all hover:border-primary hover:bg-white/10 active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-white">
                      I'm a Patient
                    </h2>
                    <p className="text-sm text-white/50 mt-0.5">
                      Book home visits from verified healthcare professionals
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate("/provider-signup")}
                className="group w-full rounded-xl border border-white/10 bg-white/5 p-5 text-left transition-all hover:border-primary hover:bg-white/10 active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-white">
                      I'm a Service Provider
                    </h2>
                    <p className="text-sm text-white/50 mt-0.5">
                      Join our network and provide healthcare at patients' homes
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[hsl(220,20%,8%)] px-3 text-white/40">OR</span>
              </div>
            </div>

            <p className="text-center text-sm text-white/50">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </button>
            </p>

            <button
              onClick={() => navigate("/home")}
              className="mt-3 block mx-auto text-sm font-medium text-primary hover:underline"
            >
              Explore without an account
            </button>
          </div>
        </div>

        {/* Right panel – hero image */}
        <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
          <img
            src={africaMap}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            width={960}
            height={1080}
          />
          {/* Early Access ribbon */}
          <div className="absolute top-0 right-0 overflow-hidden w-28 h-28">
            <div className="absolute top-[18px] right-[-34px] w-[170px] text-center rotate-45 bg-orange-500 text-white text-xs font-bold py-1.5 shadow-lg">
              Early Access
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default RoleSelect;
