import { Bug, Loader2 } from "lucide-react";
import { useAdminErrorLogs } from "@/hooks/useAdminAnalytics";

const AdminErrorLogs = () => {
  const { data: logs = [], isLoading } = useAdminErrorLogs();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="py-12 text-center">
        <Bug className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-muted-foreground">No client errors logged. Nice.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((l: any) => (
        <details key={l.id} className="rounded-xl bg-card p-4 shadow-card">
          <summary className="cursor-pointer text-sm font-medium text-card-foreground">
            {l.message}
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {new Date(l.created_at).toLocaleString()} · {l.path || "unknown page"}
            </span>
          </summary>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            {l.source && <p>Source: {l.source}</p>}
            {l.user_agent && <p className="break-all">UA: {l.user_agent}</p>}
            {l.stack && (
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-muted/50 p-2">{l.stack}</pre>
            )}
          </div>
        </details>
      ))}
    </div>
  );
};

export default AdminErrorLogs;
