import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import ProductListScreen from "../screens/ProductListScreen";
import CartScreen from "../screens/CartScreen";
import OrderHistoryScreen from "../screens/OrderHistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { useCart } from "../context/CartContext";
import { colors } from "../theme";

const Tab = createBottomTabNavigator();

// Simple text-based tab icons — avoids pulling in an icon font library just
// for 5 glyphs, keeping dependencies minimal.
const TabIcon = ({ symbol, focused }) => (
  <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.5 }}>{symbol}</Text>
);

const CartTabIcon = ({ focused }) => {
  const { itemCount } = useCart();
  return (
    <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.5 }}>
      🛒{itemCount > 0 ? ` (${itemCount})` : ""}
    </Text>
  );
};

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: true,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: { borderTopColor: colors.border },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon symbol="🏠" focused={focused} /> }}
    />
    <Tab.Screen
      name="Products"
      component={ProductListScreen}
      options={{ title: "Shop", tabBarIcon: ({ focused }) => <TabIcon symbol="📦" focused={focused} /> }}
    />
    <Tab.Screen
      name="Cart"
      component={CartScreen}
      options={{ tabBarIcon: ({ focused }) => <CartTabIcon focused={focused} /> }}
    />
    <Tab.Screen
      name="Orders"
      component={OrderHistoryScreen}
      options={{ title: "My Orders", tabBarIcon: ({ focused }) => <TabIcon symbol="🧾" focused={focused} /> }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: "Account", tabBarIcon: ({ focused }) => <TabIcon symbol="👤" focused={focused} /> }}
    />
  </Tab.Navigator>
);

export default MainTabs;
