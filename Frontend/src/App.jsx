import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AIChatWidget from './components/AIChatWidget';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Products from './pages/public/Products';
import Contact from './pages/public/Contact';
import Tracker from './pages/public/Tracker';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Checkout from './pages/public/Checkout';
import TrackOrder from './pages/public/TrackOrder';
import Feedback from './pages/public/Feedback';
import Developer from './pages/public/Developer';

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Customers from './pages/admin/Customers';
import Orders from './pages/admin/Orders';
import Payments from './pages/admin/Payments';
import InventoryPage from './pages/admin/InventoryPage';
import Complaints from './pages/admin/Complaints';
import AIGrowth from './pages/admin/AIGrowth';
import Campaigns from './pages/admin/Campaigns';
import AuditLog from './pages/admin/AuditLog';

// Customer Pages
import CustomerLayout from './layouts/CustomerLayout';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import MyOrders from './pages/customer/MyOrders';
import MyPayments from './pages/customer/MyPayments';
import MyComplaints from './pages/customer/MyComplaints';
import AIChat from './pages/customer/AIChat';
import Profile from './pages/customer/Profile';

// Protected Route
const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/products" element={<Products />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/tracker" element={<Tracker />} />
      <Route path="/order" element={<Checkout />} />
      <Route path="/my-orders" element={<TrackOrder />} />
      <Route path="/orders" element={<TrackOrder />} />
      <Route path="/track" element={<TrackOrder />} />
      <Route path="/track/:orderId" element={<TrackOrder />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/developer" element={<Developer />} />
      <Route path="/creator" element={<Developer />} />
      <Route path="/ai-assistant" element={<AIChat />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'customer' ? '/portal' : '/admin'} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/portal" replace /> : <Register />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin', 'manager', 'delivery']}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="orders" element={<Orders />} />
        <Route path="payments" element={<Payments />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="complaints" element={<Complaints />} />
        {/* AI Commerce Routes */}
        <Route path="ai-growth" element={<AIGrowth />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="audit-log" element={<AuditLog />} />
      </Route>

      {/* Customer Portal */}
      <Route path="/portal" element={<ProtectedRoute roles={['customer']}><CustomerLayout /></ProtectedRoute>}>
        <Route index element={<CustomerDashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="ai-chat" element={<AIChat />} />
        <Route path="orders" element={<MyOrders />} />
        <Route path="payments" element={<MyPayments />} />
        <Route path="complaints" element={<MyComplaints />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <AIChatWidget />
      </AuthProvider>
    </BrowserRouter>
  );
}
