import React from "react";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type State = { hasError: boolean; error?: unknown };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown) {
    // Avoid logging sensitive data; this is safe for generic runtime errors.
    console.error("App runtime error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="max-w-md w-full p-6 rounded-lg border border-border bg-card text-card-foreground">
              <h1 className="text-lg font-semibold">Something went wrong</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                A runtime error prevented the page from rendering. Try refreshing.
              </p>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
