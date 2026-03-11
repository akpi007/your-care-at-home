import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import { Stethoscope, Syringe, Activity, Heart, FlaskConical } from "lucide-react";

const allServices = [
  { icon: Stethoscope, title: "Doctors", description: "General physicians and specialists for consultations, check-ups, and prescriptions at home.", href: "/professionals?service=doctor", color: "bg-healthcare-soft-blue text-healthcare-blue" },
  { icon: Syringe, title: "Nurses", description: "Professional nursing care including injections, wound dressing, IV drips, and post-surgery care.", href: "/professionals?service=nurse", color: "bg-healthcare-soft-green text-healthcare-green" },
  { icon: Activity, title: "Physiotherapists", description: "Physical therapy and rehabilitation sessions for sports injuries, post-surgery recovery, and chronic pain.", href: "/professionals?service=physio", color: "bg-accent text-accent-foreground" },
  { icon: Heart, title: "Caregivers", description: "Trained caregivers for elderly care, daily assistance, and companionship services.", href: "/professionals?service=caregiver", color: "bg-healthcare-warm text-amber-600" },
  { icon: FlaskConical, title: "Lab Technicians", description: "At-home blood tests, diagnostics, and sample collection with quick digital results.", href: "/professionals?service=lab", color: "bg-secondary text-secondary-foreground" },
];

const Services = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="container py-8 flex-1">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground">Our Services</h1>
          <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
            We bring a full range of healthcare services to your home, delivered by verified professionals.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {allServices.map((s) => (
            <ServiceCard key={s.title} {...s} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Services;
