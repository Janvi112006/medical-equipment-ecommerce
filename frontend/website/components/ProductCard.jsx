import Link from "next/link";

const ProductCard = ({ product }) => (
  <Link href={`/products/${product._id}`} className="product-card">
    <div className="product-card-image">
      {product.images?.[0] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.images[0]} alt={product.name} />
      ) : (
        <span className="product-card-placeholder">No image</span>
      )}
    </div>
    <div className="product-card-body">
      <div className="product-card-category">{product.category}</div>
      <div className="product-card-name">{product.name}</div>
      <div className="product-card-footer">
        <span className="product-card-price">₹{product.price?.toFixed(2)}</span>
        {product.stock <= 0 ? (
          <span className="badge badge-danger">Out of stock</span>
        ) : (
          <span className="badge badge-success">In stock</span>
        )}
      </div>
    </div>
  </Link>
);

export default ProductCard;
