import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import ProfessionalCard from "@/components/ProfessionalCard";
import { useProfessionals } from "@/hooks/useProfessionals";
import { SEO_SERVICES, citySlug } from "@/data/seoLanding";

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
  Download,
  Baby,
  Brain,
  Smile,
} from "lucide-react";

const serviceCards = [
  { icon: Stethoscope, title: "Doctors", description: "General & specialist", href: "/professionals?service=doctor", color: "bg-healthcare-soft-blue text-healthcare-blue" },
  { icon: Syringe, title: "Nurses", description: "Professional nursing", href: "/professionals?service=nurse", color: "bg-healthcare-soft-green text-healthcare-green" },
  { icon: Activity, title: "Physiotherapy", description: "Rehab & therapy", href: "/professionals?service=physio", color: "bg-accent text-accent-foreground" },
  { icon: Heart, title: "Caregivers", description: "Daily care support", href: "/professionals?service=caregiver", color: "bg-healthcare-warm text-amber-600" },
  { icon: FlaskConical, title: "Lab Tests", description: "Home diagnostics", href: "/professionals?service=lab", color: "bg-secondary text-secondary-foreground" },
  { icon: Baby, title: "Midwife", description: "Pregnancy & birth care", href: "/professionals?service=midwife", color: "bg-healthcare-soft-green text-healthcare-green" },
  { icon: Stethoscope, title: "Paediatrician", description: "Child specialist", href: "/professionals?service=paediatrician", color: "bg-healthcare-soft-blue text-healthcare-blue" },
  { icon: Brain, title: "Psychiatrist", description: "Mental health care", href: "/professionals?service=psychiatrist", color: "bg-accent text-accent-foreground" },
  { icon: Smile, title: "Dentist", description: "Oral & dental care", href: "/professionals?service=dentist", color: "bg-healthcare-warm text-amber-600" },
];

const steps = [
  { icon: Search, title: "Search", description: "Find verified healthcare professionals near you" },
  { icon: Clock, title: "Book", description: "Choose a convenient date and time for your visit" },
  { icon: MapPin, title: "Track", description: "Track your professional in real-time as they arrive" },
  { icon: Star, title: "Review", description: "Rate your experience and help others choose" },
];

const Index = () => {
  const { data: professionals = [], isLoading } = useProfessionals();
  const savedLocation = JSON.parse(localStorage.getItem("medhome_location") || "{}");
  const userCity = savedLocation.city || "";
  
  // Show professionals from user's city first, then others
  const sorted = [...professionals].sort((a, b) => {
    const aMatch = a.city?.toLowerCase() === userCity.toLowerCase() ? 0 : 1;
    const bMatch = b.city?.toLowerCase() === userCity.toLowerCase() ? 0 : 1;
    return aMatch - bMatch;
  });
  const topProfessionals = sorted.slice(0, 6);

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
              Home Based Care in{" "}
              <span className="text-primary">Zambia</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl leading-relaxed">
              Book verified doctors, nurses, midwives and physiotherapists for home visits in
              Lusaka, Kitwe, Ndola and across Zambia. Quality care, zero commute.
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
            <h2 className="font-display text-3xl font-bold text-foreground">
              {userCity ? `Top Professionals in ${userCity}` : "Top Professionals"}
            </h2>
            <p className="mt-1 text-muted-foreground">
              {userCity ? `Healthcare providers near ${userCity}` : "Highest-rated professionals near you"}
            </p>
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

      {/* SEO content: home based care in Zambia */}
      <section className="bg-muted/50">
        <div className="container py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-3xl font-bold text-foreground">
              Home based care and doctor home visits across Zambia
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Rapha Telehealth connects Zambian families with licence-verified healthcare
              professionals who come to your home. Whether you need home nursing services in Lusaka,
              a doctor home visit in Kitwe, a midwife in Ndola, physiotherapy at home in Livingstone
              or a lab test collected at your door, you can compare providers, see transparent
              prices in Kwacha and book a same-day visit.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Every private nurse, doctor and therapist on the platform is background-checked and
              licence-verified. You can track your provider in real time as they travel to you, chat
              in-app and rate the visit afterwards — no queues, no commute, no waiting rooms.
            </p>

            <h3 className="mt-10 font-display text-xl font-semibold text-foreground">
              Popular home healthcare searches in Zambia
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {SEO_SERVICES.slice(0, 6).flatMap((s) =>
                ["Lusaka", "Kitwe", "Ndola"].map((c) => (
                  <Link
                    key={`${s.slug}-${c}`}
                    to={`/care/${s.slug}/${citySlug(c)}`}
                    className="rounded-full bg-card px-3 py-1.5 text-sm text-foreground shadow-sm transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    {s.label} in {c}
                  </Link>
                )),
              )}
            </div>
            <div className="mt-6">
              <Link to="/care" className="text-sm font-medium text-primary hover:underline">
                Browse all services and cities in Zambia →
              </Link>
            </div>
          </div>
        </div>
      </section>



      {/* CTA */}
      <section className="gradient-primary">
        <div className="container py-16 text-center">
          <h2 className="font-display text-3xl font-bold text-primary-foreground">
            Ready to Get Care at Home?
          </h2>
          <p className="mt-3 text-primary-foreground/80 text-lg">
            Join thousands of patients who trust Rapha Telehealth for quality healthcare.
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
              size="xl"
              className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 backdrop-blur"
              asChild
            >
              <Link to="/provider-signup">
                <Stethoscope className="h-4 w-4 mr-1" />
                Join as a Provider
              </Link>
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 backdrop-blur"
              asChild
            >
              <Link to="/install">
                <Download className="h-4 w-4 mr-1" />
                Download App
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
