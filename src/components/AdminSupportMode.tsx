import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, LifeBuoy, Search, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { downloadCsv } from "@/lib/csv";

const AdminSupportMode = () => {
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-support-lookup", query],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone, created_at")
        .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)
        .limit(5);
      if (error) throw error;
      if (!profiles || profiles.length === 0) return { profiles: [], bookings: [] };

      const ids = profiles.map((p) => p.user_id);
      const { data: bookings, error: bErr } = await supabase
        .from("bookings")
        .select("id, user_id, booking_date, booking_time, status, professionals(display_name), services(name)")
        .in("user_id", ids)
        .order("booking_date", { ascending: false })
        .limit(100);
      if (bErr) throw bErr;

      return { profiles, bookings: bookings ?? [] };
    },
    enabled: query.length >= 3,
  });

  const exportBookings = () => {
    const rows = (data?.bookings ?? []).map((b: any) => ({
      booking_id: b.id,
      date: b.booking_date,
      time: b.booking_time,
      status: b.status,
      provider: b.professionals?.display_name ?? "",
      service: b.services?.name ?? "",
    }));
    downloadCsv("support-bookings.csv", rows);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-card p-5 shadow-card">
        <div className="flex items-center gap-2">
          <LifeBuoy className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold text-foreground">Support lookup</h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Search a user by name or phone to see their bookings when resolving a support ticket.
          This is read-only — you never sign in as the user.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Input
            placeholder="Name or phone number"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setQuery(term.trim())}
            className="max-w-xs"
          />
          <Button variant="hero" onClick={() => setQuery(term.trim())} disabled={term.trim().length < 3}>
            <Search className="mr-1 h-4 w-4" /> Search
          </Button>
        </div>
      </div>

      {isLoading && query.length >= 3 && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {data && (
        <>
          {data.profiles.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No matching users.</p>
          ) : (
            <div className="rounded-xl bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-card-foreground">Matches</h4>
                {data.bookings.length > 0 && (
                  <Button size="sm" variant="outline" onClick={exportBookings}>
                    <Download className="mr-1 h-4 w-4" /> Export bookings
                  </Button>
                )}
              </div>
              <ul className="mt-3 space-y-2">
                {data.profiles.map((p: any) => (
                  <li key={p.user_id} className="rounded-lg border border-border px-3 py-2">
                    <p className="text-sm font-medium text-foreground">{p.full_name ?? "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground">{p.phone ?? "no phone"}</p>
                  </li>
                ))}
              </ul>

              <h4 className="mt-5 font-semibold text-card-foreground">
                Bookings ({data.bookings.length})
              </h4>
              <ul className="mt-2 space-y-2">
                {data.bookings.map((b: any) => (
                  <li
                    key={b.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                  >
                    <span className="text-sm text-foreground">
                      {b.booking_date} {String(b.booking_time).slice(0, 5)} ·{" "}
                      {b.services?.name ?? "Visit"} with {b.professionals?.display_name ?? "provider"}
                    </span>
                    <Badge className="bg-muted text-muted-foreground">{b.status}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminSupportMode;
