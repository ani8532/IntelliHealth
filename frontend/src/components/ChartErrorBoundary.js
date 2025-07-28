// src/components/ChartErrorBoundary.jsx
import React from 'react';

class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Chart error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'red' }}>Failed to load chart.</div>;
    }

    return this.props.children;
  }
}

export default ChartErrorBoundary;
