import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Shoot Lobby caught UI error:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE7D4] shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-[#073B2F] font-['Space_Grotesk',sans-serif]">
              Something went wrong loading this view
            </h2>
            <p className="text-xs text-[#5C6E5E] leading-relaxed">
              We encountered a minor display issue. Click below to reload Shoot Lobby and continue without losing your data.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full py-3 rounded-xl bg-[#073B2F] hover:bg-[#052920] text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
