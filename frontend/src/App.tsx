import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import InventarioPage from "./pages/InventarioPage";
import PedidosPage from "./pages/PedidosPage";
import EnviosPage from "./pages/EnviosPage";

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      {/* Rutas protegidas */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/inventario" element={<InventarioPage />} />
        <Route path="/pedidos" element={<PedidosPage />} />
        <Route path="/envios" element={<EnviosPage />} />
      </Route>
      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
export default App;
