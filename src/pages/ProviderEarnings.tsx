import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useProviderEarningsDetails } from "@/hooks/useProviderEarningsDetails";
import ProviderPayoutPanel from "@/components/ProviderPayoutPanel";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from "recharts";

const chartConfig: ChartConfig = {
  gross: { label: "Gross Revenue", color: "hsl(var(--primary))" },
  commission: { label: "Commission", color: "hsl(var(--destructive))" },
  net: { label: "Net Earnings", color: "hsl(168, 72%, 30%)" },
};

const statusBadge: Record<string, { label: string; className: string }> = {
  paid: { label: "Paid", className: "bg-primary/10 text-primary" },
  pending: { label: "Pending", className: "bg-amber-100 text-amber-700" },
};

const ProviderEarnings = () => {
  const { data, isLoading } = useProviderEarningsDetails();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const { records = [], monthly = [], summary = { total: 0, commission: 0, net: 0, pending: 0, paid: 0 } } = data ?? {};

  const stats = [
    { icon: DollarSign, label: "Total Revenue", value: `$${summary.total.toFixed(2)}`, color: "text-primary" },
    { icon: Percent, label: "Commission", value: `$${summary.commission.toFixed(2)}`, color: "text-destructive" },
    { icon: TrendingUp, label: "Net Earnings", value: `$${summary.net.toFixed(2)}`, color: "text-primary" },
    { icon: CheckCircle, label: "Paid Out", value: `$${summary.paid.toFixed(2)}`, color: "text-primary" },
    { icon: Clock, label: "Pending Payout", value: `$${summary.pending.toFixed(2)}`, color: "text-amber-600" },
  ];

  const pendingRecords = records.filter((r) => r.payoutStatus === "pending");
  const paidRecords = records.filter((r) => r.payoutStatus === "paid");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="container py-8 flex-1">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/provider-dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <h1 className="font-display text-2xl font-bold text-foreground">Earnings Dashboard</h1>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {stats.map((s) => (
            <Card key={s.label} className="flex flex-col items-center gap-1 p-4">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <span className="text-lg font-bold text-foreground">{s.value}</span>
              <span className="text-xs text-muted-foreground text-center">{s.label}</span>
            </Card>
          ))}
        </div>

        {/* Charts */}
        {monthly.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-4">
              <h3 className="font-display font-semibold text-foreground mb-3">Monthly Revenue</h3>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="gross" fill="var(--color-gross)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="commission" fill="var(--color-commission)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </Card>

            <Card className="p-4">
              <h3 className="font-display font-semibold text-foreground mb-3">Net Earnings Trend</h3>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <AreaChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="net"
                    fill="var(--color-net)"
                    fillOpacity={0.2}
                    stroke="var(--color-net)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </Card>
          </div>
        )}

        {/* Payout requests */}
        <div className="mb-8">
          <ProviderPayoutPanel availableBalance={summary.pending} />
        </div>

        {/* Payout history */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All ({records.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingRecords.length})</TabsTrigger>
            <TabsTrigger value="paid">Paid ({paidRecords.length})</TabsTrigger>
          </TabsList>

          {["all", "pending", "paid"].map((tab) => {
            const filtered = tab === "all" ? records : tab === "pending" ? pendingRecords : paidRecords;
            return (
              <TabsContent key={tab} value={tab}>
                {filtered.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-8 text-center">No earnings records found.</p>
                ) : (
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead className="text-right">Gross</TableHead>
                          <TableHead className="text-right">Commission</TableHead>
                          <TableHead className="text-right">Net</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((r) => {
                          const badge = statusBadge[r.payoutStatus] ?? statusBadge.pending;
                          return (
                            <TableRow key={r.id}>
                              <TableCell className="text-sm">
                                {new Date(r.bookingDate || r.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-sm font-medium">{r.serviceName}</TableCell>
                              <TableCell className="text-sm">{r.patientName}</TableCell>
                              <TableCell className="text-right text-sm">${r.amount.toFixed(2)}</TableCell>
                              <TableCell className="text-right text-sm text-destructive">
                                -${r.commission.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right text-sm font-semibold">
                                ${r.netAmount.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Badge className={badge.className}>{badge.label}</Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Card>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default ProviderEarnings;
