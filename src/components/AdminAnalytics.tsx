import { Loader2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";

const AdminAnalytics = () => {
  const { data, isLoading } = useAdminAnalytics();

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const s = data.summary;
  const cards = [
    { label: "Gross revenue", value: `$${s.grossRevenue.toFixed(2)}` },
    { label: "Platform commission", value: `$${s.commission.toFixed(2)}` },
    { label: "Refunded", value: `$${s.refunded.toFixed(2)}` },
    { label: "Completion rate", value: `${s.completionRate}%` },
    { label: "Active providers", value: s.activeProviders },
    { label: "Open disputes", value: s.openDisputes },
    { label: "Pending payouts", value: `${s.pendingPayouts} ($${s.pendingPayoutAmount.toFixed(2)})` },
    { label: "Cancelled bookings", value: s.cancelled },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl bg-card p-4 shadow-card">
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className="mt-1 text-lg font-bold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-card p-4 shadow-card">
        <h3 className="mb-4 font-display text-sm font-semibold text-foreground">Bookings &amp; revenue (6 months)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="bookings" stroke="hsl(var(--primary))" strokeWidth={2} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--healthcare-green))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl bg-card p-4 shadow-card">
        <h3 className="mb-4 font-display text-sm font-semibold text-foreground">Coverage by city</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.byCity}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="city" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                }}
              />
              <Legend />
              <Bar dataKey="providers" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              <Bar dataKey="bookings" fill="hsl(var(--healthcare-green))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
