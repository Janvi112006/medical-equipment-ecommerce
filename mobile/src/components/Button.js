import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native";
import { colors, radii } from "../theme";

const VARIANTS = {
  primary: { bg: colors.primary, fg: "#ffffff", border: colors.primary },
  secondary: { bg: colors.surface, fg: colors.text, border: colors.borderStrong },
  danger: { bg: colors.danger, fg: "#ffffff", border: colors.danger },
};

const Button = ({ title, onPress, variant = "primary", disabled, loading, style }) => {
  const v = VARIANTS[variant] || VARIANTS.primary;
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: v.bg, borderColor: v.border }, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? <ActivityIndicator color={v.fg} /> : <Text style={[styles.text, { color: v.fg }]}>{title}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "700",
    fontSize: 14,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;
