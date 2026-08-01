import { Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useFavoriteIds, useToggleFavorite } from "@/hooks/useFavorites";
import { useToast } from "@/hooks/use-toast";
import { logError } from "@/lib/errorLogger";

interface Props {
  professionalId: string;
  className?: string;
}

const FavoriteButton = ({ professionalId, className }: Props) => {
  const { user } = useAuth();
  const favoriteIds = useFavoriteIds();
  const toggle = useToggleFavorite();
  const { toast } = useToast();

  if (!user) return null;

  const isFavorite = favoriteIds.has(professionalId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggle.mutateAsync({ professionalId, isFavorite });
      toast({ title: isFavorite ? "Removed from favourites" : "Saved to favourites" });
    } catch (error: any) {
      logError(error, { source: "toggleFavorite" });
      toast({ title: "Could not update favourites", description: error.message, variant: "destructive" });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={toggle.isPending}
      aria-label={isFavorite ? "Remove from favourites" : "Save to favourites"}
      aria-pressed={isFavorite}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-card/90 shadow-sm transition-colors hover:bg-muted",
        className,
      )}
    >
      {toggle.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <Heart className={cn("h-4 w-4", isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground")} />
      )}
    </button>
  );
};

export default FavoriteButton;
