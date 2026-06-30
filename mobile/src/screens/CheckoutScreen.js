import { useEffect, useState } from "react";
import { View, Text, ScrollView, Modal, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import apiClient, { getErrorMessage } from "../api/apiClient";
import { useCart } from "../context/CartContext";
import ScreenContainer from "../components/ScreenContainer";
import RequireAuthGate from "../components/RequireAuthGate";
import LoadingState from "../components/LoadingState";
import ErrorBanner from "../components/ErrorBanner";
import FormField from "../components/FormField";
import Button from "../components/Button";
import { colors, spacing, radii } from "../theme";

const emptyAddress = { fullName: "", phone: "", addressLine: "", city: "", state: "", pincode: "" };

// A minimal self-contained HTML page that loads Razorpay's checkout.js and
// immediately opens the widget. It bridges back to React Native via
// window.ReactNativeWebView.postMessage, since a native WebView has no other
// way to call back into the app. This avoids needing react-native-razorpay
// (a native module that would require a custom dev build, not available in
// Expo's plain managed workflow).
const buildRazorpayHtml = ({ key, amount, currency, orderId, name, description }) => `
<!DOCTYPE html>
<html>
  <head><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
  <body style="margin:0;background:#fff;">
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <script>
      function send(payload) {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }
      var options = {
        key: "${key}",
        amount: ${amount},
        currency: "${currency}",
        order_id: "${orderId}",
        name: ${JSON.stringify(name)},
        description: ${JSON.stringify(description)},
        handler: function (response) {
          send({ type: "success", response: response });
        },
        modal: {
          ondismiss: function () {
            send({ type: "dismiss" });
          },
        },
        theme: { color: "#0f766e" },
      };
      var rzp = new Razorpay(options);
      rzp.open();
    </script>
  </body>
</html>
`;

const CheckoutScreenContent = ({ navigation }) => {
  const { cart, loading: cartLoading, refreshCart } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState(emptyAddress);

  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");
  const [order, setOrder] = useState(null);

  const [payHtml, setPayHtml] = useState(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  const loadAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await apiClient.get("/addresses");
      setAddresses(res.data.data);
      if (res.data.data.length > 0) setSelectedAddressId(res.data.data[0]._id);
      else setUseNewAddress(true);
    } catch {
      setUseNewAddress(true);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setPlaceError("");
    try {
      const payload = useNewAddress ? { shippingAddress: newAddress } : { addressId: selectedAddressId };
      const res = await apiClient.post("/checkout", payload);
      setOrder(res.data.data);
      refreshCart();
    } catch (err) {
      setPlaceError(getErrorMessage(err));
    } finally {
      setPlacing(false);
    }
  };

  const handlePayNow = async () => {
    setPaying(true);
    setPayError("");
    try {
      const createRes = await apiClient.post("/payments/create-order", { orderId: order._id });
      const { razorpayOrderId, amount, currency, key } = createRes.data.data;
      setPayHtml(
        buildRazorpayHtml({
          key,
          amount,
          currency,
          orderId: razorpayOrderId,
          name: "MedEquip",
          description: `Order #${order._id.slice(-6)}`,
        })
      );
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
        navigation.replace("OrderDetails", { id: order._id });
      } else if (data.type === "dismiss") {
        await apiClient.post("/payments/failure", { orderId: order._id, reason: "Checkout widget closed by customer" });
        setPayHtml(null);
      }
    } catch (err) {
      setPayError(getErrorMessage(err));
      setPayHtml(null);
    }
  };

  if (cartLoading || loadingAddresses) return <LoadingState label="Loading checkout..." />;

  if (order) {
    return (
      <View style={styles.paymentCard}>
        <Text style={styles.cardTitle}>Order placed</Text>
        <Text style={styles.cardSubtitle}>Order #{order._id.slice(-6)} is waiting for payment.</Text>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Amount due</Text>
          <Text style={styles.totalLabel}>₹{order.totalAmount?.toFixed(2)}</Text>
        </View>
        {payError ? <ErrorBanner message={payError} /> : null}
        <Button
          title={paying ? "Opening payment window..." : `Pay ₹${order.totalAmount?.toFixed(2)} now`}
          onPress={handlePayNow}
          loading={paying}
          style={{ marginTop: spacing.md }}
        />
        <Text style={styles.laterHint}>You can also pay later from your order details page.</Text>
        <Button
          title="View order"
          variant="secondary"
          onPress={() => navigation.replace("OrderDetails", { id: order._id })}
          style={{ marginTop: spacing.sm }}
        />

        <Modal visible={!!payHtml} animationType="slide" onRequestClose={() => setPayHtml(null)}>
          <WebView originWhitelist={["*"]} source={{ html: payHtml || "" }} onMessage={handleWebViewMessage} />
        </Modal>
      </View>
    );
  }

  const items = cart?.items || [];
  if (items.length === 0) {
    return <EmptyCartNotice navigation={navigation} />;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.sectionTitle}>Delivery address</Text>

      {addresses.map((addr) => (
        <Text
          key={addr._id}
          style={[styles.addressOption, !useNewAddress && selectedAddressId === addr._id && styles.addressOptionSelected]}
          onPress={() => {
            setUseNewAddress(false);
            setSelectedAddressId(addr._id);
          }}
        >
          {(!useNewAddress && selectedAddressId === addr._id ? "● " : "○ ") +
            `${addr.fullName} — ${addr.addressLine}, ${addr.city}, ${addr.state} ${addr.pincode}`}
        </Text>
      ))}
      <Text
        style={[styles.addressOption, useNewAddress && styles.addressOptionSelected]}
        onPress={() => setUseNewAddress(true)}
      >
        {(useNewAddress ? "● " : "○ ") + "Use a new address"}
      </Text>

      {useNewAddress && (
        <View style={{ marginTop: spacing.md }}>
          <FormField label="Full name" value={newAddress.fullName} onChangeText={(v) => setNewAddress((a) => ({ ...a, fullName: v }))} />
          <FormField label="Phone" value={newAddress.phone} onChangeText={(v) => setNewAddress((a) => ({ ...a, phone: v }))} keyboardType="phone-pad" />
          <FormField label="Address" value={newAddress.addressLine} onChangeText={(v) => setNewAddress((a) => ({ ...a, addressLine: v }))} />
          <FormField label="City" value={newAddress.city} onChangeText={(v) => setNewAddress((a) => ({ ...a, city: v }))} />
          <FormField label="State" value={newAddress.state} onChangeText={(v) => setNewAddress((a) => ({ ...a, state: v }))} />
          <FormField label="Pincode" value={newAddress.pincode} onChangeText={(v) => setNewAddress((a) => ({ ...a, pincode: v }))} />
        </View>
      )}

      <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Order summary</Text>
      {items.map((item) => (
        <View style={styles.summaryRow} key={item.product._id}>
          <Text style={styles.summaryLabel}>
            {item.product.name} × {item.quantity}
          </Text>
          <Text>₹{item.lineTotal?.toFixed(2)}</Text>
        </View>
      ))}
      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalLabel}>₹{cart.total?.toFixed(2)}</Text>
      </View>

      {placeError ? <ErrorBanner message={placeError} /> : null}

      <Button
        title={placing ? "Placing order..." : "Place order"}
        onPress={handlePlaceOrder}
        loading={placing}
        disabled={!useNewAddress && !selectedAddressId}
        style={{ marginTop: spacing.lg }}
      />
    </ScrollView>
  );
};

const EmptyCartNotice = ({ navigation }) => (
  <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl }}>
    <Text style={{ color: colors.textMuted, marginBottom: spacing.md }}>Your cart is empty.</Text>
    <Button title="Continue shopping" onPress={() => navigation.navigate("Products")} style={{ width: 200 }} />
  </View>
);

const CheckoutScreen = ({ navigation }) => (
  <ScreenContainer>
    <RequireAuthGate navigation={navigation}>
      <CheckoutScreenContent navigation={navigation} />
    </RequireAuthGate>
  </ScreenContainer>
);

const styles = StyleSheet.create({
  sectionTitle: {
    fontWeight: "700",
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  addressOption: {
    paddingVertical: 8,
    fontSize: 13,
    color: colors.text,
  },
  addressOptionSelected: {
    color: colors.primaryDark,
    fontWeight: "700",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  summaryLabel: { color: colors.textMuted, fontSize: 13, flex: 1, paddingRight: spacing.sm },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  totalLabel: { fontWeight: "700", fontSize: 15 },
  paymentCard: {
    margin: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cardTitle: { fontSize: 17, fontWeight: "700", marginBottom: 4 },
  cardSubtitle: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.md },
  laterHint: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm, textAlign: "center" },
});

export default CheckoutScreen;
