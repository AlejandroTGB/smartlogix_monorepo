import { Outlet, NavLink } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
export default function DashboardLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navLinks = [
    { to: "/dashboard", icon: "dashboard", label: "Panel Principal" },
    { to: "/inventario", icon: "inventory_2", label: "Inventario" },
    { to: "/pedidos", icon: "shopping_cart", label: "Pedidos" },
    { to: "/envios", icon: "local_shipping", label: "Envíos" },
  ];
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface flex antialiased">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-64 bg-surface border-r border-surface-container-high p-4 gap-2">
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 py-4 mb-6">
          <span
            className="material-symbols-outlined text-secondary-fixed text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            rocket_launch
          </span>
          <span className="font-headline font-extrabold text-2xl tracking-tight text-on-surface">
            Smart Logix
          </span>
        </div>
        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "text-on-surface font-bold bg-surface-container-lowest shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                }`
              }
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              <span className="text-sm font-medium">{link.label}</span>
            </NavLink>
          ))}
        </nav>
        {/* User card */}
        <div className="mt-auto p-4 bg-surface-container-low rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant">
                person
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-on-surface truncate">
                {user?.nombre || "Usuario"}
              </p>
              <p className="text-xs text-on-surface-variant truncate">
                {user?.rol || "Sin rol"}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full mt-3 flex items-center justify-center gap-2 py-2 text-xs font-bold text-on-surface-variant hover:text-error transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Cerrar sesión
          </button>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-40 h-16 bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-between px-8 border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant">
              search
            </span>
            <input
              className="bg-transparent border-none text-sm focus:ring-0 outline-none placeholder:text-on-surface-variant"
              placeholder="Buscar..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              {user?.rol || ""}
            </span>
          </div>
        </header>
        {/* Page content */}
        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
