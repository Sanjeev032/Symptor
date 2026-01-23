import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '20px',
                    color: '#ef4444',
                    background: 'rgba(0,0,0,0.8)',
                    borderRadius: '8px',
                    border: '1px solid #ef4444',
                    margin: '20px',
                    fontFamily: 'sans-serif'
                }}>
                    <h2>Something went wrong loading this component.</h2>
                    <p>{this.state.error && this.state.error.toString()}</p>
                    <p style={{ fontSize: '0.8rem', color: '#ccc' }}>
                        Likely cause: 3D Model file is missing or invalid.
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
