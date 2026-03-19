import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Heart, LogOut, Download } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

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
    { to: "/", label: "Home" },
    { to: "/professionals", label: "Find Professionals" },
    { to: "/services", label: "Services" },
    { to: "/ai-assistant", label: "AI Assistant" },
    { to: "/dashboard", label: "My Dashboard" },
    ...(isProfessional ? [{ to: "/provider-dashboard", label: "Provider Dashboard" }] : []),
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            Med<span className="text-primary">Home</span>
          </span>
        </Link>

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
