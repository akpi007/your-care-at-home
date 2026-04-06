import { useState, useMemo } from "react";
import { useProfessionals } from "@/hooks/useProfessionals";
import { useGeolocation } from "@/hooks/useGeolocation";
import ProfessionalCard from "@/components/ProfessionalCard";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, Navigation } from "lucide-react";

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Approximate coordinates for known cities (can be expanded)
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

const DashboardNearby = () => {
  const { data: professionals = [], isLoading } = useProfessionals();
  const { position, loading: geoLoading, error: geoError, requestLocation } = useGeolocation();

  const professionalsWithDistance = useMemo(() => {
    if (!position) return professionals.map(p => ({ ...p, distanceKm: null }));

    return professionals.map(p => {
      const cityKey = p.city?.toLowerCase().trim();
      const coords = cityKey ? CITY_COORDS[cityKey] : null;
      const distanceKm = coords
        ? getDistanceKm(position.latitude, position.longitude, coords.lat, coords.lng)
        : null;
      return { ...p, distanceKm };
    }).sort((a, b) => {
      if (a.distanceKm === null && b.distanceKm === null) return 0;
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;
      return a.distanceKm - b.distanceKm;
    });
  }, [professionals, position]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-foreground">Nearby Professionals</h3>
        {!position && (
          <Button variant="outline" size="sm" onClick={requestLocation} disabled={geoLoading}>
            {geoLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Navigation className="h-4 w-4 mr-1" />}
            Share Location
          </Button>
        )}
      </div>

      {position && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground rounded-lg bg-accent/50 px-3 py-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span>Location active — showing distance to professionals</span>
        </div>
      )}

      {geoError && (
        <p className="text-sm text-destructive">{geoError}</p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {professionalsWithDistance.slice(0, 6).map(pro => (
            <ProfessionalCard
              key={pro.id}
              {...pro}
              distance={pro.distanceKm !== null ? `${pro.distanceKm.toFixed(1)} km` : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardNearby;
