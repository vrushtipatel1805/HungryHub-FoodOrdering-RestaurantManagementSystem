import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';

import Home from '../pages/Public/Home';
import About from '../pages/Public/About';
import Menu from '../pages/Public/Menu';
import Cart from '../pages/Public/Cart';
import Checkout from '../pages/Public/Checkout';
import ReserveTable from '../pages/Public/ReserveTable';
import OrderNow from '../pages/Public/OrderNow';
import Feedback from '../pages/Public/Feedback';
import Login from '../pages/Public/Login';
import ForgotPassword from '../pages/Public/ForgotPassword';
import NotFound from '../pages/Public/NotFound';
import AITasteMatch from '../pages/Public/AITasteMatch';

import Dashboard from '../pages/Admin/Dashboard';
import MenuManagement from '../pages/Admin/MenuManagement';
import Orders from '../pages/Admin/Orders';
import OrderDetails from '../pages/Admin/OrderDetails';
import TableBookings from '../pages/Admin/TableBookings';
import Events from '../pages/Admin/Events';
import Customers from '../pages/Admin/Customers';
import Coupons from '../pages/Admin/Coupons';
import FeedbackManagement from '../pages/Admin/FeedbackManagement';
import Reports from '../pages/Admin/Reports';
import EmailNotifications from '../pages/Admin/EmailNotifications';
import Settings from '../pages/Admin/Settings';
import PaymentManagement from '../pages/Admin/PaymentManagement';
import AdminManagement from '../pages/Admin/AdminManagement';
import TasteMatchAdmin from '../pages/Admin/TasteMatchAdmin';
import ProtectedRoute from '../components/Common/ProtectedRoute';


export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/taste-match" element={<AITasteMatch />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/reserve" element={<ReserveTable />} />
        <Route path="/order-now" element={<OrderNow />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="menu" element={<MenuManagement />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetails />} />
        <Route path="tables" element={<TableBookings />} />
        <Route path="events" element={<Events />} />
        <Route path="customers" element={<Customers />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="feedback" element={<FeedbackManagement />} />
        <Route path="reports" element={<Reports />} />
        <Route path="email-notifications" element={<EmailNotifications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="payments" element={<PaymentManagement />} />
        <Route path="admins" element={<AdminManagement />} />
        <Route path="taste-match" element={<TasteMatchAdmin />} />
      </Route>


      <Route path="*" element={<NotFound />} />
      <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
