import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./hooks/AuthProvider";
import { ShellLayout } from "./components/layout/ShellLayout";
import { ProtectedRoute } from "./router/ProtectedRoute";

const LoginPage = lazy(() => import("./pages/auth/LoginPage").then((mod) => ({ default: mod.LoginPage })));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard").then((mod) => ({ default: mod.AdminDashboard })));
const ManagerDashboard = lazy(() => import("./pages/manager/ManagerDashboard").then((mod) => ({ default: mod.ManagerDashboard })));
const EmployeeDashboard = lazy(() => import("./pages/employee/EmployeeDashboard").then((mod) => ({ default: mod.EmployeeDashboard })));
const GoalsPage = lazy(() => import("./pages/shared/GoalsPage").then((mod) => ({ default: mod.GoalsPage })));
const ReviewsPage = lazy(() => import("./pages/shared/ReviewsPage").then((mod) => ({ default: mod.ReviewsPage })));
const FeedbackPage = lazy(() => import("./pages/shared/FeedbackPage").then((mod) => ({ default: mod.FeedbackPage })));
const NotificationsPage = lazy(() => import("./pages/shared/NotificationsPage").then((mod) => ({ default: mod.NotificationsPage })));
const UsersPage = lazy(() => import("./pages/admin/UsersPage").then((mod) => ({ default: mod.UsersPage })));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={<div className="min-h-screen grid place-items-center">Loading...</div>}>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<div>Unauthorized</div>} />
              <Route element={<ProtectedRoute />}>
                <Route element={<ShellLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/manager" element={<ManagerDashboard />} />
                  <Route path="/employee" element={<EmployeeDashboard />} />
                  <Route path="/goals" element={<GoalsPage />} />
                  <Route path="/reviews" element={<ReviewsPage />} />
                  <Route path="/feedback" element={<FeedbackPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/users" element={<UsersPage />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </Suspense>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
