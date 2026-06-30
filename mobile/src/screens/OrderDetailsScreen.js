import { useEffect, useState } from "react";
import { View, Text, ScrollView, Modal, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import apiClient, { getErrorMessage } from "../api/apiClient";
import ScreenContainer from "../components/ScreenContainer";
import RequireAuthGate from "../components/RequireAuthGate";
import LoadingState from "../components/LoadingState";
import ErrorBanner from "../components/ErrorBanner";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";
import { colors, spacing } from "../theme";

const buildRazorpayHtml = ({ key, amount, currency, orderId, name, description }) => `
<!DOCTYPE html>
<html>
  <head><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
  <body style="margin:0;background:#fff;">
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <script>
      function send(payload) { window.ReactNativeWebView.postMessage(JSON.stringify(payload)); }
      var rzp = new Razorpay({
        key: "${key}", amount: ${amount}, currency: "${currency}", order_id: "${orderId}",
        name: ${JSON.stringify(name)}, description: ${JSON.stringify(description)},
        handler: function (response) { send({ type: "success", response: response }); },
        modal: { ondismiss: function () { send({ type: "dismiss" }); } },
        theme: { color: "#0f766e" },
      });
      rzp.open();
    </script>
  </body>
</html>
`;

const OrderDetailsContent = ({ route, navigation }) => {
  const { id } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payHtml, setPayHtml] = useState(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get(`/orders/${id}`);
      setOrder(res.data.data);
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

  const handlePayNow = async () => {
    setPaying(true);
    setPayError("");
    try {
      const createRes = await apiClient.post("/payments/create-order", { orderId: order._id });
      const { razorpayOrderId, amount, currency, key } = createRes.data.data;
      setPayHtml(buildRazorpayHtml({ key, amount, currency, orderId: razorpayOrderId, name: "MedEquip", description: `Order #${order._id.slice(-6)}` }));
    } catch (err) {
      setPayError(getErrorMessage(err));
    } finally {
      setPaying(false);
    }
  };

  const handleWebViewMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "success") {
        await apiClient.post("/payments/verify", {
          orderId: order._id,
          razorpay_order_id: data.response.razorpay_order_id,
          razorpay_payment_id: data.response.razorpay_payment_id,
          razorpay_signature: data.response.razorpay_signature,
        });
        setPayHtml(null);
        load();
      } else if (data.type === "dismiss") {
        await apiClient.post("/payments/failure", { orderId: order._id, reason: "Checkout widget closed" });
        setPayHtml(null);
      }
    } catch (err) {
      setPayError(getErrorMessage(err));
      setPayHtml(null);
    }
  };

  if (loading) return <LoadingState label="Loading order..." />;
  if (error) return <ErrorBanner message={error} onRetry={load} />;
  if (!order) return null;

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.orderId}>Order #{order._id.slice(-6)}</Text>
          <Text style={styles.date}>{new Date(order.createdAt).toLocaleString()}</Text>
        </View>
        <StatusBadge value={order.status} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Payment</Text>
        <StatusBadge value={order.payment?.status} />
      </View>

      {order.payment?.status !== "paid" && (
        <>
          {payError ? <ErrorBanner message={payError} /> : null}
          <Button
            title={paying ? "Opening payment window..." : `Pay ₹${order.totalAmount?.toFixed(2)} now`}
            onPress={handlePayNow}
            loading={paying}
            style={{ marginVertical: spacing.md }}
          />
        </>
      )}

      <Text style={styles.sectionTitle}>Items</Text>
      {order.items.map((item, idx) => (
        <View style={styles.itemRow} key={idx}>
          <Text style={styles.itemName}>
            {item.name} × {item.quantity}
          </Text>
          <Text>₹{(item.price * item.quantity).toFixed(2)}</Text>
        </View>
      ))}

      <View style={[styles.itemRow, { marginTop: spacing.sm }]}>
        <Text style={styles.label}>Subtotal</Text>
        <Text>₹{order.subtotal?.toFixed(2)}</Text>
      </View>
      <View style={styles.itemRow}>
        <Text style={styles.label}>Tax</Text>
        <Text>₹{order.tax?.toFixed(2)}</Text>
      </View>
      <View style={[styles.itemRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalLabel}>₹{order.totalAmount?.toFixed(2)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Shipping address</Text>
      <Text style={styles.address}>
        {order.shippingAddress?.fullName}, {order.shippingAddress?.addressLine}, {order.shippingAddress?.city},{" "}
        {order.shippingAddress?.state} - {order.shippingAddress?.pincode} · {order.shippingAddress?.phone}
      </Text>

      <Button
        title="Track this order"
        variant="secondary"
        onPress={() => navigation.navigate("OrderTracking", { id: order._id })}
        style={{ marginTop: spacing.md }}
      />

      <Modal visible={!!payHtml} animationType="slide" onRequestClose={() => setPayHtml(null)}>
        <WebView originWhitelist={["*"]} source={{ html: payHtml || "" }} onMessage={handleWebViewMessage} />
      </Modal>
    </ScrollView>
  );
};

const OrderDetailsScreen = ({ route, navigation }) => (
  <ScreenContainer>
    <RequireAuthGate navigation={navigation}>
      <OrderDetailsContent route={route} navigation={navigation} />
    </RequireAuthGate>
  </ScreenContainer>
);

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  orderId: { fontWeight: "700", fontSize: 16 },
  date: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  label: { color: colors.textMuted, fontSize: 13 },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 14,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  itemName: { fontSize: 13, flex: 1, paddingRight: spacing.sm },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  totalLabel: { fontWeight: "700", fontSize: 15 },
  address: { fontSize: 13, color: colors.text, lineHeight: 19 },
});

export default OrderDetailsScreen;
