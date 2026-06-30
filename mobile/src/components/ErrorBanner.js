import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, spacing, radii } from "../theme";

const ErrorBanner = ({ message, onRetry }) => (
  <View style={styles.banner}>
    <Text style={styles.text}>⚠️ {message}</Text>
    {onRetry && (
      <TouchableOpacity style={styles.button} onPress={onRetry}>
        <Text style={styles.buttonText}>Try again</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.dangerLight,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "#fecaca",
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  text: {
    color: "#991b1b",
    fontSize: 13.5,
  },
  button: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.sm,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  buttonText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: colors.text,
  },
});

export default ErrorBanner;
