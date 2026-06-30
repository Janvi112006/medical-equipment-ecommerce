const ConfirmDialog = ({ title, message, confirmLabel = "Confirm", danger, loading, onConfirm, onCancel }) => (
  <div className="overlay" onClick={onCancel}>
    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
      <div className="modal-header">
        <h2>{title}</h2>
        <button className="modal-close" onClick={onCancel} aria-label="Close">
          ×
        </button>
      </div>
      <div className="modal-body">
        <p style={{ margin: 0, color: "var(--color-text-muted)" }}>{message}</p>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button className={`btn ${danger ? "btn-danger" : "btn-primary"}`} onClick={onConfirm} disabled={loading}>
          {loading ? "Please wait..." : confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmDialog;
