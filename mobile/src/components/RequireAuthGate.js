import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";
import LoadingState from "./LoadingState";
import { colors, spacing } from "../theme";

// Wrap any screen's content with this to require a logged-in user.
// Mirrors the website's RequireAuth, but as an in-place gate rather than a
// route redirect — so the tab itself is always reachable, just its content
// is gated. This lets Home/Products/ProductDetails stay public while
// Cart/Checkout/Orders/Profile require login, matching the website's design.
const RequireAuthGate = ({ navigation, children }) => {
  const { token, initializing } = useAuth();

  if (initializing) {
    return <LoadingState label="Checking your session..." />;
  }

  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Log in to continue</Text>
        <Text style={styles.message}>You need an account to view this.</Text>
        <Button title="Log in" onPress={() => navigation.navigate("Login")} style={styles.button} />
        <Button
          title="Create an account"
          variant="secondary"
          onPress={() => navigation.navigate("Register")}
          style={styles.button}
        />
      </View>
    );
  }

  return children;
};

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
    fontSize: 16,
    color: colors.text,
  },
  message: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  button: {
    width: 220,
    marginTop: spacing.xs,
  },
});

export default RequireAuthGate;
