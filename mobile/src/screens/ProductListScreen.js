import { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native";
import apiClient, { getErrorMessage } from "../api/apiClient";
import ScreenContainer from "../components/ScreenContainer";
import LoadingState from "../components/LoadingState";
import ErrorBanner from "../components/ErrorBanner";
import EmptyState from "../components/EmptyState";
import ProductCard from "../components/ProductCard";
import Button from "../components/Button";
import { colors, spacing, radii } from "../theme";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
  { value: "name_desc", label: "Name: Z to A" },
];

const ProductListScreen = ({ navigation, route }) => {
  const initialCategory = route?.params?.category || "";

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState("newest");
  const [categories, setCategories] = useState([]);

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const loadCategories = async () => {
    try {
      const res = await apiClient.get("/products/categories");
      setCategories(res.data.data);
    } catch {
      // non-critical — filters just won't show category chips if this fails
    }
  };

  const loadProducts = useCallback(
    async (targetPage, append) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError("");
      try {
        const res = await apiClient.get("/products", {
          params: {
            search: search || undefined,
            category: category || undefined,
            sort,
            page: targetPage,
            limit: 12,
          },
        });
        setProducts((prev) => (append ? [...prev, ...res.data.data] : res.data.data));
        setPage(res.data.pagination.page);
        setTotalPages(res.data.pagination.totalPages);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [search, category, sort]
  );

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts(1, false);
  }, [loadProducts]);

  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) {
      loadProducts(page + 1, true);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.toolbar}>
        <TextInput
          style={styles.search}
          placeholder="Search products..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => loadProducts(1, false)}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {(category || sort !== "newest") && (
        <View style={styles.activeFilters}>
          {category ? <Text style={styles.activeFilterText}>Category: {category}</Text> : null}
          {sort !== "newest" ? (
            <Text style={styles.activeFilterText}>{SORT_OPTIONS.find((s) => s.value === sort)?.label}</Text>
          ) : null}
        </View>
      )}

      {error ? <ErrorBanner message={error} onRetry={() => loadProducts(1, false)} /> : null}

      {loading ? (
        <LoadingState label="Loading products..." />
      ) : products.length === 0 ? (
        <EmptyState title="No products found" message="Try a different search or clear your filters." />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <ProductCard product={item} onPress={() => navigation.navigate("ProductDetails", { id: item._id })} />
            </View>
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={loadingMore ? <LoadingState label="Loading more..." /> : null}
        />
      )}

      <Modal visible={filterModalVisible} animationType="slide" transparent onRequestClose={() => setFilterModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Filters</Text>
            <ScrollView>
              <Text style={styles.modalLabel}>Category</Text>
              <View style={styles.chipRow}>
                <TouchableOpacity
                  style={[styles.chip, category === "" && styles.chipActive]}
                  onPress={() => setCategory("")}
                >
                  <Text style={[styles.chipText, category === "" && styles.chipTextActive]}>All</Text>
                </TouchableOpacity>
                {categories.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.chip, category === c && styles.chipActive]}
                    onPress={() => setCategory(c)}
                  >
                    <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.modalLabel, { marginTop: spacing.md }]}>Sort by</Text>
              <View style={styles.chipRow}>
                {SORT_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.chip, sort === opt.value && styles.chipActive]}
                    onPress={() => setSort(opt.value)}
                  >
                    <Text style={[styles.chipText, sort === opt.value && styles.chipTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <Button
              title="Apply filters"
              onPress={() => {
                setFilterModalVisible(false);
                loadProducts(1, false);
              }}
              style={{ marginTop: spacing.md }}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  search: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: colors.surface,
    fontSize: 13.5,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  activeFilters: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  activeFilterText: {
    fontSize: 11.5,
    color: colors.primaryDark,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  grid: {
    paddingHorizontal: spacing.lg - spacing.xs,
    paddingBottom: spacing.xl,
  },
  gridItem: {
    width: "50%",
    padding: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
    maxHeight: "75%",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  modalLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 13,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: colors.text,
  },
  chipTextActive: {
    color: "#fff",
  },
});

export default ProductListScreen;
