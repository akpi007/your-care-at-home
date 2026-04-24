import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Star, User, FileText, MessageSquare, Loader2, MapPin, Settings } from "lucide-react";
import BookingDetailDialog from "@/components/BookingDetailDialog";
import { Link } from "react-router-dom";
import { useBookings } from "@/hooks/useBookings";
import BookingChat from "@/components/BookingChat";
import NotificationBanner from "@/components/NotificationBanner";
import DashboardProfile from "@/components/dashboard/DashboardProfile";
import DashboardReports from "@/components/dashboard/DashboardReports";
import DashboardMessages from "@/components/dashboard/DashboardMessages";
import DashboardNearby from "@/components/dashboard/DashboardNearby";
import BookingProgressBar from "@/components/BookingProgressBar";
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_SHORT_LABELS,
  isActiveBooking,
  type BookingStatus,
} from "@/lib/bookingStatus";

const Dashboard = () => {
  const { data: bookings = [], isLoading } = useBookings();
  const [chatBookingId, setChatBookingId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const upcoming = bookings.filter((b) => ["pending", "confirmed"].includes(b.status));
  const past = bookings.filter((b) => ["completed", "cancelled"].includes(b.status));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="container py-8 flex-1">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-foreground">My Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Manage your health journey</p>
        </div>

        <div className="mb-6">
          <NotificationBanner />
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto bg-muted/50 p-1 h-auto flex-wrap">
            <TabsTrigger value="bookings" className="gap-1.5">
              <Calendar className="h-4 w-4" /> Bookings
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-1.5">
              <MessageSquare className="h-4 w-4" /> Messages
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-1.5">
              <FileText className="h-4 w-4" /> Reports
            </TabsTrigger>
            <TabsTrigger value="nearby" className="gap-1.5">
              <MapPin className="h-4 w-4" /> Nearby
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-1.5">
              <User className="h-4 w-4" /> Profile
            </TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            {/* Quick actions */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: Calendar, label: "Book Visit", to: "/professionals" },
                { icon: User, label: "Profiles", to: "/patient-profiles" },
                { icon: FileText, label: "Reports", to: "#", tab: "reports" },
                { icon: MessageSquare, label: "Messages", to: "#", tab: "messages" },
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
                        <div
                          key={b.id}
                          className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-card cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
                          onClick={() => setSelectedBooking(b)}
                        >
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
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setChatBookingId(b.id); }}>
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
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <DashboardMessages />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <DashboardReports />
          </TabsContent>

          {/* Nearby Professionals Tab */}
          <TabsContent value="nearby">
            <DashboardNearby />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <DashboardProfile />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />

      {/* Booking detail dialog */}
      <BookingDetailDialog
        booking={selectedBooking}
        open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />

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
