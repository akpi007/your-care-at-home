import { Link } from "react-router-dom";
import { Star, MapPin, Clock, Award, DollarSign, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";

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
  bio?: string;
  city?: string;
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
  bio,
  city,
}: ProfessionalCardProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="group overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <div className="flex gap-4 p-5">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover"
            />
            {available && (
              <div className="absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-card bg-primary" />
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
              {city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {city}
                </span>
              )}
              {distance && !city && (
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
          <Button
            size="sm"
            variant="hero"
            onClick={(e) => {
              e.stopPropagation();
            }}
            asChild
          >
            <Link to={`/book/${id}`}>Book Now</Link>
          </Button>
        </div>
      </div>

      {/* Expanded Profile Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">{name}</DialogTitle>
            <DialogDescription className="sr-only">Professional profile for {name}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4">
            <div className="relative h-28 w-28 overflow-hidden rounded-2xl">
              <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
              {available && (
                <div className="absolute bottom-1.5 right-1.5 h-4 w-4 rounded-full border-2 border-card bg-primary" />
              )}
            </div>

            <div className="text-center">
              <h2 className="font-display text-xl font-bold text-foreground">{name}</h2>
              <p className="text-sm text-muted-foreground">{specialization}</p>
              <Badge variant="secondary" className="mt-2">{service}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-xl bg-muted p-4 mt-2">
            <div className="flex flex-col items-center text-center">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400 mb-1" />
              <span className="text-lg font-bold text-foreground">{rating}</span>
              <span className="text-xs text-muted-foreground">{reviews} reviews</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Award className="h-5 w-5 text-primary mb-1" />
              <span className="text-lg font-bold text-foreground">{experience}</span>
              <span className="text-xs text-muted-foreground">yrs exp</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <DollarSign className="h-5 w-5 text-primary mb-1" />
              <span className="text-lg font-bold text-foreground">${fee}</span>
              <span className="text-xs text-muted-foreground">per visit</span>
            </div>
          </div>

          {bio && (
            <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
          )}

          {distance && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              <span>{distance} away</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm mt-1">
            <div className={`h-2.5 w-2.5 rounded-full ${available ? "bg-primary" : "bg-muted-foreground"}`} />
            <span className={available ? "text-primary font-medium" : "text-muted-foreground"}>
              {available ? "Available now" : "Currently unavailable"}
            </span>
          </div>

          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="lg" className="flex-1" asChild>
              <Link to={`/book/${id}`} onClick={(e) => e.stopPropagation()}>
                <MessageSquare className="h-4 w-4 mr-1" /> Chat
              </Link>
            </Button>
            <Button variant="hero" size="lg" className="flex-1" asChild>
              <Link to={`/book/${id}`}>Book Now</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfessionalCard;
