import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Download, Eye, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface Report {
  id: string;
  file_url: string | null;
  ai_summary: string | null;
  created_at: string;
  patient_profile_id: string;
}

const DashboardReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchReports = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("medical_reports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setReports(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, [user]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Get first patient profile
    const { data: profiles } = await supabase
      .from("patient_profiles")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    if (!profiles || profiles.length === 0) {
      toast.error("Please create a patient profile first");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("medical-documents")
      .upload(path, file);

    if (uploadError) {
      toast.error("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("medical-documents")
      .getPublicUrl(path);

    const { error: insertError } = await supabase.from("medical_reports").insert({
      user_id: user.id,
      patient_profile_id: profiles[0].id,
      file_url: urlData.publicUrl,
    });

    if (insertError) {
      toast.error("Failed to save report: " + insertError.message);
    } else {
      toast.success("Report uploaded!");
      fetchReports();
    }
    setUploading(false);
  };

  const getFileName = (url: string | null) => {
    if (!url) return "Unknown file";
    const parts = url.split("/");
    return parts[parts.length - 1] || "Report";
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-foreground">Medical Reports</h3>
        <label>
          <Button size="sm" disabled={uploading} asChild>
            <span className="cursor-pointer">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
              Upload Report
            </span>
          </Button>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-xl bg-card p-8 text-center shadow-card">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <h4 className="font-display font-semibold text-foreground">No reports yet</h4>
          <p className="text-sm text-muted-foreground mt-1">Upload medical reports, lab results, or prescriptions</p>
          <label>
            <Button variant="outline" className="mt-4" asChild>
              <span className="cursor-pointer">
                <Upload className="h-4 w-4 mr-1" /> Upload Your First Report
              </span>
            </Button>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" onChange={handleUpload} />
          </label>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(report => (
            <div key={report.id} className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <FileText className="h-5 w-5 text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{getFileName(report.file_url)}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(report.created_at).toLocaleDateString()}
                </p>
                {report.ai_summary && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">{report.ai_summary}</p>
                )}
              </div>
              <div className="flex gap-1">
                {report.file_url && (
                  <>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={report.file_url} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={report.file_url} download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardReports;
