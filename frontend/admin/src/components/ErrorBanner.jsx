const ErrorBanner = ({ message, onRetry }) => (
  <div className="error-banner">
    <span>⚠️</span>
    <div style={{ flex: 1 }}>
      <div>{message}</div>
      {onRetry && (
        <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  </div>
);

export default ErrorBanner;
