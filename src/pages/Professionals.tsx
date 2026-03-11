import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfessionalCard from "@/components/ProfessionalCard";
import { professionals, services } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal } from "lucide-react";

const Professionals = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const activeService = searchParams.get("service") || "all";

  const filtered = useMemo(() => {
    return professionals.filter((p) => {
      const matchesService =
        activeService === "all" ||
        p.service.toLowerCase().includes(activeService);
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.specialization.toLowerCase().includes(search.toLowerCase());
      return matchesService && matchesSearch;
    });
  }, [activeService, search]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="container py-8 flex-1">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Find Professionals</h1>
          <p className="mt-1 text-muted-foreground">Browse verified healthcare professionals near you</p>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or specialization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-input bg-card px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted transition-colors">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Service tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Badge
            variant={activeService === "all" ? "default" : "secondary"}
            className="cursor-pointer px-4 py-1.5 text-sm"
            onClick={() => setSearchParams({})}
          >
            All
          </Badge>
          {services.map((s) => (
            <Badge
              key={s.id}
              variant={activeService === s.id ? "default" : "secondary"}
              className="cursor-pointer px-4 py-1.5 text-sm"
              onClick={() => setSearchParams({ service: s.id })}
            >
              {s.name}
            </Badge>
          ))}
        </div>

        {/* Results */}
        {filtered.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((pro) => (
              <ProfessionalCard key={pro.id} {...pro} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-16 text-center">
            <Search className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="font-display text-lg font-semibold text-foreground">No professionals found</h3>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Professionals;
