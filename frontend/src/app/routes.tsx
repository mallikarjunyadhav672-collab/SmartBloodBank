import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { LandingPage } from "./components/LandingPage";
import { UserRegistration } from "./components/UserRegistration";
import { DonorRegistration } from "./components/DonorRegistration";
import { ReceiverRequest } from "./components/ReceiverRequest";
import { DonorDashboard } from "./components/DonorDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { TermsConditions } from "./components/TermsConditions";
import { PredictiveAnalytics } from "./components/PredictiveAnalytics";
import { About } from "./components/About";
import { Login } from "./components/Login";
import { ForgotPassword } from "./components/ForgotPassword";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: LandingPage },
      { path: "about", Component: About },
      {
        path: "register",
        element: (
          <PublicRoute>
            <UserRegistration />
          </PublicRoute>
        ),
      },
      {
        path: "login",
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        ),
      },
      {
        path: "donor-register",
        element: (
          <ProtectedRoute requiredRole="donor">
            <DonorRegistration />
          </ProtectedRoute>
        ),
      },
      {
        path: "request",
        element: (
          <ProtectedRoute requiredRole="receiver">
            <ReceiverRequest />
          </ProtectedRoute>
        ),
      },
      {
        path: "donor-dashboard",
        element: (
          <ProtectedRoute requiredRole="donor">
            <DonorDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "receiver-dashboard",
        element: (
          <ProtectedRoute requiredRole="receiver">
            <ReceiverRequest />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin-dashboard",
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      { path: "terms", Component: TermsConditions },
      {
        path: "analytics",
        element: (
          <ProtectedRoute>
            <PredictiveAnalytics />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
