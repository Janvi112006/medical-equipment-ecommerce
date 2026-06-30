import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabs from "./MainTabs";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ProductDetailsScreen from "../screens/ProductDetailsScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import OrderDetailsScreen from "../screens/OrderDetailsScreen";
import OrderTrackingScreen from "../screens/OrderTrackingScreen";
import { colors } from "../theme";

const Stack = createNativeStackNavigator();

// A single stack holds everything. The 5 main sections live inside MainTabs
// (always reachable — Home/Products/ProductDetails are intentionally public,
// matching the website's design), while Cart/Checkout/Orders/Profile gate
// their own content with RequireAuthGate rather than the whole route being
// hidden. Login/Register are reachable from any gated screen or from a
// product's "Add to cart" action.
const RootNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.surface },
      headerTitleStyle: { color: colors.text },
      headerTintColor: colors.primary,
    }}
  >
    <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
    <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ title: "Product" }} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: "Checkout" }} />
    <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} options={{ title: "Order Details" }} />
    <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ title: "Track Order" }} />
    <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Log In" }} />
    <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Sign Up" }} />
  </Stack.Navigator>
);

export default RootNavigator;
