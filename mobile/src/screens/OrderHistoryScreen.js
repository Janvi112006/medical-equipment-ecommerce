import { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import apiClient, { getErrorMessage } from "../api/apiClient";
import ScreenContainer from "../components/ScreenContainer";
import RequireAuthGate from "../components/RequireAuthGate";
import LoadingState from "../components/LoadingState";
import ErrorBanner from "../components/ErrorBanner";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";
import { colors, spacing, radii } from "../theme";

const OrderHistoryContent = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (targetPage, append) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError("");
    try {
      const res = await apiClient.get("/orders/my", { params: { page: targetPage, limit: 10 } });
      setOrders((prev) => (append ? [...prev, ...res.data.data] : res.data.data));
      setPage(res.data.pagination.page);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load(1, false);
  }, [load]);

  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) load(page + 1, true);
  };

  if (loading) return <LoadingState label="Loading your orders..." />;
  if (error) return <ErrorBanner message={error} onRetry={() => load(1, false)} />;

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        message="When you place an order, it'll show up here."
        action={<Button title="Start shopping" onPress={() => navigation.navigate("Products")} style={{ marginTop: spacing.sm, width: 200 }} />}
      />
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item._id}
      contentContainerStyle={{ padding: spacing.md }}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate("OrderDetails", { id: item._id })}>
          <View style={{ flex: 1 }}>
            <Text style={styles.orderId}>#{item._id.slice(-6)}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: 4 }}>
            <Text style={styles.amount}>₹{item.totalAmount?.toFixed(2)}</Text>
            <StatusBadge value={item.status} />
          </View>
        </TouchableOpacity>
      )}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.4}
      ListFooterComponent={loadingMore ? <LoadingState label="Loading more..." /> : null}
    />
  );
};

const OrderHistoryScreen = ({ navigation }) => (
  <ScreenContainer>
    <RequireAuthGate navigation={navigation}>
      <OrderHistoryContent navigation={navigation} />
    </RequireAuthGate>
  </ScreenContainer>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  orderId: { fontWeight: "700", fontSize: 13.5, marginBottom: 2 },
  date: { color: colors.textMuted, fontSize: 12 },
  amount: { fontWeight: "700", fontSize: 13.5 },
});

export default OrderHistoryScreen;
