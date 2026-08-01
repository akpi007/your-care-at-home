import { supabase } from "@/integrations/supabase/client";

type Severity = "error" | "warning" | "fatal";

const RECENT_WINDOW_MS = 10_000;
const recent = new Map<string, number>();

function shouldSkip(key: string) {
  const now = Date.now();
  const last = recent.get(key);
  if (last && now - last < RECENT_WINDOW_MS) return true;
  recent.set(key, now);
  if (recent.size > 100) recent.clear();
  return false;
}

/**
 * Records an application error in the backend so production failures are visible.
 * Never throws — logging must not break the app.
 */
export async function logError(
  error: unknown,
  options: { source?: string; severity?: Severity } = {},
) {
  try {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : JSON.stringify(error)?.slice(0, 500) ?? "Unknown error";

    const stack = error instanceof Error ? error.stack ?? null : null;
    const source = options.source ?? "client";

    if (shouldSkip(`${source}:${message}`)) return;

    // eslint-disable-next-line no-console
    console.error(`[${source}]`, error);

    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id ?? null;

    await supabase.from("error_logs").insert({
      user_id: userId,
      message: message.slice(0, 2000),
      stack: stack?.slice(0, 8000) ?? null,
      source,
      url: typeof window !== "undefined" ? window.location.href : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      severity: options.severity ?? "error",
    });
  } catch {
    // swallow — logging failures must stay silent
  }
}

let installed = false;

/** Installs global handlers for uncaught errors and unhandled promise rejections. */
export function installErrorLogging() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event) => {
    logError(event.error ?? event.message, { source: "window.onerror" });
  });

  window.addEventListener("unhandledrejection", (event) => {
    logError(event.reason, { source: "unhandledrejection" });
  });
}
