import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Check, X, MessageSquare, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import BookingChat from "@/components/BookingChat";
import PatientLocationLink from "@/components/PatientLocationLink";
import ProviderLiveLocationToggle from "@/components/ProviderLiveLocationToggle";
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  isActiveBooking,
  type BookingStatus,
} from "@/lib/bookingStatus";

// Next status in the patient-visible flow
const NEXT_STATUS: Record<string, { next: BookingStatus; label: string } | null> = {
  confirmed: { next: "assigned", label: "Mark as Assigned" },
  assigned: { next: "on_the_way", label: "I'm On the Way" },
  on_the_way: { next: "arrived", label: "Mark as Arrived" },
  arrived: { next: "completed", label: "Complete Booking" },
  completed: null,
  cancelled: null,
  pending: null,
};

interface BookingCardProps {
  booking: {
    id: string;
    bookingDate: string;
    bookingTime: string;
    status: string;
    patientName: string;
    serviceName: string;
    address: string | null;
    latitude?: number | null;
    longitude?: number | null;
    symptomsNotes: string | null;
  };
  showActions?: boolean;
}

const ProviderBookingCard = ({ booking, showActions = false }: BookingCardProps) => {
  const [updating, setUpdating] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", booking.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["provider-bookings"] });
      toast({ title: `Booking ${newStatus}` });
    }
    setUpdating(false);
  };

  return (
    <>
      <div className="rounded-xl bg-card p-4 shadow-card">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h4 className="font-semibold text-card-foreground">{booking.patientName}</h4>
            <p className="text-sm text-muted-foreground">{booking.serviceName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setChatOpen(true)}>
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Badge className={BOOKING_STATUS_COLORS[booking.status as BookingStatus] ?? "bg-muted text-muted-foreground"}>
              {BOOKING_STATUS_LABELS[booking.status as BookingStatus] ?? booking.status}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{booking.bookingDate}</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{booking.bookingTime}</span>
          {(booking.address || booking.latitude) && (
            <PatientLocationLink
              latitude={booking.latitude ?? null}
              longitude={booking.longitude ?? null}
              address={booking.address}
            />
          )}
        </div>
        {booking.symptomsNotes && (
          <p className="mt-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-2">
            {booking.symptomsNotes}
          </p>
        )}
        {showActions && booking.status === "pending" && (
          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              variant="hero"
              disabled={updating}
              onClick={() => updateStatus("confirmed")}
            >
              <Check className="h-4 w-4 mr-1" /> Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={updating}
              onClick={() => updateStatus("cancelled")}
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <X className="h-4 w-4 mr-1" /> Reject
            </Button>
          </div>
        )}
        {showActions && NEXT_STATUS[booking.status] && (
          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              variant="hero"
              disabled={updating}
              onClick={() => updateStatus(NEXT_STATUS[booking.status]!.next)}
            >
              {NEXT_STATUS[booking.status]!.label}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      <BookingChat
        bookingId={booking.id}
        open={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </>
  );
};

export default ProviderBookingCard;
