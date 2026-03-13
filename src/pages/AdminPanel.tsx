import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Stethoscope,
  Calendar,
  ShieldCheck,
  Clock,
  Activity,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { useIsAdmin, useAdminProfessionals, useAdminUsers, useAdminStats } from "@/hooks/useAdminData";
import AdminProviderList from "@/components/AdminProviderList";
import AdminUserList from "@/components/AdminUserList";

const AdminPanel = () => {
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: professionals = [], isLoading: profsLoading } = useAdminProfessionals();
  const { data: users = [], isLoading: usersLoading } = useAdminUsers();
  const { data: stats } = useAdminStats();

  if (adminLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold text-foreground">Access Denied</h2>
            <p className="text-muted-foreground mt-2">
              You don't have administrator privileges to access this panel.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const pendingProviders = professionals.filter((p: any) => p.verification_status === "pending");
  const isLoading = profsLoading || usersLoading;

  const statCards = [
    { icon: Stethoscope, label: "Providers", value: stats?.totalProfessionals ?? 0 },
    { icon: ShieldCheck, label: "Verified", value: stats?.verifiedProfessionals ?? 0 },
    { icon: Clock, label: "Pending", value: stats?.pendingVerifications ?? 0 },
    { icon: Calendar, label: "Bookings", value: stats?.totalBookings ?? 0 },
    { icon: Activity, label: "Active", value: stats?.activeBookings ?? 0 },
    { icon: Users, label: "Patients", value: stats?.totalPatients ?? 0 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="container py-8 flex-1">
        <div className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="mt-1 text-muted-foreground">Manage providers, users, and platform activity</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {statCards.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 rounded-xl bg-card p-4 shadow-card">
              <stat.icon className="h-5 w-5 text-primary" />
              <span className="text-xl font-bold text-foreground">{stat.value}</span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="mb-4 flex-wrap h-auto gap-1">
              <TabsTrigger value="pending">
                Pending ({pendingProviders.length})
              </TabsTrigger>
              <TabsTrigger value="providers">
                All Providers ({professionals.length})
              </TabsTrigger>
              <TabsTrigger value="users">
                Users ({users.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {pendingProviders.length === 0 ? (
                <div className="text-center py-12">
                  <ShieldCheck className="h-10 w-10 text-healthcare-green mx-auto mb-3" />
                  <p className="text-muted-foreground">No pending provider applications.</p>
                </div>
              ) : (
                <AdminProviderList professionals={pendingProviders} />
              )}
            </TabsContent>

            <TabsContent value="providers">
              <AdminProviderList professionals={professionals} />
            </TabsContent>

            <TabsContent value="users">
              <AdminUserList users={users} />
            </TabsContent>
          </Tabs>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AdminPanel;
