import { useMemo } from "react";
import { MapPin, Navigation, Radio, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookingLocation } from "@/hooks/useBookingLocation";
import { formatDistanceToNow } from "date-fns";

interface PatientLiveTrackingProps {
  bookingId: string;
  patientLat?: number | null;
  patientLng?: number | null;
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

const PatientLiveTracking = ({ bookingId, patientLat, patientLng }: PatientLiveTrackingProps) => {
  const { location, loading } = useBookingLocation(bookingId);

  const distanceKm = useMemo(() => {
    if (!location || patientLat == null || patientLng == null) return null;
    return haversineKm(
      { lat: Number(location.latitude), lng: Number(location.longitude) },
      { lat: Number(patientLat), lng: Number(patientLng) }
    );
  }, [location, patientLat, patientLng]);

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card/50 p-3 text-sm text-muted-foreground">
        Checking for live location…
      </div>
    );
  }

  if (!location || !location.is_sharing) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 p-3 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        Live tracking will appear here once your professional starts sharing their location.
      </div>
    );
  }

  const mapsUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
  const updated = formatDistanceToNow(new Date(location.updated_at), { addSuffix: true });

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Radio className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Live location active</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
        {distanceKm != null && (
          <span className="flex items-center gap-1">
            <Navigation className="h-3 w-3" />
            {distanceKm < 1
              ? `${Math.round(distanceKm * 1000)} m away`
              : `${distanceKm.toFixed(1)} km away`}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Updated {updated}
        </span>
      </div>
      <Button asChild size="sm" variant="outline" className="w-full">
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
          <MapPin className="h-4 w-4 mr-1" /> Open in Maps
        </a>
      </Button>
    </div>
  );
};

export default PatientLiveTracking;
