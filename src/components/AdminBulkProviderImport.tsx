import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { parseCsv } from "@/lib/csv";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const TEMPLATE = `display_name,specialization,city,consultation_fee,years_experience,license_number,bio
Jane Banda,Midwife,Lusaka,350,6,LIC12345,Experienced community midwife`;

const AdminBulkProviderImport = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "provider-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setBusy(true);
    setResult(null);

    try {
      const rows = parseCsv(await file.text());
      if (rows.length === 0) throw new Error("The file has no data rows");

      const payload = rows
        .filter((r) => r.display_name)
        .map((r) => ({
          display_name: r.display_name,
          specialization: r.specialization || null,
          city: r.city || null,
          consultation_fee: r.consultation_fee ? Number(r.consultation_fee) : null,
          years_experience: r.years_experience ? Number(r.years_experience) : null,
          license_number: r.license_number || null,
          bio: r.bio || null,
          verification_status: "pending",
          available: false,
        }));

      const { error } = await supabase.from("professionals").insert(payload as any);
      if (error) throw error;

      setResult(`${payload.length} provider(s) imported as pending verification.`);
      toast({ title: "Import complete", description: `${payload.length} providers added.` });
      qc.invalidateQueries({ queryKey: ["admin-professionals"] });
    } catch (e: any) {
      setResult(null);
      toast({ title: "Import failed", description: e.message, variant: "destructive" });
    }

    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="rounded-xl bg-card p-5 shadow-card">
      <h3 className="font-display text-lg font-semibold text-foreground">Bulk provider import</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Upload a CSV to onboard a clinic or agency in one go. Imported providers start as
        unverified and must still complete document checks before taking bookings.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          Download template
        </Button>
        <Button variant="hero" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />}
          Upload CSV
        </Button>
      </div>

      {result && <p className="mt-3 text-sm text-healthcare-green">{result}</p>}

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
};

export default AdminBulkProviderImport;
