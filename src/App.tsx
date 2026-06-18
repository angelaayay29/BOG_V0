import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SiteHeader } from "./components/SiteHeader";
import { ArchivePage } from "./pages/ArchivePage";
import { EditorPage } from "./pages/EditorPage";
import { IssuePage } from "./pages/IssuePage";
import { LoginPage } from "./pages/LoginPage";

export default function App() {
  const baseUrl = import.meta.env.BASE_URL;
  const basename =
    baseUrl === "/" ? undefined : baseUrl.replace(/\/$/, "");

  return (
    <AuthProvider>
      <BrowserRouter basename={basename}>
        <SiteHeader />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ArchivePage />
              </ProtectedRoute>
            }
          />
          {/* Public per spec: stable share links work without login */}
          <Route path="/issues/:issueId" element={<IssuePage />} />
          <Route
            path="/editor"
            element={
              <ProtectedRoute roles={["editor"]}>
                <EditorPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
