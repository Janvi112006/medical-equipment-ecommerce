export const colors = {
  bg: "#fbf9f4",
  surface: "#ffffff",
  border: "#e7e2d8",
  borderStrong: "#d6cfc0",

  text: "#232220",
  textMuted: "#6b6660",
  textFaint: "#9b958c",

  primary: "#0f766e",
  primaryDark: "#0b5750",
  primaryLight: "#ccfbf1",

  danger: "#dc2626",
  dangerLight: "#fee2e2",
  success: "#16a34a",
  successLight: "#dcfce7",
  warning: "#d97706",
  warningLight: "#fef3c7",
  info: "#2563eb",
  infoLight: "#dbeafe",
  indigo: "#4f46e5",
  indigoLight: "#e0e7ff",
  neutralLight: "#f1ede4",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 18,
};

// Maps order/payment/tracking status values to a badge color pair, shared by StatusBadge
export const STATUS_COLOR_MAP = {
  pending: { bg: colors.warningLight, fg: colors.warning },
  confirmed: { bg: colors.infoLight, fg: colors.info },
  shipped: { bg: colors.indigoLight, fg: colors.indigo },
  out_for_delivery: { bg: colors.primaryLight, fg: colors.primaryDark },
  delivered: { bg: colors.successLight, fg: colors.success },
  cancelled: { bg: colors.dangerLight, fg: colors.danger },
  unpaid: { bg: colors.warningLight, fg: colors.warning },
  paid: { bg: colors.successLight, fg: colors.success },
  failed: { bg: colors.dangerLight, fg: colors.danger },
  not_shipped: { bg: colors.neutralLight, fg: colors.textMuted },
  in_transit: { bg: colors.indigoLight, fg: colors.indigo },
  unknown: { bg: colors.neutralLight, fg: colors.textMuted },
};

export const STATUS_LABEL_OVERRIDES = {
  out_for_delivery: "Out for delivery",
  not_shipped: "Not shipped",
  in_transit: "In transit",
};
