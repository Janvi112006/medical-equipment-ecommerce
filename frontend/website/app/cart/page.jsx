import RequireAuth from "../../components/RequireAuth";
import CartView from "../../components/views/CartView";

export const metadata = {
  title: "Your Cart",
  robots: { index: false, follow: false },
};

const CartPage = () => (
  <RequireAuth>
    <CartView />
  </RequireAuth>
);

export default CartPage;
