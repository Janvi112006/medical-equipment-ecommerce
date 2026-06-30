import { SafeAreaView, StyleSheet } from "react-native";
import { colors } from "../theme";

const ScreenContainer = ({ children, style }) => (
  <SafeAreaView style={[styles.container, style]}>{children}</SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});

export default ScreenContainer;
