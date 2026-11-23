import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Cha Ghor app error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-page shell">
          <p className="eyebrow">Something went wrong</p>
          <h1>We spilled the tea.</h1>
          <p>
            The page could not be displayed. Reloading usually puts the kettle
            back on.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Reload the page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
