import { View, Text, StyleSheet } from "react-native";
import { STATUS_COLOR_MAP, STATUS_LABEL_OVERRIDES, colors } from "../theme";

const StatusBadge = ({ value }) => {
  if (!value) {
    return (
      <View style={[styles.badge, { backgroundColor: "#f1ede4" }]}>
        <Text style={[styles.text, { color: colors.textMuted }]}>—</Text>
      </View>
    );
  }

  const { bg, fg } = STATUS_COLOR_MAP[value] || { bg: "#f1ede4", fg: colors.textMuted };
  const label = STATUS_LABEL_OVERRIDES[value] || value.charAt(0).toUpperCase() + value.slice(1);

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 11.5,
    fontWeight: "700",
  },
});

export default StatusBadge;
