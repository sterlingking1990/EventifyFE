import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import AdminLayout from "../layouts/AdminLayout";

import HomePage from "../pages/HomePage";
import EventListPage from "../pages/EventListPage";
import EventDetailPage from "../pages/EventDetailPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import NotFoundPage from "../pages/NotFoundPage";
import CheckoutPage from "../pages/CheckoutPage";
import MyTicketsPage from "../pages/MyTicketsPage";
import DashboardPage from "../pages/DashboardPage";
import ManageEventsPage from "../pages/ManageEventsPage";
import CreateEventPage from "../pages/CreateEventPage";
import EditEventPage from "../pages/EditEventPage";
import QRScannerPage from "../pages/QRScannerPage";
import TermsPage from "../pages/TermsPage";
import PrivacyPage from "../pages/PrivacyPage";
import ContactPage from "../pages/ContactPage";
import PaymentSuccessPage from "../pages/PaymentSuccessPage";
import ScannerLoginPage from "../pages/ScannerLoginPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import PayoutsPage from "../pages/PayoutsPage";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminEvents from "../pages/admin/AdminEvents";
import AdminOrganizers from "../pages/admin/AdminOrganizers";
import AdminAttendees from "../pages/admin/AdminAttendees";
import AdminPayouts from "../pages/admin/AdminPayouts";
import AdminSettings from "../pages/admin/AdminSettings";

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner className="mt-20" size="lg" />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/dashboard" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner className="mt-20" size="lg" />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventListPage />} />
        <Route path="/events/:slug" element={<EventDetailPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={<GuestRoute><LoginPage /></GuestRoute>}
        />
        <Route
          path="/register"
          element={<GuestRoute><RegisterPage /></GuestRoute>}
        />
        <Route
          path="/scanner-sign-in"
          element={<GuestRoute><ScannerLoginPage /></GuestRoute>}
        />
        <Route
          path="/forgot-password"
          element={<GuestRoute><ForgotPasswordPage /></GuestRoute>}
        />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tickets" element={<MyTicketsPage />} />
        <Route
          path="/dashboard/events"
          element={<ProtectedRoute allowedRole="organizer"><ManageEventsPage /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/events/new"
          element={<ProtectedRoute allowedRole="organizer"><CreateEventPage /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/events/:slug"
          element={<ProtectedRoute allowedRole="organizer"><EditEventPage /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/scan"
          element={<ProtectedRoute allowedRole="organizer"><QRScannerPage /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/payouts"
          element={<ProtectedRoute allowedRole="organizer"><PayoutsPage /></ProtectedRoute>}
        />
      </Route>

      <Route
        path="/checkout/:slug"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CheckoutPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/organizers" element={<AdminOrganizers />} />
        <Route path="/admin/attendees" element={<AdminAttendees />} />
        <Route path="/admin/payouts" element={<AdminPayouts />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<MainLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
