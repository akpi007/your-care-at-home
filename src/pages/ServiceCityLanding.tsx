import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MapPin, ShieldCheck, Clock } from "lucide-react";
import NotFound from "@/pages/NotFound";
import {
  SEO_CITIES,
  SEO_SERVICES,
  cityFromSlug,
  citySlug,
  serviceFromSlug,
} from "@/data/seoLanding";

function useHeadTags(title: string, description: string, jsonLd: object, canonical: string) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    const setMeta = (selector: string, attr: string, value: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, value);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
      return el;
    };

    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", description);

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonical;

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      document.title = prevTitle;
      script.remove();
    };
  }, [title, description, jsonLd, canonical]);
}

const ServiceCityLanding = () => {
  const { service = "", city = "" } = useParams();
  const svc = serviceFromSlug(service);
  const cityName = cityFromSlug(city);

  const title =
    svc && cityName ? `${svc.label} Home Visit in ${cityName}, Zambia | Rapha Telehealth` : "";
  const description =
    svc && cityName
      ? `Book a verified ${svc.label.toLowerCase()} for a home visit in ${cityName}, Zambia. Home based care with transparent pricing, live tracking and same-day availability.`
      : "";
  const canonical = `https://www.raphatelehealth.com/care/${service}/${city}`;

  const jsonLd =
    svc && cityName
      ? {
          "@context": "https://schema.org",
          "@type": "MedicalBusiness",
          name: `Rapha Telehealth — ${svc.plural} in ${cityName}`,
          description,
          areaServed: { "@type": "City", name: cityName, addressCountry: "ZM" },
          medicalSpecialty: svc.label,
          url: canonical,
        }
      : {};


  useHeadTags(title, description, jsonLd, canonical);

  if (!svc || !cityName) return <NotFound />;

  const relatedCities = SEO_CITIES.filter((c) => c !== cityName).slice(0, 12);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="container flex-1 py-12">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>{" "}
          / <span className="text-foreground">{svc.label} in {cityName}</span>
        </nav>

        <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          {svc.label} at home in {cityName}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{svc.description}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="hero" asChild>
            <Link to={`/professionals?service=${svc.slug}&city=${encodeURIComponent(cityName)}`}>
              Find a {svc.label.toLowerCase()} in {cityName}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/services">Browse all services</Link>
          </Button>
        </div>

        <section className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Verified professionals", body: `Every ${svc.label.toLowerCase()} is licence-checked and background-verified before taking bookings.` },
            { icon: Clock, title: "Same-day visits", body: `Same-day and scheduled home visits across ${cityName} and surrounding areas.` },
            { icon: MapPin, title: "Live tracking", body: "Follow your provider on the way and know exactly when they'll arrive." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl bg-card p-5 shadow-card">
              <f.icon className="h-6 w-6 text-primary" />
              <h2 className="mt-3 font-display text-lg font-semibold text-foreground">{f.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            How a home visit works in {cityName}
          </h2>
          <ol className="mt-4 space-y-3">
            {[
              `Search verified ${svc.plural.toLowerCase()} available in ${cityName}.`,
              "Pick a time that suits you and share your location.",
              "Track your provider in real time as they travel to you.",
              "Receive care at home and rate your visit afterwards.",
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold text-foreground">Other services in {cityName}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {SEO_SERVICES.filter((s) => s.slug !== svc.slug).map((s) => (
              <Link
                key={s.slug}
                to={`/care/${s.slug}/${citySlug(cityName)}`}
                className="rounded-full bg-muted px-4 py-2 text-sm text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                {s.plural} in {cityName}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            {svc.plural} in other cities
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {relatedCities.map((c) => (
              <Link
                key={c}
                to={`/care/${svc.slug}/${citySlug(c)}`}
                className="rounded-full bg-muted px-4 py-2 text-sm text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                {svc.plural} in {c}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ServiceCityLanding;
