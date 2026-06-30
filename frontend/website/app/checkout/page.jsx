import RequireAuth from "../../components/RequireAuth";
import CheckoutView from "../../components/views/CheckoutView";

export const metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

const CheckoutPage = () => (
  <RequireAuth>
    <CheckoutView />
  </RequireAuth>
);

export default CheckoutPage;
