// Maps a status/role string to a badge color. Falls back to neutral for
// anything unrecognized, so a future status added on the backend doesn't
// break rendering here.
const COLOR_MAP = {
  // order fulfillment status
  pending: "warning",
  confirmed: "info",
  shipped: "indigo",
  out_for_delivery: "primary",
  delivered: "success",
  cancelled: "danger",
  // payment status
  unpaid: "warning",
  paid: "success",
  failed: "danger",
  // tracking status
  not_shipped: "neutral",
  in_transit: "indigo",
  unknown: "neutral",
  // user role
  admin: "primary",
  customer: "neutral",
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
