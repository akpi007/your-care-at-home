import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Download, MapPin, ArrowLeft } from "lucide-react";
import raphaLogoIcon from "@/assets/rapha-logo-nav.png";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { locationData } from "@/data/locationData";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const location = useLocation();

  const [savedLocation, setSavedLocation] = useState<{ country: string; region: string; city: string } | null>(null);
  const [locCountry, setLocCountry] = useState("");
  const [locRegion, setLocRegion] = useState("");
  const [locCity, setLocCity] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("medhome_location");
    if (stored) {
      const parsed = JSON.parse(stored);
      setSavedLocation(parsed);
      setLocCountry(parsed.country);
      setLocRegion(parsed.region);
      setLocCity(parsed.city);
    }
  }, []);

  const selectedCountry = locationData.find((l) => l.country === locCountry);
  const selectedRegion = selectedCountry?.regions.find((r) => r.name === locRegion);

  const handleLocationSave = () => {
    if (!locCountry || !locRegion || !locCity) return;
    const loc = { country: locCountry, region: locRegion, city: locCity };
    localStorage.setItem("medhome_location", JSON.stringify(loc));
    setSavedLocation(loc);
    setLocationOpen(false);
    window.location.reload();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Check if user is a professional
  const { data: isProfessional } = useQuery({
    queryKey: ["is-professional", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from("professionals")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      return !!data;
    },
    enabled: !!user,
  });

  const navLinks = [
    { to: "/home", label: "Home" },
    { to: "/professionals", label: "Find Professionals" },
    { to: "/services", label: "Services" },
    { to: "/ai-assistant", label: "AI Assistant" },
    ...(user ? [{ to: "/dashboard", label: "My Dashboard" }] : []),
    ...(isProfessional ? [{ to: "/provider-dashboard", label: "Provider Dashboard" }] : []),
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          {location.pathname !== "/home" && (
            <button
              onClick={() => navigate(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <Link to="/home" className="flex items-center gap-2">
          <img src={raphaLogoIcon} alt="Rapha Telehealth" className="h-9 w-9 object-contain" />
          <span className="font-display text-xl font-bold text-foreground">
            Rapha<span className="text-primary"> Telehealth</span>
          </span>
        </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Popover open={locationOpen} onOpenChange={setLocationOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                {savedLocation?.city || "Set Location"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="end">
              <p className="text-sm font-semibold text-foreground mb-3">Change Location</p>
              <div className="space-y-2">
                <Select value={locCountry} onValueChange={(v) => { setLocCountry(v); setLocRegion(""); setLocCity(""); }}>
                  <SelectTrigger><SelectValue placeholder="Country" /></SelectTrigger>
                  <SelectContent>
                    {locationData.map((l) => <SelectItem key={l.country} value={l.country}>{l.country}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={locRegion} onValueChange={(v) => { setLocRegion(v); setLocCity(""); }} disabled={!locCountry}>
                  <SelectTrigger><SelectValue placeholder={selectedCountry?.regionLabel || "Region"} /></SelectTrigger>
                  <SelectContent>
                    {selectedCountry?.regions.map((r) => <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={locCity} onValueChange={setLocCity} disabled={!locRegion}>
                  <SelectTrigger><SelectValue placeholder="City" /></SelectTrigger>
                  <SelectContent>
                    {selectedRegion?.cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button size="sm" className="w-full mt-1" disabled={!locCountry || !locRegion || !locCity} onClick={handleLocationSave}>
                  Update Location
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="soft" size="sm" asChild>
            <Link to="/install"><Download className="h-4 w-4 mr-1" /> Get App</Link>
          </Button>
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1" /> Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log In</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/provider-signup">For Providers</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-card p-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <Button variant="soft" asChild>
                <Link to="/install" onClick={() => setMobileOpen(false)}>
                  <Download className="h-4 w-4 mr-1" /> Download App
                </Link>
              </Button>
              {user ? (
                <Button variant="outline" onClick={() => { setMobileOpen(false); handleSignOut(); }}>
                  Sign Out
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link to="/login" onClick={() => setMobileOpen(false)}>Log In</Link>
                  </Button>
                  <Button variant="hero" asChild>
                    <Link to="/signup" onClick={() => setMobileOpen(false)}>Get Started</Link>
                  </Button>
                  <Button variant="soft" asChild>
                    <Link to="/provider-signup" onClick={() => setMobileOpen(false)}>Join as Provider</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
