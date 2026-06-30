import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, radii } from "../theme";

const QuantityStepper = ({ value, onDecrease, onIncrease, disabled }) => (
  <View style={styles.row}>
    <TouchableOpacity style={styles.button} onPress={onDecrease} disabled={disabled}>
      <Text style={styles.buttonText}>−</Text>
    </TouchableOpacity>
    <Text style={styles.value}>{value}</Text>
    <TouchableOpacity style={styles.button} onPress={onIncrease} disabled={disabled}>
      <Text style={styles.buttonText}>+</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  button: {
    width: 34,
    height: 34,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 18,
    color: colors.text,
  },
  value: {
    minWidth: 24,
    textAlign: "center",
    fontWeight: "700",
    fontSize: 14,
  },
});

export default QuantityStepper;
