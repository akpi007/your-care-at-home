import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import ProfessionalCard from "@/components/ProfessionalCard";
import { useProfessionals } from "@/hooks/useProfessionals";
import {
  Stethoscope,
  Syringe,
  Activity,
  Heart,
  FlaskConical,
  ShieldCheck,
  Clock,
  MapPin,
  Star,
  ArrowRight,
  Search,
  Loader2,
} from "lucide-react";

const serviceCards = [
  { icon: Stethoscope, title: "Doctors", description: "General & specialist", href: "/professionals?service=doctor", color: "bg-healthcare-soft-blue text-healthcare-blue" },
  { icon: Syringe, title: "Nurses", description: "Professional nursing", href: "/professionals?service=nurse", color: "bg-healthcare-soft-green text-healthcare-green" },
  { icon: Activity, title: "Physiotherapy", description: "Rehab & therapy", href: "/professionals?service=physio", color: "bg-accent text-accent-foreground" },
  { icon: Heart, title: "Caregivers", description: "Daily care support", href: "/professionals?service=caregiver", color: "bg-healthcare-warm text-amber-600" },
  { icon: FlaskConical, title: "Lab Tests", description: "Home diagnostics", href: "/professionals?service=lab", color: "bg-secondary text-secondary-foreground" },
];

const steps = [
  { icon: Search, title: "Search", description: "Find verified healthcare professionals near you" },
  { icon: Clock, title: "Book", description: "Choose a convenient date and time for your visit" },
  { icon: MapPin, title: "Track", description: "Track your professional in real-time as they arrive" },
  { icon: Star, title: "Review", description: "Rate your experience and help others choose" },
];

const Index = () => {
  const { data: professionals = [], isLoading } = useProfessionals();
  const topProfessionals = professionals.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="gradient-hero">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
              <ShieldCheck className="h-4 w-4" />
              Verified Healthcare Professionals
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Healthcare at{" "}
              <span className="text-primary">Your Doorstep</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl leading-relaxed">
              Book trusted doctors, nurses, and specialists for home visits. 
              Quality care, zero commute.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/professionals">
                  Find a Professional
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/services">Explore Services</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" /> Verified Pros
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" /> Same-Day Visits
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-primary" /> 4.8★ Average
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="container py-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-bold text-foreground">Our Services</h2>
          <p className="mt-2 text-muted-foreground">Choose from a wide range of at-home healthcare services</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {serviceCards.map((s) => (
            <ServiceCard key={s.title} {...s} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/50">
        <div className="container py-16">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-foreground">How It Works</h2>
            <p className="mt-2 text-muted-foreground">Getting care at home is simple</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.title} className="relative flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary">
                  <step.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="absolute -top-2 -left-2 flex h-7 w-7 items-center justify-center rounded-full bg-card text-xs font-bold text-primary shadow-sm border border-border">
                  {i + 1}
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Professionals */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground">Top Professionals</h2>
            <p className="mt-1 text-muted-foreground">Highest-rated professionals near you</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/professionals">View All <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topProfessionals.map((pro) => (
              <ProfessionalCard key={pro.id} {...pro} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="gradient-primary">
        <div className="container py-16 text-center">
          <h2 className="font-display text-3xl font-bold text-primary-foreground">
            Ready to Get Care at Home?
          </h2>
          <p className="mt-3 text-primary-foreground/80 text-lg">
            Join thousands of patients who trust MedHome for quality healthcare.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="outline"
              size="xl"
              className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 backdrop-blur"
              asChild
            >
              <Link to="/signup">Create Free Account</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 backdrop-blur"
              asChild
            >
              <Link to="/provider-signup">
                <Stethoscope className="h-4 w-4 mr-1" />
                Join as a Provider
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
