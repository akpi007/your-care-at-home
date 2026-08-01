import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfessionalCard from "@/components/ProfessionalCard";
import { useProfessionals } from "@/hooks/useProfessionals";
import { useServices } from "@/hooks/useServices";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Navigation } from "lucide-react";
import ProfessionalsFilter, { Filters, defaultFilters } from "@/components/ProfessionalsFilter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFavoriteIds } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";
import { Heart } from "lucide-react";

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  lagos: { lat: 6.5244, lng: 3.3792 },
  abuja: { lat: 9.0579, lng: 7.4951 },
  ibadan: { lat: 7.3775, lng: 3.947 },
  kano: { lat: 12.0022, lng: 8.5919 },
  "port harcourt": { lat: 4.8156, lng: 7.0498 },
  benin: { lat: 6.335, lng: 5.6037 },
  enugu: { lat: 6.4584, lng: 7.5464 },
  kaduna: { lat: 10.5105, lng: 7.4165 },
  accra: { lat: 5.6037, lng: -0.187 },
  nairobi: { lat: -1.2921, lng: 36.8219 },
};

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const Professionals = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const activeService = searchParams.get("service") || "all";
  const { data: professionals = [], isLoading } = useProfessionals();
  const { data: services = [] } = useServices();

  const { position, loading: geoLoading, requestLocation } = useGeolocation();
  const [sortBy, setSortBy] = useState("recommended");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const favoriteIds = useFavoriteIds();

  const distanceFor = (city?: string) => {
    const key = city?.toLowerCase().trim();
    const coords = key ? CITY_COORDS[key] : null;
    if (!position || !coords) return null;
    return getDistanceKm(position.latitude, position.longitude, coords.lat, coords.lng);
  };

  const filtered = useMemo(() => {
    const list = professionals.filter((p) => {
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
      const matchesFavorites = !favoritesOnly || favoriteIds.has(p.id);
      return (
        matchesService &&
        matchesSearch &&
        matchesPrice &&
        matchesRating &&
        matchesAvailable &&
        matchesCity &&
        matchesFavorites
      );
    });

    // Relevance score: availability, rating confidence, proximity, experience.
    const score = (p: any) => {
      const dist = distanceFor(p.city);
      const proximity = dist === null ? 0 : Math.max(0, 30 - dist) / 30; // 0..1
      const confidence = Math.min(1, (p.reviews ?? 0) / 20);
      return (
        (p.available ? 2 : 0) +
        (p.rating / 5) * 2.5 * (0.5 + confidence / 2) +
        proximity * 2 +
        Math.min(1, (p.experience ?? 0) / 15)
      );
    };

    const sorted = [...list];
    if (sortBy === "distance") {
      sorted.sort((a, b) => (distanceFor(a.city) ?? Infinity) - (distanceFor(b.city) ?? Infinity));
    } else if (sortBy === "rating") {
      sorted.sort((a, b) => b.rating - a.rating || (b.reviews ?? 0) - (a.reviews ?? 0));
    } else if (sortBy === "price_low") {
      sorted.sort((a, b) => a.fee - b.fee);
    } else if (sortBy === "price_high") {
      sorted.sort((a, b) => b.fee - a.fee);
    } else {
      sorted.sort((a, b) => score(b) - score(a));
    }
    return sorted;
  }, [activeService, search, professionals, filters, sortBy, favoritesOnly, favoriteIds, position]);

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
          <Button variant="outline" size="sm" onClick={requestLocation} disabled={geoLoading || !!position}>
            {geoLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Navigation className="h-4 w-4 mr-1" />}
            {position ? "Location On" : "Distance"}
          </Button>
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
            {filtered.map((pro) => {
              const cityKey = pro.city?.toLowerCase().trim();
              const coords = cityKey ? CITY_COORDS[cityKey] : null;
              const distKm = position && coords
                ? getDistanceKm(position.latitude, position.longitude, coords.lat, coords.lng)
                : null;
              return (
                <ProfessionalCard
                  key={pro.id}
                  {...pro}
                  distance={distKm !== null ? `${distKm.toFixed(1)} km` : undefined}
                />
              );
            })}
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
