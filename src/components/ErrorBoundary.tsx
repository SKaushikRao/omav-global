import React from 'react';

// Contains a failing subtree (e.g. a WebGL scene) so the rest of the page renders
export class ErrorBoundary extends React.Component<
  { fallback?: React.ReactNode; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('Contained render error', error);
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
