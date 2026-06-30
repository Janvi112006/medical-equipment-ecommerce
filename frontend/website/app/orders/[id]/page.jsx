import RequireAuth from "../../../components/RequireAuth";
import OrderDetailsView from "../../../components/views/OrderDetailsView";

export const metadata = {
  title: "Order Details",
  robots: { index: false, follow: false },
};

const OrderDetailsPage = ({ params }) => (
  <RequireAuth>
    <OrderDetailsView id={params.id} />
  </RequireAuth>
);

export default OrderDetailsPage;
