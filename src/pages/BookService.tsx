import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { queueBooking } from "@/lib/offlineBookings";
import { notifyBooking } from "@/lib/notifyBooking";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfessional } from "@/hooks/useProfessionals";
import { useCreateBooking } from "@/hooks/useBookings";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import LocationCapture from "@/components/LocationCapture";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Star,
  CheckCircle2,
  User,
  Loader2,
} from "lucide-react";

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00",
  "14:00", "15:00", "16:00", "17:00",
];

const formatTime = (t: string) => {
  const [h] = t.split(":");
  const hour = parseInt(h);
  return hour >= 12 ? `${hour === 12 ? 12 : hour - 12}:00 PM` : `${hour}:00 AM`;
};

const BookService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: professional, isLoading } = useProfessional(id);
  const createBooking = useCreateBooking();

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [selectedProfile, setSelectedProfile] = useState("");
  const [patientProfiles, setPatientProfiles] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("patient_profiles")
      .select("id, name")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setPatientProfiles(data);
          setSelectedProfile(data[0].id);
        }
      });
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="font-display text-xl font-semibold">Professional not found</h2>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/professionals">Browse Professionals</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const totalSteps = 3;

  const handleConfirm = async () => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be logged in to book.", variant: "destructive" });
      navigate("/login");
      return;
    }
    if (!selectedProfile) {
      toast({ title: "No patient profile", description: "Please create a patient profile first.", variant: "destructive" });
      navigate("/patient-profiles");
      return;
    }

    const payload = {
      professional_id: professional.id,
      service_id: professional.serviceId,
      patient_profile_id: selectedProfile,
      booking_date: selectedDate,
      booking_time: selectedTime,
      address,
      symptoms_notes: notes || undefined,
      latitude: latitude ?? undefined,
      longitude: longitude ?? undefined,
    };

    if (!navigator.onLine) {
      queueBooking(payload);
      toast({
        title: "Saved offline",
        description: "You're offline — this booking will be sent automatically once you're back online.",
      });
      navigate("/dashboard");
      return;
    }

    try {
      const created = await createBooking.mutateAsync({
        professional_id: professional.id,
        service_id: professional.serviceId,
        patient_profile_id: selectedProfile,
        booking_date: selectedDate,
        booking_time: selectedTime,
        address,
        symptoms_notes: notes || undefined,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
      });
      const newId = (created as any)?.id;
      if (newId) void notifyBooking(newId, "new_request");
      toast({ title: "Booking confirmed!", description: "Your appointment has been scheduled." });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Booking failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="container max-w-2xl py-8 flex-1">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link to="/professionals">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {["Date & Time", "Details", "Confirm"].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  step > i + 1
                    ? "gradient-primary text-primary-foreground"
                    : step === i + 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {step > i + 1 ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`hidden sm:inline text-sm ${step >= i + 1 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1.5 rounded-full bg-muted">
            <div
              className="h-full rounded-full gradient-primary transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Professional summary */}
        <div className="mb-6 flex items-center gap-4 rounded-xl bg-card p-4 shadow-card">
          <img src={professional.imageUrl} alt={professional.name} className="h-14 w-14 rounded-xl object-cover" />
          <div className="flex-1">
            <h3 className="font-display font-semibold text-card-foreground">{professional.name}</h3>
            <p className="text-sm text-muted-foreground">{professional.specialization}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {professional.rating}
            </div>
            <p className="text-lg font-bold text-foreground">${professional.fee}</p>
          </div>
        </div>

        {/* Step 1: Date & Time */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                <Calendar className="inline h-4 w-4 mr-1" /> Select Date
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                <Clock className="inline h-4 w-4 mr-1" /> Select Time
              </label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                      selectedTime === t
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-card text-card-foreground hover:border-primary/50"
                    }`}
                  >
                    {formatTime(t)}
                  </button>
                ))}
              </div>
            </div>
            <Button
              variant="hero"
              size="lg"
              className="w-full"
              disabled={!selectedDate || !selectedTime}
              onClick={() => setStep(2)}
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            {patientProfiles.length > 1 && (
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  <User className="inline h-4 w-4 mr-1" /> Patient Profile
                </label>
                <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                  <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                  <SelectContent>
                    {patientProfiles.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                <MapPin className="inline h-4 w-4 mr-1" /> Your Address
              </label>
              <Input
                placeholder="Enter your full address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <div className="mt-2">
                <LocationCapture onLocationCaptured={(lat, lng) => { setLatitude(lat); setLongitude(lng); }} />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                <User className="inline h-4 w-4 mr-1" /> Symptoms / Notes
              </label>
              <Textarea
                placeholder="Describe your symptoms or any notes for the professional..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="lg" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                variant="hero"
                size="lg"
                className="flex-1"
                disabled={!address}
                onClick={() => setStep(3)}
              >
                Review Booking <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-xl bg-card p-6 shadow-card space-y-4">
              <h3 className="font-display text-lg font-semibold text-foreground">Booking Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Professional</span>
                  <span className="font-medium text-foreground">{professional.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service</span>
                  <Badge variant="secondary">{professional.service}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium text-foreground">{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium text-foreground">{formatTime(selectedTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address</span>
                  <span className="font-medium text-foreground text-right max-w-[200px] truncate">{address}</span>
                </div>
                {notes && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Notes</span>
                    <span className="font-medium text-foreground text-right max-w-[200px] truncate">{notes}</span>
                  </div>
                )}
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">${professional.fee}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="lg" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                variant="hero"
                size="lg"
                className="flex-1"
                onClick={handleConfirm}
                disabled={createBooking.isPending}
              >
                {createBooking.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {createBooking.isPending ? "Booking..." : "Confirm Booking"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BookService;
