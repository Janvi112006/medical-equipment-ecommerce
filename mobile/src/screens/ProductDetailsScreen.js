import { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet } from "react-native";
import apiClient, { getErrorMessage } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import ScreenContainer from "../components/ScreenContainer";
import LoadingState from "../components/LoadingState";
import ErrorBanner from "../components/ErrorBanner";
import QuantityStepper from "../components/QuantityStepper";
import Button from "../components/Button";
import { colors, spacing, radii } from "../theme";

const ProductDetailsScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { token } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [addedMessage, setAddedMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get(`/products/${id}`);
      setProduct(res.data.data);
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

  const handleAddToCart = async () => {
    if (!token) {
      navigation.navigate("Login");
      return;
    }
    setAdding(true);
    setAddError("");
    setAddedMessage("");
    try {
      await addToCart(id, quantity);
      setAddedMessage("Added to cart.");
    } catch (err) {
      setAddError(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <LoadingState label="Loading product..." />;
  if (error) return <ScreenContainer><ErrorBanner message={error} onRetry={load} /></ScreenContainer>;
  if (!product) return null;

  const outOfStock = product.stock <= 0;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.imageWrap}>
          {product.images?.[0] ? (
            <Image source={{ uri: product.images[0] }} style={styles.image} resizeMode="cover" />
          ) : (
            <Text style={styles.noImage}>No image available</Text>
          )}
        </View>

        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>₹{product.price?.toFixed(2)}</Text>

        <View style={[styles.stockBadge, { backgroundColor: outOfStock ? colors.dangerLight : colors.successLight }]}>
          <Text style={{ color: outOfStock ? colors.danger : colors.success, fontWeight: "700", fontSize: 12 }}>
            {outOfStock ? "Out of stock" : `${product.stock} in stock`}
          </Text>
        </View>

        <Text style={styles.description}>{product.description}</Text>

        {!outOfStock && (
          <QuantityStepper
            value={quantity}
            onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
            onIncrease={() => setQuantity((q) => Math.min(product.stock, q + 1))}
          />
        )}

        {addError ? <ErrorBanner message={addError} /> : null}
        {addedMessage ? (
          <View style={[styles.stockBadge, { backgroundColor: colors.successLight, marginTop: spacing.md }]}>
            <Text style={{ color: colors.success, fontWeight: "700", fontSize: 12 }}>{addedMessage}</Text>
          </View>
        ) : null}

        <Button
          title={outOfStock ? "Out of stock" : adding ? "Adding..." : "Add to cart"}
          onPress={handleAddToCart}
          disabled={outOfStock}
          loading={adding}
          style={{ marginTop: spacing.lg }}
        />

        {!token && <Text style={styles.loginHint}>You'll be asked to log in first.</Text>}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.lg,
  },
  imageWrap: {
    aspectRatio: 1,
    backgroundColor: colors.neutralLight,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  noImage: {
    color: colors.textFaint,
    fontSize: 13,
  },
  category: {
    fontSize: 11,
    textTransform: "uppercase",
    color: colors.textFaint,
    fontWeight: "700",
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  price: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  stockBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: spacing.md,
  },
  description: {
    color: colors.textMuted,
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  loginHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: "center",
  },
});

export default ProductDetailsScreen;
