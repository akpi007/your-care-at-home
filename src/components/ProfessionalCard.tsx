import { Link } from "react-router-dom";
import { Star, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProfessionalCardProps {
  id: string;
  name: string;
  specialization: string;
  service: string;
  rating: number;
  reviews: number;
  experience: number;
  fee: number;
  distance?: string;
  imageUrl: string;
  available: boolean;
}

const ProfessionalCard = ({
  id,
  name,
  specialization,
  service,
  rating,
  reviews,
  experience,
  fee,
  distance,
  imageUrl,
  available,
}: ProfessionalCardProps) => {
  return (
    <div className="group overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      <div className="flex gap-4 p-5">
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
          {available && (
            <div className="absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-card bg-healthcare-green" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display font-semibold text-card-foreground truncate">{name}</h3>
              <p className="text-sm text-muted-foreground">{specialization}</p>
            </div>
            <Badge variant="secondary" className="text-xs shrink-0">
              {service}
            </Badge>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {rating} ({reviews})
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {experience} yrs
            </span>
            {distance && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {distance}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <div>
          <span className="text-lg font-bold text-foreground">${fee}</span>
          <span className="text-sm text-muted-foreground"> / visit</span>
        </div>
        <Button size="sm" variant="hero" asChild>
          <Link to={`/book/${id}`}>Book Now</Link>
        </Button>
      </div>
    </div>
  );
};

export default ProfessionalCard;
