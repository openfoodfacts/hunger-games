import * as React from "react";

type ErrorState = { hasError: boolean };
type ErrorBoundaryProps = {
  children: React.ReactNode;
};

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): Partial<ErrorState> {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch?(error: Error, errorInfo: React.ErrorInfo) {
    // Example "componentStack":
    //   in ComponentThatThrows (created by App)
    //   in ErrorBoundary (created by App)
    //   in div (created by App)
    //   in App
    console.log(error, errorInfo.componentStack);
  }

  render() {
    return this.props.children;
  }
}
