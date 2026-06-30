import { useState } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useAuth } from "../context/AuthContext";
import FormField from "../components/FormField";
import Button from "../components/Button";
import ErrorBanner from "../components/ErrorBanner";
import ScreenContainer from "../components/ScreenContainer";
import { colors, spacing } from "../theme";

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    const result = await register(form);
    setSubmitting(false);
    if (result.success) {
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.navigate("MainTabs");
    } else {
      setError(result.message);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>It only takes a minute.</Text>

          {error ? <ErrorBanner message={error} /> : null}

          <FormField label="Full name" value={form.name} onChangeText={update("name")} placeholder="Jane Doe" />
          <FormField
            label="Email"
            value={form.email}
            onChangeText={update("email")}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
          <FormField label="Phone (optional)" value={form.phone} onChangeText={update("phone")} keyboardType="phone-pad" />
          <FormField
            label="Password"
            value={form.password}
            onChangeText={update("password")}
            secureTextEntry
            placeholder="At least 6 characters"
          />

          <Button title={submitting ? "Creating account..." : "Sign up"} onPress={handleSubmit} loading={submitting} />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Text style={styles.link} onPress={() => navigation.navigate("Login")}>
              Log in
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  link: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },
});

export default RegisterScreen;
