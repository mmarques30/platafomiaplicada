import React, { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
          <div className="bg-status-danger/15 dark:bg-status-danger/20 border border-status-danger/40 dark:border-status-danger rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-status-danger dark:text-status-danger/40 mb-2">
              Algo deu errado
            </h2>
            <p className="text-sm text-status-danger dark:text-status-danger mb-4">
              Ocorreu um erro inesperado. Tente recarregar a pagina.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 text-sm font-medium rounded-md bg-status-danger/15 dark:bg-status-danger/30 text-status-danger dark:text-status-danger hover:bg-status-danger/15 dark:hover:bg-status-danger/50 transition-colors"
              >
                Tentar novamente
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-sm font-medium rounded-md bg-muted dark:bg-background text-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-card transition-colors"
              >
                Recarregar pagina
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
