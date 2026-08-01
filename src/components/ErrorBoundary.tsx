import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { logError } from "@/lib/errorLogger";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logError(error, { source: `react:${info.componentStack?.split("\n")[1]?.trim() ?? "unknown"}`, severity: "fatal" });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h1 className="font-display text-2xl font-bold text-foreground">Something went wrong</h1>
        <p className="max-w-md text-muted-foreground">
          We've logged the problem and our team will look into it. Please reload the page to continue.
        </p>
        <Button variant="hero" onClick={() => window.location.reload()}>
          Reload page
        </Button>
      </div>
    );
  }
}

export default ErrorBoundary;
