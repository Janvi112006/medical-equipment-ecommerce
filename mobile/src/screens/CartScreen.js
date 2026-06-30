import { useState } from "react";
import { View, Text, FlatList, Image, StyleSheet } from "react-native";
import { useCart } from "../context/CartContext";
import ScreenContainer from "../components/ScreenContainer";
import RequireAuthGate from "../components/RequireAuthGate";
import LoadingState from "../components/LoadingState";
import ErrorBanner from "../components/ErrorBanner";
import EmptyState from "../components/EmptyState";
import QuantityStepper from "../components/QuantityStepper";
import Button from "../components/Button";
import { colors, spacing, radii } from "../theme";

const CartScreenContent = ({ navigation }) => {
  const { cart, loading, error, refreshCart, updateQuantity, removeItem } = useCart();
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const handleQuantityChange = async (productId, quantity) => {
    if (quantity < 1) return;
    setBusyId(productId);
    setActionError("");
    try {
      await updateQuantity(productId, quantity);
    } catch (err) {
      setActionError(err?.response?.data?.message || "Could not update quantity.");
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (productId) => {
    setBusyId(productId);
    setActionError("");
    try {
      await removeItem(productId);
    } catch (err) {
      setActionError(err?.response?.data?.message || "Could not remove item.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading && !cart) return <LoadingState label="Loading your cart..." />;
  if (error) return <ErrorBanner message={error} onRetry={refreshCart} />;

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        message="Browse the catalog and add something you need."
        action={<Button title="Continue shopping" onPress={() => navigation.navigate("Products")} style={{ marginTop: spacing.sm, width: 200 }} />}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {actionError ? <ErrorBanner message={actionError} /> : null}
      <FlatList
        data={items}
        keyExtractor={(item) => item.product._id}
        contentContainerStyle={{ padding: spacing.md }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.imageWrap}>
              {item.product.images?.[0] ? (
                <Image source={{ uri: item.product.images[0] }} style={styles.image} resizeMode="cover" />
              ) : (
                <Text style={styles.noImage}>No image</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.product.name}</Text>
              <Text style={styles.unitPrice}>₹{item.product.price?.toFixed(2)} each</Text>
              <View style={styles.actionsRow}>
                <QuantityStepper
                  value={item.quantity}
                  onDecrease={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                  onIncrease={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                  disabled={busyId === item.product._id}
                />
                <Text style={styles.lineTotal}>₹{item.lineTotal?.toFixed(2)}</Text>
              </View>
              <Text style={styles.removeLink} onPress={() => handleRemove(item.product._id)}>
                Remove
              </Text>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text>₹{cart.subtotal?.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text>₹{cart.tax?.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalLabel}>₹{cart.total?.toFixed(2)}</Text>
            </View>
            <Button title="Proceed to checkout" onPress={() => navigation.navigate("Checkout")} style={{ marginTop: spacing.md }} />
          </View>
        }
      />
    </View>
  );
};

const CartScreen = ({ navigation }) => (
  <ScreenContainer>
    <RequireAuthGate navigation={navigation}>
      <CartScreenContent navigation={navigation} />
    </RequireAuthGate>
  </ScreenContainer>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  imageWrap: {
    width: 64,
    height: 64,
    borderRadius: radii.sm,
    backgroundColor: colors.neutralLight,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  noImage: { fontSize: 10, color: colors.textFaint },
  name: { fontWeight: "600", fontSize: 13.5, marginBottom: 2 },
  unitPrice: { color: colors.textMuted, fontSize: 12 },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  lineTotal: { fontWeight: "700", fontSize: 13.5 },
  removeLink: {
    color: colors.danger,
    fontSize: 12,
    marginTop: spacing.sm,
    fontWeight: "600",
  },
  summary: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  summaryLabel: { color: colors.textMuted, fontSize: 13 },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  totalLabel: { fontWeight: "700", fontSize: 15 },
});

export default CartScreen;
