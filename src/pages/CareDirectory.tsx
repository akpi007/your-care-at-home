import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO_CITIES, SEO_SERVICES, citySlug } from "@/data/seoLanding";

const CareDirectory = () => (
  <div className="flex min-h-screen flex-col bg-background">
    <Header />
    <main className="container flex-1 py-12">
      <h1 className="font-display text-3xl font-bold text-foreground">
        Home healthcare by service and city
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Browse verified professionals available for home visits across the cities we serve.
      </p>

      {SEO_SERVICES.map((s) => (
        <section key={s.slug} className="mt-10">
          <h2 className="font-display text-xl font-semibold text-foreground">{s.plural}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {SEO_CITIES.map((c) => (
              <Link
                key={c}
                to={`/care/${s.slug}/${citySlug(c)}`}
                className="rounded-full bg-muted px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                {s.label} in {c}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
    <Footer />
  </div>
);

export default CareDirectory;
