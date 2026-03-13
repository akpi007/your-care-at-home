import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Star, User, FileText, MessageSquare, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useBookings } from "@/hooks/useBookings";
import BookingChat from "@/components/BookingChat";

const statusColors: Record<string, string> = {
  confirmed: "bg-healthcare-soft-green text-healthcare-green",
  pending: "bg-healthcare-warm text-amber-700",
  completed: "bg-secondary text-secondary-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

const Dashboard = () => {
  const { data: bookings = [], isLoading } = useBookings();
  const [chatBookingId, setChatBookingId] = useState<string | null>(null);

  const upcoming = bookings.filter((b) => ["pending", "confirmed"].includes(b.status));
  const past = bookings.filter((b) => ["completed", "cancelled"].includes(b.status));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="container py-8 flex-1">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">My Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Manage your bookings and health profiles</p>
        </div>

        {/* Quick actions */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: Calendar, label: "Book Visit", to: "/professionals" },
            { icon: User, label: "Profiles", to: "/patient-profiles" },
            { icon: FileText, label: "Reports", to: "/dashboard" },
            { icon: MessageSquare, label: "Messages", to: "/dashboard" },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="flex flex-col items-center gap-2 rounded-xl bg-card p-4 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5"
            >
              <action.icon className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-card-foreground">{action.label}</span>
            </Link>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Upcoming */}
            <section className="mb-10">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">Upcoming Bookings</h2>
              {upcoming.length === 0 ? (
                <p className="text-muted-foreground text-sm">No upcoming bookings. <Link to="/professionals" className="text-primary underline">Book a visit</Link></p>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((b: any) => (
                    <div key={b.id} className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-card">
                      <img
                        src={b.professionals?.image_url || "/placeholder.svg"}
                        alt={b.professionals?.display_name || "Professional"}
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-card-foreground truncate">
                          {b.professionals?.display_name || "Professional"}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{b.booking_date}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{b.booking_time}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setChatBookingId(b.id)}>
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Badge className={statusColors[b.status] || "bg-muted text-muted-foreground"}>{b.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Past */}
            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">Past Bookings</h2>
              {past.length === 0 ? (
                <p className="text-muted-foreground text-sm">No past bookings yet.</p>
              ) : (
                <div className="space-y-3">
                  {past.map((b: any) => (
                    <div key={b.id} className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-card">
                      <img
                        src={b.professionals?.image_url || "/placeholder.svg"}
                        alt={b.professionals?.display_name || "Professional"}
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-card-foreground truncate">
                          {b.professionals?.display_name || "Professional"}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{b.booking_date}</span>
                        </div>
                      </div>
                      <Badge className={statusColors[b.status] || "bg-muted text-muted-foreground"}>{b.status}</Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/book/${b.professional_id}`}>Rebook</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <Footer />

      {/* Chat modal */}
      <BookingChat
        bookingId={chatBookingId ?? ""}
        open={!!chatBookingId}
        onClose={() => setChatBookingId(null)}
      />
    </div>
  );
};

export default Dashboard;
