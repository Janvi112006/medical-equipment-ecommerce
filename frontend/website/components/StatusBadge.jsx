const COLOR_MAP = {
  pending: "warning",
  confirmed: "info",
  shipped: "indigo",
  out_for_delivery: "primary",
  delivered: "success",
  cancelled: "danger",
  unpaid: "warning",
  paid: "success",
  failed: "danger",
  not_shipped: "neutral",
  in_transit: "indigo",
  unknown: "neutral",
};

const LABEL_OVERRIDES = {
  out_for_delivery: "Out for delivery",
  not_shipped: "Not shipped",
  in_transit: "In transit",
};

const StatusBadge = ({ value }) => {
  if (!value) return <span className="badge badge-neutral">—</span>;
  const color = COLOR_MAP[value] || "neutral";
  const label = LABEL_OVERRIDES[value] || value.charAt(0).toUpperCase() + value.slice(1);
  return <span className={`badge badge-${color}`}>{label}</span>;
};

export default StatusBadge;
