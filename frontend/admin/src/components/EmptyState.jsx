const EmptyState = ({ title = "Nothing here yet", message, action }) => (
  <div className="state-block">
    <strong style={{ color: "var(--color-text)" }}>{title}</strong>
    {message && <span>{message}</span>}
    {action}
  </div>
);

export default EmptyState;
