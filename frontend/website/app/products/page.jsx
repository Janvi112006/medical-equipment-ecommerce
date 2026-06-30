import { Suspense } from "react";
import ProductsView from "../../components/views/ProductsView";
import LoadingState from "../../components/LoadingState";

export const metadata = {
  title: "Shop All Products",
  description: "Browse certified medical equipment by category, price, and availability.",
};

const ProductsPage = () => (
  <Suspense fallback={<LoadingState label="Loading products..." />}>
    <ProductsView />
  </Suspense>
);

export default ProductsPage;
