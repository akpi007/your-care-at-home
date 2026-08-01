import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Clock, Edit2, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import BookingStatusTimeline from "@/components/BookingStatusTimeline";
import PatientLiveTracking from "@/components/PatientLiveTracking";
import { isActiveBooking } from "@/lib/bookingStatus";
import CancelBookingDialog from "@/components/CancelBookingDialog";
import RaiseDisputeDialog from "@/components/RaiseDisputeDialog";
import ReportUserDialog from "@/components/ReportUserDialog";
import { CANCELLATION_POLICY_SUMMARY } from "@/lib/cancellationPolicy";
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  type BookingStatus,
} from "@/lib/bookingStatus";

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const h = String(i).padStart(2, "0");
  return [`${h}:00`, `${h}:30`];
}).flat();

interface BookingDetailDialogProps {
  booking: any;
  open: boolean;
  onClose: () => void;
}

const BookingDetailDialog = ({ booking, open, onClose }: BookingDetailDialogProps) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newDate, setNewDate] = useState<Date | undefined>(
    booking ? new Date(booking.booking_date) : undefined
  );
  const [newTime, setNewTime] = useState(booking?.booking_time?.slice(0, 5) || "");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  if (!booking) return null;

  const handleSave = async () => {
    if (!newDate || !newTime) return;
    setSaving(true);
    const { error } = await supabase
      .from("bookings")
      .update({
        booking_date: format(newDate, "yyyy-MM-dd"),
        booking_time: newTime,
      })
      .eq("id", booking.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Booking updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setEditing(false);
      onClose();
    }
    setSaving(false);
  };

  const handleCancel = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", booking.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Booking cancelled" });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      onClose();
    }
    setSaving(false);
  };

  const resetEdit = () => {
    setNewDate(new Date(booking.booking_date));
    setNewTime(booking.booking_time?.slice(0, 5) || "");
    setEditing(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { resetEdit(); onClose(); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Professional info */}
          <div className="flex items-center gap-3">
            <img
              src={booking.professionals?.image_url || "/placeholder.svg"}
              alt={booking.professionals?.display_name || "Professional"}
              className="h-14 w-14 rounded-xl object-cover"
            />
            <div>
              <h4 className="font-semibold text-foreground">
                {booking.professionals?.display_name || "Professional"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {booking.professionals?.specialization || booking.services?.name || "Service"}
              </p>
            </div>
            <Badge
              className={cn(
                "ml-auto",
                BOOKING_STATUS_COLORS[booking.status as BookingStatus] ||
                  "bg-muted text-muted-foreground"
              )}
            >
              {BOOKING_STATUS_LABELS[booking.status as BookingStatus] || booking.status}
            </Badge>
          </div>

          {/* Live status timeline */}
          <BookingStatusTimeline status={booking.status} />

          {/* Live GPS tracking when professional is en route */}
          {isActiveBooking(booking.status) && (
            <PatientLiveTracking
              bookingId={booking.id}
              patientLat={booking.latitude}
              patientLng={booking.longitude}
            />
          )}

          {/* Date & Time */}
          {editing ? (
            <div className="space-y-3 rounded-lg border border-border p-3">
              <p className="text-sm font-medium text-foreground">Reschedule</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !newDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newDate ? format(newDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newDate}
                    onSelect={setNewDate}
                    disabled={(date) => date < new Date()}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              <Select value={newTime} onValueChange={setNewTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={saving || !newDate || !newTime}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={resetEdit} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                {booking.booking_date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {booking.booking_time}
              </span>
            </div>
          )}

          {booking.address && (
            <p className="text-sm text-muted-foreground">📍 {booking.address}</p>
          )}

          {booking.symptoms_notes && (
            <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-2">
              {booking.symptoms_notes}
            </p>
          )}

          {/* Actions */}
          {!editing && (
            <div className="space-y-2 pt-2">
              <div className="flex flex-wrap gap-2">
                {["pending", "confirmed", "assigned"].includes(booking.status) && (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-1" /> Edit Date & Time
                  </Button>
                )}
                <CancelBookingDialog
                  booking={booking}
                  consultationFee={Number(booking.professionals?.consultation_fee ?? 0)}
                  onCancelled={onClose}
                />
                <RaiseDisputeDialog bookingId={booking.id} />
                {booking.professionals?.user_id && (
                  <ReportUserDialog
                    reportedUserId={booking.professionals.user_id}
                    reportedName={booking.professionals?.display_name}
                    bookingId={booking.id}
                  />
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">{CANCELLATION_POLICY_SUMMARY}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailDialog;
