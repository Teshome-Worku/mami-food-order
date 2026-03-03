import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import CustomerMenu from "./pages/Menu";
import Cart from "./pages/Cart";
import Success from "./pages/Success";
import TrackOrder from "./pages/TrackOrder";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOrders from "./pages/admin/Orders";
import AdminMenu from "./pages/admin/Menu";
import Announcements from "./pages/admin/Announcements";
import Settings from "./pages/admin/Settings";

import { api } from "./services/api";
import { ROUTES } from "./constants";

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith(ROUTES.ADMIN);

  const handlePlaceOrder = async (order) => {
    const data = await api.createOrder(order);
    navigate(ROUTES.SUCCESS, {
      state: {
        orderId: data.orderId,
        trackingCode: data.trackingCode,
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && <CartDrawer />}

      <main className={`flex-1 ${!isAdminRoute ? "pt-16" : ""}`}>
        <Routes>
          {/* Customer routes */}
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.MENU} element={<CustomerMenu />} />
          <Route
            path={ROUTES.CART}
            element={<Cart onPlaceOrder={handlePlaceOrder} />}
          />
          <Route path={ROUTES.SUCCESS} element={<Success />} />
          <Route path={ROUTES.TRACK_ORDER} element={<TrackOrder />} />

          {/* Admin routes */}
          <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />
          <Route path={ROUTES.ADMIN} element={<AdminLayout />}>
            <Route index element={<Navigate to="orders" replace />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="menu" element={<AdminMenu />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
};

export default App;
