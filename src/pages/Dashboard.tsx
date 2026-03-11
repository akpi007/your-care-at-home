import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Star, User, FileText, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const upcomingBookings = [
  {
    id: "b1",
    professional: "Dr. Sarah Johnson",
    service: "Doctor",
    date: "Mar 15, 2026",
    time: "10:00 AM",
    status: "confirmed",
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "b2",
    professional: "Lisa Thompson, PT",
    service: "Physiotherapist",
    date: "Mar 18, 2026",
    time: "02:00 PM",
    status: "pending",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
  },
];

const pastBookings = [
  {
    id: "b3",
    professional: "Emily Chen, RN",
    service: "Nurse",
    date: "Mar 5, 2026",
    status: "completed",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964ac31?w=100&h=100&fit=crop&crop=face",
  },
];

const statusColors: Record<string, string> = {
  confirmed: "bg-healthcare-soft-green text-healthcare-green",
  pending: "bg-healthcare-warm text-amber-700",
  completed: "bg-secondary text-secondary-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

const Dashboard = () => {
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
            { icon: User, label: "Profiles", to: "/dashboard" },
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

        {/* Upcoming */}
        <section className="mb-10">
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">Upcoming Bookings</h2>
          <div className="space-y-3">
            {upcomingBookings.map((b) => (
              <div key={b.id} className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-card">
                <img src={b.imageUrl} alt={b.professional} className="h-12 w-12 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-card-foreground truncate">{b.professional}</h4>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{b.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{b.time}</span>
                  </div>
                </div>
                <Badge className={statusColors[b.status]}>{b.status}</Badge>
              </div>
            ))}
          </div>
        </section>

        {/* Past */}
        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">Past Bookings</h2>
          <div className="space-y-3">
            {pastBookings.map((b) => (
              <div key={b.id} className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-card">
                <img src={b.imageUrl} alt={b.professional} className="h-12 w-12 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-card-foreground truncate">{b.professional}</h4>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{b.date}</span>
                    {b.rating && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{b.rating}/5
                      </span>
                    )}
                  </div>
                </div>
                <Badge className={statusColors[b.status]}>{b.status}</Badge>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/book/${b.id}`}>Rebook</Link>
                </Button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
