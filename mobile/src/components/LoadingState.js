import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { colors, spacing } from "../theme";

const LoadingState = ({ label = "Loading..." }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.sm,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
  },
});

export default LoadingState;
