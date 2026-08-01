import { useQuery } from "@tanstack/react-query";
import { Loader2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReviewResponseDialog from "@/components/ReviewResponseDialog";

const ProviderReviewsPanel = ({ professionalId }: { professionalId?: string }) => {
  const { data = [], isLoading } = useQuery({
    queryKey: ["provider-reviews", professionalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, provider_response")
        .eq("professional_id", professionalId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!professionalId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (data.length === 0) {
    return <p className="py-12 text-center text-muted-foreground">No reviews yet.</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((r: any) => (
        <div key={r.id} className="rounded-xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`}
              />
            ))}
            <span className="ml-2 text-xs text-muted-foreground">
              {new Date(r.created_at).toLocaleDateString()}
            </span>
          </div>
          {r.comment && <p className="mt-2 text-sm text-foreground">{r.comment}</p>}
          {r.provider_response && (
            <div className="mt-3 rounded-lg bg-muted/60 p-3">
              <p className="text-xs font-semibold text-foreground">Your reply</p>
              <p className="text-sm text-muted-foreground">{r.provider_response}</p>
            </div>
          )}
          <div className="mt-3">
            <ReviewResponseDialog reviewId={r.id} existing={r.provider_response} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProviderReviewsPanel;
