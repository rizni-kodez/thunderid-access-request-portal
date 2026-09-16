import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import DashboardPage from "../pages/DashboardPage";
import LandingPage from "../pages/LandingPage";
import NotFoundPage from "../pages/NotFoundPage";

export default function AppRoutes(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/dashboard"
        element={(
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        )}
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
