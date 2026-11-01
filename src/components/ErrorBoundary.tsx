/**
 * @file ErrorBoundary.tsx
 * @description React Error Boundary catching unexpected UI rendering exceptions
 * with accessible recovery mechanisms.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error inside Gatherly AI component tree:', error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleFullReload = (): void => {
    window.location.reload();
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          role="alert" 
          aria-live="assertive"
          className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-slate-900 dark:text-slate-100"
        >
          <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black tracking-tight">Something unexpected happened</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Gatherly AI protected your event data from corruption. You can safely retry rendering or reload the planner.
              </p>
              {this.state.error?.message && (
                <div className="text-[11px] font-mono text-rose-600 bg-rose-50/60 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/40 truncate">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>

              <button
                type="button"
                onClick={this.handleFullReload}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition"
              >
                <Home className="w-4 h-4" />
                <span>Reload App</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
