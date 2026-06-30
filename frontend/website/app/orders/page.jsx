import RequireAuth from "../../components/RequireAuth";
import OrdersView from "../../components/views/OrdersView";

export const metadata = {
  title: "My Orders",
  robots: { index: false, follow: false },
};

const OrdersPage = () => (
  <RequireAuth>
    <OrdersView />
  </RequireAuth>
);

export default OrdersPage;
