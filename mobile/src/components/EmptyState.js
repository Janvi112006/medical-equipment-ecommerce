import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "../theme";

const EmptyState = ({ title = "Nothing here yet", message, action }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {message && <Text style={styles.message}>{message}</Text>}
    {action}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    fontWeight: "700",
    fontSize: 15,
    color: colors.text,
  },
  message: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
  },
});

export default EmptyState;
