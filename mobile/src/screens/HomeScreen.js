import { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import apiClient, { getErrorMessage } from "../api/apiClient";
import ScreenContainer from "../components/ScreenContainer";
import LoadingState from "../components/LoadingState";
import ErrorBanner from "../components/ErrorBanner";
import ProductCard from "../components/ProductCard";
import { colors, spacing, radii } from "../theme";

const HomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const load = useCallback(async () => {
    setError("");
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        apiClient.get("/products/categories"),
        apiClient.get("/products", { params: { sort: "newest", limit: 8 } }),
      ]);
      setCategories(categoriesRes.data.data);
      setProducts(productsRes.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) return <LoadingState label="Loading the storefront..." />;

  return (
    <ScreenContainer>
      <FlatList
        data={[]}
        keyExtractor={() => "noop"}
        renderItem={null}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListHeaderComponent={
          <View>
            <View style={styles.hero}>
              <Text style={styles.heroTitle}>Quality medical equipment, delivered with care.</Text>
              <Text style={styles.heroSubtitle}>
                Certified diagnostic devices, mobility aids, and home healthcare essentials.
              </Text>
              <TouchableOpacity style={styles.heroButton} onPress={() => navigation.navigate("Products")}>
                <Text style={styles.heroButtonText}>Shop now</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              {error ? <ErrorBanner message={error} onRetry={load} /> : null}

              {categories.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Shop by category</Text>
                  <View style={styles.chipRow}>
                    {categories.map((c) => (
                      <TouchableOpacity
                        key={c}
                        style={styles.chip}
                        onPress={() => navigation.navigate("Products", { category: c })}
                      >
                        <Text style={styles.chipText}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Newest arrivals</Text>
            </View>
          </View>
        }
        ListFooterComponent={
          products.length > 0 ? (
            <View style={styles.grid}>
              {products.map((p) => (
                <View key={p._id} style={styles.gridItem}>
                  <ProductCard product={p} onPress={() => navigation.navigate("ProductDetails", { id: p._id })} />
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No products available yet.</Text>
          )
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primaryDark,
    padding: spacing.lg,
    paddingVertical: spacing.xl,
  },
  heroTitle: {
    color: "#f3fbf9",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    color: "rgba(243,251,249,0.85)",
    fontSize: 13.5,
    marginBottom: spacing.lg,
  },
  heroButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: "flex-start",
  },
  heroButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13.5,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: colors.text,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.lg - spacing.xs,
    paddingBottom: spacing.xl,
  },
  gridItem: {
    width: "50%",
    padding: spacing.xs,
  },
  emptyText: {
    textAlign: "center",
    color: colors.textMuted,
    padding: spacing.lg,
  },
});

export default HomeScreen;
