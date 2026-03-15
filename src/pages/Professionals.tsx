import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfessionalCard from "@/components/ProfessionalCard";
import { useProfessionals } from "@/hooks/useProfessionals";
import { useServices } from "@/hooks/useServices";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";
import ProfessionalsFilter, { Filters, defaultFilters } from "@/components/ProfessionalsFilter";

const Professionals = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const activeService = searchParams.get("service") || "all";

  const { data: professionals = [], isLoading } = useProfessionals();
  const { data: services = [] } = useServices();

  const filtered = useMemo(() => {
    return professionals.filter((p) => {
      const matchesService =
        activeService === "all" ||
        p.service.toLowerCase().includes(activeService);
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.specialization.toLowerCase().includes(search.toLowerCase());
      const matchesPrice =
        p.fee >= filters.priceRange[0] && p.fee <= filters.priceRange[1];
      const matchesRating = p.rating >= filters.minRating;
      const matchesAvailable = !filters.availableOnly || p.available;
      const matchesCity =
        filters.city === "all" || p.city.toLowerCase() === filters.city.toLowerCase();
      return matchesService && matchesSearch && matchesPrice && matchesRating && matchesAvailable && matchesCity;
    });
  }, [activeService, search, professionals, filters]);

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
          <ProfessionalsFilter filters={filters} onChange={setFilters} />
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
              variant={activeService === s.name.toLowerCase() ? "default" : "secondary"}
              className="cursor-pointer px-4 py-1.5 text-sm"
              onClick={() => setSearchParams({ service: s.name.toLowerCase() })}
            >
              {s.name}
            </Badge>
          ))}
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-sm text-muted-foreground mb-4">
            {filtered.length} professional{filtered.length !== 1 ? "s" : ""} found
          </p>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length > 0 ? (
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
