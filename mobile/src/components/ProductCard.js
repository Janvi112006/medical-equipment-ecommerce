import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { colors, spacing, radii } from "../theme";

const ProductCard = ({ product, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.imageWrap}>
      {product.images?.[0] ? (
        <Image source={{ uri: product.images[0] }} style={styles.image} resizeMode="cover" />
      ) : (
        <Text style={styles.noImage}>No image</Text>
      )}
    </View>
    <View style={styles.body}>
      <Text style={styles.category}>{product.category}</Text>
      <Text style={styles.name} numberOfLines={2}>
        {product.name}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.price}>₹{product.price?.toFixed(2)}</Text>
        <View style={[styles.stockBadge, { backgroundColor: product.stock > 0 ? colors.successLight : colors.dangerLight }]}>
          <Text style={{ fontSize: 10.5, fontWeight: "700", color: product.stock > 0 ? colors.success : colors.danger }}>
            {product.stock > 0 ? "In stock" : "Out of stock"}
          </Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    margin: spacing.xs,
  },
  imageWrap: {
    aspectRatio: 1,
    backgroundColor: colors.neutralLight,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  noImage: {
    fontSize: 11,
    color: colors.textFaint,
  },
  body: {
    padding: spacing.sm,
  },
  category: {
    fontSize: 10,
    textTransform: "uppercase",
    color: colors.textFaint,
    fontWeight: "700",
    marginBottom: 2,
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontWeight: "700",
    fontSize: 14,
  },
  stockBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
});

export default ProductCard;
