import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import apiClient, { getErrorMessage } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import ScreenContainer from "../components/ScreenContainer";
import RequireAuthGate from "../components/RequireAuthGate";
import LoadingState from "../components/LoadingState";
import ErrorBanner from "../components/ErrorBanner";
import FormField from "../components/FormField";
import Button from "../components/Button";
import { colors, spacing, radii } from "../theme";

const emptyAddress = { fullName: "", phone: "", addressLine: "", city: "", state: "", pincode: "" };

const ProfileContent = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyAddress);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [profileRes, addressesRes] = await Promise.all([
        apiClient.get("/auth/profile"),
        apiClient.get("/addresses"),
      ]);
      setProfile(profileRes.data.data);
      setAddresses(addressesRes.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddAddress = async () => {
    setSaving(true);
    setFormError("");
    try {
      await apiClient.post("/addresses", form);
      setForm(emptyAddress);
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await apiClient.delete(`/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.navigate("Home");
  };

  if (loading) return <LoadingState label="Loading your profile..." />;

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
      {error ? <ErrorBanner message={error} onRetry={load} /> : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account details</Text>
        <Row label="Name" value={profile?.name || user?.name} />
        <Row label="Email" value={profile?.email || user?.email} />
        <Row label="Phone" value={profile?.phone || "—"} />
        <Row label="Member since" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"} />
        <Button title="View order history" variant="secondary" onPress={() => navigation.navigate("Orders")} style={{ marginTop: spacing.sm }} />
      </View>

      <View style={[styles.card, { marginTop: spacing.lg }]}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Saved addresses</Text>
          <Text style={styles.link} onPress={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ Add"}
          </Text>
        </View>

        {showForm && (
          <View style={{ marginBottom: spacing.md }}>
            {formError ? <ErrorBanner message={formError} /> : null}
            <FormField label="Full name" value={form.fullName} onChangeText={(v) => setForm((f) => ({ ...f, fullName: v }))} />
            <FormField label="Phone" value={form.phone} onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))} keyboardType="phone-pad" />
            <FormField label="Address" value={form.addressLine} onChangeText={(v) => setForm((f) => ({ ...f, addressLine: v }))} />
            <FormField label="City" value={form.city} onChangeText={(v) => setForm((f) => ({ ...f, city: v }))} />
            <FormField label="State" value={form.state} onChangeText={(v) => setForm((f) => ({ ...f, state: v }))} />
            <FormField label="Pincode" value={form.pincode} onChangeText={(v) => setForm((f) => ({ ...f, pincode: v }))} />
            <Button title={saving ? "Saving..." : "Save address"} onPress={handleAddAddress} loading={saving} />
          </View>
        )}

        {addresses.length === 0 ? (
          <Text style={styles.muted}>No saved addresses yet.</Text>
        ) : (
          addresses.map((addr) => (
            <View key={addr._id} style={styles.addressRow}>
              <Text style={styles.addressText}>
                {addr.fullName} — {addr.addressLine}, {addr.city}, {addr.state} {addr.pincode}
              </Text>
              <Text style={styles.removeLink} onPress={() => handleDelete(addr._id)}>
                {deletingId === addr._id ? "Removing..." : "Remove"}
              </Text>
            </View>
          ))
        )}
      </View>

      <Button title="Log out" variant="secondary" onPress={handleLogout} style={{ marginTop: spacing.lg }} />
    </ScrollView>
  );
};

const Row = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const ProfileScreen = ({ navigation }) => (
  <ScreenContainer>
    <RequireAuthGate navigation={navigation}>
      <ProfileContent navigation={navigation} />
    </RequireAuthGate>
  </ScreenContainer>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  cardTitle: { fontWeight: "700", fontSize: 14, marginBottom: spacing.sm },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  rowLabel: { color: colors.textMuted, fontSize: 13 },
  rowValue: { fontSize: 13, fontWeight: "600" },
  muted: { color: colors.textMuted, fontSize: 13 },
  addressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  addressText: { fontSize: 12.5, flex: 1, paddingRight: spacing.sm },
  removeLink: { color: colors.danger, fontSize: 12, fontWeight: "600" },
  link: { color: colors.primary, fontSize: 13, fontWeight: "700" },
});

export default ProfileScreen;
