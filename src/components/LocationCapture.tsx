import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, CheckCircle2 } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";

interface LocationCaptureProps {
  onLocationCaptured: (lat: number, lng: number) => void;
}

const LocationCapture = ({ onLocationCaptured }: LocationCaptureProps) => {
  const { position, loading, error, requestLocation } = useGeolocation();

  useEffect(() => {
    if (position) {
      onLocationCaptured(position.latitude, position.longitude);
    }
  }, [position, onLocationCaptured]);

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={position ? "outline" : "secondary"}
        size="sm"
        onClick={requestLocation}
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Getting location...</>
        ) : position ? (
          <><CheckCircle2 className="h-4 w-4 mr-1 text-primary" /> Location captured</>
        ) : (
          <><MapPin className="h-4 w-4 mr-1" /> Share my location with provider</>
        )}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {position && (
        <p className="text-xs text-muted-foreground text-center">
          📍 {position.latitude.toFixed(4)}, {position.longitude.toFixed(4)}
        </p>
      )}
    </div>
  );
};

export default LocationCapture;
