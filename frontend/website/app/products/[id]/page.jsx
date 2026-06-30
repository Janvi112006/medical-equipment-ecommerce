import ProductDetailsView from "../../../components/views/ProductDetailsView";
import { fetchServerSide } from "../../../lib/apiClient";

export async function generateMetadata({ params }) {
  const product = await fetchServerSide(`/products/${params.id}`);

  if (!product) {
    return { title: "Product" };
  }

  return {
    title: product.name,
    description: product.description?.slice(0, 160) || `Buy ${product.name} at MedEquip.`,
  };
}

const ProductDetailsPage = ({ params }) => <ProductDetailsView id={params.id} />;

export default ProductDetailsPage;
