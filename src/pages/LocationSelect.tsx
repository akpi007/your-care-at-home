import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Heart, Globe, ArrowRight, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { locationData } from "@/data/locationData";
import worldMapBg from "@/assets/world-map-bg.jpg";

const findClosestCity = (detectedCountry: string, detectedRegion: string, detectedCity: string) => {
  const countryMatch = locationData.find(
    (l) => l.country.toLowerCase() === detectedCountry.toLowerCase()
  );
  if (!countryMatch) return null;

  let regionMatch = countryMatch.regions.find(
    (r) => r.name.toLowerCase() === detectedRegion.toLowerCase()
  );
  if (!regionMatch) {
    regionMatch = countryMatch.regions.find((r) =>
      detectedRegion.toLowerCase().includes(r.name.toLowerCase()) ||
      r.name.toLowerCase().includes(detectedRegion.toLowerCase())
    );
  }

  if (regionMatch) {
    let cityMatch = regionMatch.cities.find(
      (c) => c.toLowerCase() === detectedCity.toLowerCase()
    );
    if (!cityMatch) {
      cityMatch = regionMatch.cities.find((c) =>
        detectedCity.toLowerCase().includes(c.toLowerCase()) ||
        c.toLowerCase().includes(detectedCity.toLowerCase())
      );
    }
    return {
      country: countryMatch.country,
      region: regionMatch.name,
      city: cityMatch || regionMatch.cities[0],
    };
  }

  return { country: countryMatch.country, region: countryMatch.regions[0].name, city: countryMatch.regions[0].cities[0] };
};

const LocationSelect = () => {
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [detecting, setDetecting] = useState(true);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect authenticated users to home
  useEffect(() => {
    if (!loading && user) {
      navigate("/home", { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const detect = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        const match = findClosestCity(
          data.country_name || "",
          data.region || "",
          data.city || ""
        );
        if (match) {
          setCountry(match.country);
          setRegion(match.region);
          setCity(match.city);
        }
      } catch {
        // silently fail – user can pick manually
      } finally {
        setDetecting(false);
      }
    };
    detect();
  }, []);

  const selectedCountry = locationData.find((l) => l.country === country);
  const selectedRegion = selectedCountry?.regions.find((r) => r.name === region);
  const regionLabel = selectedCountry?.regionLabel ?? "State / Province";

  const handleSubmit = () => {
    if (!country || !region || !city) return;
    localStorage.setItem(
      "medhome_location",
      JSON.stringify({ country, region, city })
    );
    navigate("/signup");
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background image */}
      <img
        src={worldMapBg}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="rounded-2xl border border-border/30 bg-card/95 backdrop-blur-md shadow-2xl p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary mb-4 shadow-lg">
              <Heart className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Med<span className="text-primary">Home</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              Healthcare at your doorstep — anywhere in the world
            </p>
          </div>

          {/* Location heading */}
          {detecting ? (
            <div className="flex items-center gap-2 text-sm text-primary mb-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Detecting your location…
            </div>
          ) : null}

          <div className="flex items-center gap-2 mb-6">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">
              Select Your Location
            </h2>
          </div>

          {/* Selects */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Country</label>
              <Select
                value={country}
                onValueChange={(v) => {
                  setCountry(v);
                  setRegion("");
                  setCity("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose your country" />
                </SelectTrigger>
                <SelectContent>
                  {locationData.map((l) => (
                    <SelectItem key={l.country} value={l.country}>
                      {l.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {regionLabel}
              </label>
              <Select
                value={region}
                onValueChange={(v) => {
                  setRegion(v);
                  setCity("");
                }}
                disabled={!country}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Choose ${regionLabel.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {selectedCountry?.regions.map((r) => (
                    <SelectItem key={r.name} value={r.name}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                City / Locality
              </label>
              <Select
                value={city}
                onValueChange={setCity}
                disabled={!region}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose your city" />
                </SelectTrigger>
                <SelectContent>
                  {selectedRegion?.cities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submit */}
          <Button
            variant="hero"
            size="xl"
            className="w-full mt-8"
            disabled={!country || !region || !city}
            onClick={handleSubmit}
          >
            Continue
            <ArrowRight className="h-5 w-5" />
          </Button>

          <p className="mt-4 text-xs text-center text-muted-foreground">
            We'll show you healthcare professionals available near you
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationSelect;
