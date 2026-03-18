import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PatientLocationLinkProps {
  latitude: number | null;
  longitude: number | null;
  address?: string | null;
}

const PatientLocationLink = ({ latitude, longitude, address }: PatientLocationLinkProps) => {
  if (!latitude || !longitude) {
    return address ? (
      <span className="truncate max-w-[200px] text-sm text-muted-foreground">📍 {address}</span>
    ) : null;
  }

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {address && (
        <span className="truncate max-w-[200px] text-sm text-muted-foreground">📍 {address}</span>
      )}
      <Button variant="outline" size="sm" asChild className="h-7 text-xs">
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
          <Navigation className="h-3 w-3 mr-1" /> Navigate
        </a>
      </Button>
    </div>
  );
};

export default PatientLocationLink;
