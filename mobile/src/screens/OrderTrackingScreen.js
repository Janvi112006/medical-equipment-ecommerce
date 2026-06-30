import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import apiClient, { getErrorMessage } from "../api/apiClient";
import ScreenContainer from "../components/ScreenContainer";
import RequireAuthGate from "../components/RequireAuthGate";
import LoadingState from "../components/LoadingState";
import ErrorBanner from "../components/ErrorBanner";
import StatusBadge from "../components/StatusBadge";
import { colors, spacing, radii } from "../theme";

const OrderTrackingContent = ({ route }) => {
  const { id } = route.params;
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [orderRes, trackingRes] = await Promise.all([
        apiClient.get(`/orders/${id}`),
        apiClient.get(`/orders/${id}/tracking`),
      ]);
      setOrder(orderRes.data.data);
      setTracking(trackingRes.data.data.tracking);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <LoadingState label="Loading tracking..." />;
  if (error) return <ErrorBanner message={error} onRetry={load} />;
  if (!order) return null;

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.orderId}>Order #{order._id.slice(-6)}</Text>

      <View style={styles.trackingCard}>
        <View style={styles.trackingRow}>
          <Text style={styles.label}>Carrier</Text>
          <Text style={styles.value}>{tracking?.provider || "Not assigned yet"}</Text>
        </View>
        <View style={styles.trackingRow}>
          <Text style={styles.label}>Tracking ID</Text>
          <Text style={styles.value}>{tracking?.trackingId || "—"}</Text>
        </View>
        <View style={styles.trackingRow}>
          <Text style={styles.label}>Status</Text>
          <StatusBadge value={tracking?.status} />
        </View>
        {!tracking?.trackingId && (
          <Text style={styles.placeholderNote}>
            Tracking will appear here once the order ships. (Tracking is currently a placeholder service pending a
            real courier integration — see Known Issues in the project docs.)
          </Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Order timeline</Text>
      <View style={styles.timeline}>
        {[...(order.history || [])].reverse().map((entry, idx) => (
          <View style={styles.timelineItem} key={idx}>
            <View style={styles.timelineDot} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <StatusBadge value={entry.status} />
              </View>
              <Text style={styles.timelineNote}>{entry.note}</Text>
              <Text style={styles.timelineMeta}>{new Date(entry.changedAt).toLocaleString()}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const OrderTrackingScreen = ({ route, navigation }) => (
  <ScreenContainer>
    <RequireAuthGate navigation={navigation}>
      <OrderTrackingContent route={route} />
    </RequireAuthGate>
  </ScreenContainer>
);

const styles = StyleSheet.create({
  orderId: { fontWeight: "700", fontSize: 16, marginBottom: spacing.md },
  trackingCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  trackingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  label: { color: colors.textMuted, fontSize: 13 },
  value: { fontSize: 13, fontWeight: "600" },
  placeholderNote: {
    fontSize: 11.5,
    color: colors.textFaint,
    marginTop: spacing.xs,
    lineHeight: 16,
  },
  sectionTitle: { fontWeight: "700", fontSize: 14, marginBottom: spacing.sm },
  timeline: { gap: spacing.md },
  timelineItem: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  timelineNote: { fontSize: 12.5, color: colors.text, marginTop: 2 },
  timelineMeta: { fontSize: 11, color: colors.textFaint, marginTop: 2 },
});

export default OrderTrackingScreen;
