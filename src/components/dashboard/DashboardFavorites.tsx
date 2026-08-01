import { Link } from "react-router-dom";
import { Heart, Loader2, MapPin, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFavorites } from "@/hooks/useFavorites";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FavoriteButton from "@/components/FavoriteButton";

const DashboardFavorites = () => {
  const { data: favorites = [], isLoading } = useFavorites();
  const ids = favorites.map((f) => f.professional_id);

  const { data: providers = [], isLoading: loadingProviders } = useQuery({
    queryKey: ["favorite-providers", ids.join(",")],
    queryFn: async () => {
      if (ids.length === 0) return [];
      const { data, error } = await supabase
        .from("professionals")
        .select("id, display_name, specialization, city, image_url, rating, total_reviews, consultation_fee, available")
        .in("id", ids);
      if (error) throw error;
      return data ?? [];
    },
    enabled: ids.length > 0,
  });

  if (isLoading || loadingProviders) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="rounded-xl bg-card p-10 text-center shadow-card">
        <Heart className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          No saved professionals yet.{" "}
          <Link to="/professionals" className="text-primary underline">
            Browse professionals
          </Link>{" "}
          and tap the heart to save them here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {providers.map((p) => (
        <div key={p.id} className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-card">
          <img
            src={p.image_url || "/placeholder.svg"}
            alt={p.display_name || "Professional"}
            className="h-14 w-14 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <h4 className="truncate font-semibold text-card-foreground">{p.display_name || "Professional"}</h4>
            <p className="truncate text-sm text-muted-foreground">{p.specialization}</p>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {Number(p.rating ?? 0).toFixed(1)} ({p.total_reviews ?? 0})
              </span>
              {p.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {p.city}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <FavoriteButton professionalId={p.id} />
            {p.available ? (
              <Button variant="hero" size="sm" asChild>
                <Link to={`/book/${p.id}`}>Book</Link>
              </Button>
            ) : (
              <Badge className="bg-muted text-muted-foreground">Unavailable</Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardFavorites;
