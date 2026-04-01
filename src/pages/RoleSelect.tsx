import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User, Briefcase, Star } from "lucide-react";
import raphaLogoIcon from "@/assets/rapha-logo.png";
import { testimonials } from "@/data/testimonials";
import PageTransition from "@/components/PageTransition";

const FloatingCard = ({
  testimonial,
  index,
}: {
  testimonial: (typeof testimonials)[0];
  index: number;
}) => {
  const positions = [
    "top-[8%] left-[4%]",
    "top-[12%] right-[3%]",
    "bottom-[18%] left-[2%]",
    "bottom-[10%] right-[5%]",
  ];
  const delays = ["0s", "2s", "4s", "1s"];
  const durations = ["8s", "10s", "9s", "11s"];

  return (
    <div
      className={`absolute ${positions[index]} z-0 pointer-events-none hidden md:block`}
      style={{
        animation: `float ${durations[index]} ease-in-out infinite`,
        animationDelay: delays[index],
      }}
    >
      <div className="w-40 sm:w-56 rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md shadow-xl p-3 sm:p-4">
        <div className="flex items-center gap-3 mb-2">
          <img
            src={testimonial.image}
            alt={testimonial.name}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/30"
            width={40}
            height={40}
            loading="lazy"
          />
          <div>
            <p className="text-xs font-semibold text-foreground leading-tight">
              {testimonial.name}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {testimonial.location}
            </p>
          </div>
        </div>
        <div className="flex gap-0.5 mb-1.5">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star
              key={i}
              className="h-3 w-3 fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground leading-snug italic">
          "{testimonial.quote}"
        </p>
      </div>
    </div>
  );
};

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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Floating testimonials */}
      {testimonials.map((t, i) => (
        <FloatingCard key={t.id} testimonial={t} index={i} />
      ))}

      {/* Medical SVG background */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
        backgroundSize: "40px 40px",
      }} />
      <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="med-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
            {/* Cross / Plus */}
            <rect x="52" y="40" width="16" height="40" rx="3" fill="currentColor" />
            <rect x="40" y="52" width="40" height="16" rx="3" fill="currentColor" />
            {/* Heart */}
            <path d="M60 105 C60 105 45 95 45 88 C45 84 48 82 51 82 C54 82 57 84 60 88 C63 84 66 82 69 82 C72 82 75 84 75 88 C75 95 60 105 60 105Z" fill="currentColor" />
            {/* Stethoscope circle */}
            <circle cx="20" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="20" y1="28" x2="20" y2="36" stroke="currentColor" strokeWidth="2" />
            {/* Pulse line */}
            <polyline points="85,18 90,18 93,8 97,28 100,18 105,18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#med-pattern)" className="text-primary" />
      </svg>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-lg mx-4 text-center">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <img src={raphaLogoIcon} alt="Rapha Telehealth" className="h-24 w-auto object-contain mb-4" />
          <h1 className="font-display text-3xl font-bold text-foreground">
            Rapha<span className="text-primary"> Telehealth</span>
          </h1>
          <p className="mt-2 text-muted-foreground text-sm max-w-xs">
            Quality healthcare delivered to your doorstep by trusted professionals
          </p>
        </div>

        {/* Role buttons */}
        <div className="space-y-4">
          <button
            onClick={() => handleSelect("user")}
            className="group w-full rounded-2xl border-2 border-border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10 active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <User className="h-7 w-7" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">
                  I'm a Patient
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Book home visits from verified healthcare professionals
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleSelect("provider")}
            className="group w-full rounded-2xl border-2 border-border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10 active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Briefcase className="h-7 w-7" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">
                  I'm a Service Provider
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Join our network and provide healthcare at patients' homes
                </p>
              </div>
            </div>
          </button>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
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
          className="mt-3 text-xs font-medium text-primary hover:underline"
        >
          Explore
        </button>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-15px) rotate(1deg); }
          50% { transform: translateY(-5px) rotate(-1deg); }
          75% { transform: translateY(-20px) rotate(0.5deg); }
        }
      `}</style>
    </div>
    </PageTransition>
  );
};

export default RoleSelect;
