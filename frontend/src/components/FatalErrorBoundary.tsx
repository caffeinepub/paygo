import { Component, ReactNode } from 'react';
import FatalErrorFallback from './FatalErrorFallback';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class FatalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Fatal error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <FatalErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
