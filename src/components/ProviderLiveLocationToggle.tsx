import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MapPin, Loader2, Radio } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProviderLiveLocationToggleProps {
  bookingId: string;
  professionalId: string;
}

const UPDATE_INTERVAL_MS = 15000; // push every 15s as a heartbeat
const MIN_DISTANCE_M = 10; // also push if moved ≥ 10m

function distanceMeters(a: GeolocationCoordinates, b: { lat: number; lng: number }) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.latitude);
  const dLng = toRad(b.lng - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.lat);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

const ProviderLiveLocationToggle = ({
  bookingId,
  professionalId,
}: ProviderLiveLocationToggleProps) => {
  const [sharing, setSharing] = useState(false);
  const [busy, setBusy] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const lastPushRef = useRef<{ lat: number; lng: number; at: number } | null>(null);
  const intervalRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Check existing sharing state on mount
  useEffect(() => {
    let cancelled = false;
    supabase
      .from("booking_locations")
      .select("is_sharing")
      .eq("booking_id", bookingId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data?.is_sharing) setSharing(true);
      });
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  const pushLocation = async (coords: GeolocationCoordinates) => {
    const { error } = await supabase.from("booking_locations").upsert(
      {
        booking_id: bookingId,
        professional_id: professionalId,
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy ?? null,
        is_sharing: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "booking_id" }
    );
    if (error) {
      console.error("Failed to push location", error);
    } else {
      lastPushRef.current = {
        lat: coords.latitude,
        lng: coords.longitude,
        at: Date.now(),
      };
    }
  };

  const stopWatching = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => stopWatching, []);

  const startSharing = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "This device doesn't support GPS.",
        variant: "destructive",
      });
      return;
    }
    setBusy(true);

    try {
      // Get one fix immediately
      const initial: GeolocationPosition = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
        })
      );
      await pushLocation(initial.coords);

      // Continuous watch
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const last = lastPushRef.current;
          const now = Date.now();
          const moved = last
            ? distanceMeters(pos.coords, { lat: last.lat, lng: last.lng })
            : Infinity;
          if (!last || moved >= MIN_DISTANCE_M || now - last.at >= UPDATE_INTERVAL_MS) {
            pushLocation(pos.coords);
          }
        },
        (err) => console.warn("watchPosition error", err),
        { enableHighAccuracy: true, maximumAge: 5000 }
      );

      // Heartbeat to keep updated_at fresh even when stationary
      intervalRef.current = window.setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (pos) => pushLocation(pos.coords),
          () => undefined,
          { enableHighAccuracy: true, maximumAge: 10000 }
        );
      }, UPDATE_INTERVAL_MS);

      setSharing(true);
      toast({ title: "Live location sharing started" });
    } catch (e: any) {
      toast({
        title: "Couldn't access location",
        description: e?.message ?? "Permission denied",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const stopSharing = async () => {
    setBusy(true);
    stopWatching();
    await supabase
      .from("booking_locations")
      .update({ is_sharing: false, updated_at: new Date().toISOString() })
      .eq("booking_id", bookingId);
    setSharing(false);
    setBusy(false);
    toast({ title: "Live location sharing stopped" });
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-2 min-w-0">
        <div className="relative">
          <MapPin className="h-4 w-4 text-primary" />
          {sharing && (
            <Radio className="absolute -top-1 -right-1 h-2.5 w-2.5 text-primary" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">Share live location</p>
          <p className="text-xs text-muted-foreground truncate">
            {sharing ? "Patient can track you in real time" : "Let the patient see your progress"}
          </p>
        </div>
      </div>
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <Switch
          checked={sharing}
          onCheckedChange={(checked) => (checked ? startSharing() : stopSharing())}
        />
      )}
    </div>
  );
};

export default ProviderLiveLocationToggle;
