import { useEffect, useState } from "react";
import { getEnvios, type Envio } from "../api/envios";
import { getPedidos, type Pedido } from "../api/pedidos";
import { useAuthStore } from "../stores/authStore";
const estadoEnvioConfig: Record<string, { label: string; classes: string }> = {
  pendiente: {
    label: "Pendiente",
    classes: "bg-tertiary-fixed text-on-tertiary-container",
  },
  preparando: { label: "Preparando", classes: "bg-blue-100 text-blue-700" },
  despachado: {
    label: "Despachado",
    classes: "bg-surface-container-high text-on-surface",
  },
  en_transito: {
    label: "En Tránsito",
    classes: "bg-secondary-container text-on-secondary-container",
  },
  entregado: {
    label: "Entregado",
    classes: "bg-secondary-container text-on-secondary-container",
  },
  cancelado: {
    label: "Cancelado",
    classes: "bg-error-container text-on-error-container",
  },
};
export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([getEnvios(), getPedidos()])
      .then(([enviosData, pedidosData]) => {
        setEnvios(enviosData);
        setPedidos(pedidosData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  const enviosTransito = envios.filter(
    (e) => e.estado === "en_transito",
  ).length;
  const pedidosPendientes = pedidos.filter(
    (p) => p.estado === "pendiente",
  ).length;
  const totalProductos = pedidos.reduce(
    (acc, p) => acc + p.productos.length,
    0,
  );
  const quickLinks = [
    {
      icon: "dashboard_customize",
      title: "Ir al Panel de Control",
      desc: "Vista detallada de KPIs globales",
      to: "/dashboard",
    },
    {
      icon: "local_shipping",
      title: "Gestionar Envíos",
      desc: "Seguimiento y creación de guías",
      to: "/envios",
    },
    {
      icon: "assignment",
      title: "Revisar Pedidos",
      desc: "Órdenes pendientes de validación",
      to: "/pedidos",
    },
    {
      icon: "inventory",
      title: "Catálogo de Inventario",
      desc: "Control de existencias y SKUs",
      to: "/inventario",
    },
  ];
  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <section className="flex flex-col gap-2">
        <h2 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">
          Bienvenido, {user?.nombre || "Admin"}
        </h2>
        <p className="text-on-surface-variant font-medium">
          Aquí tienes el resumen de operaciones de hoy.
        </p>
      </section>
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant animate-spin">
            progress_activity
          </span>
        </div>
      ) : (
        <>
          {/* Summary Widgets */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <span className="material-symbols-outlined">
                    local_shipping
                  </span>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  {enviosTransito} en tránsito
                </span>
              </div>
              <p className="text-4xl font-extrabold font-headline text-on-surface mb-1">
                {envios.length}
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Envíos Totales
              </p>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <span className="material-symbols-outlined">
                    pending_actions
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-error">
                  {pedidosPendientes > 0 ? "Atención" : "Sin pendientes"}
                </span>
              </div>
              <p className="text-4xl font-extrabold font-headline text-on-surface mb-1">
                {pedidosPendientes}
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Pedidos Pendientes
              </p>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <span className="material-symbols-outlined">inventory_2</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  Productos
                </span>
              </div>
              <p className="text-4xl font-extrabold font-headline text-on-surface mb-1">
                {totalProductos}
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Unidades en Pedidos
              </p>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <span className="material-symbols-outlined">
                    check_circle
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  Completados
                </span>
              </div>
              <p className="text-4xl font-extrabold font-headline text-on-surface mb-1">
                {envios.filter((e) => e.estado === "entregado").length}
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Envíos Entregados
              </p>
            </div>
          </section>
          {/* Quick Access & Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold font-headline text-on-surface">
                  Accesos Rápidos
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickLinks.map((link) => (
                  <a
                    key={link.to}
                    href={link.to}
                    className="flex items-center gap-4 p-5 bg-surface-container-lowest rounded-xl hover:bg-surface-container-low transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant group-hover:bg-secondary group-hover:text-white transition-all">
                      <span className="material-symbols-outlined">
                        {link.icon}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface">
                        {link.title}
                      </h4>
                      <p className="text-xs text-on-surface-variant">
                        {link.desc}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            {/* Predictive Logic Card (visual placeholder) */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold font-headline text-on-surface">
                Lógica Predictiva
              </h3>
              <div className="bg-secondary-container p-6 rounded-xl relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-on-secondary-container">
                      auto_awesome
                    </span>
                    <p className="text-[10px] font-extrabold tracking-widest uppercase text-on-secondary-container">
                      Estado de la Red
                    </p>
                  </div>
                  <p className="text-2xl font-extrabold text-on-secondary-container mb-2">
                    Panel Predictivo
                  </p>
                  <p className="text-sm text-on-secondary-container/80 mb-6 leading-relaxed">
                    Las métricas predictivas estarán disponibles cuando se
                    integre el módulo de analítica avanzada.
                  </p>
                  <button
                    className="w-full py-3 bg-on-secondary-container text-white rounded-lg font-bold text-sm shadow-lg shadow-emerald-900/20 active:scale-95 transition-transform cursor-pointer opacity-50"
                    disabled
                  >
                    Próximamente
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Recent Shipments Table */}
          {envios.length > 0 && (
            <section className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
              <div className="p-6 flex justify-between items-center">
                <h3 className="text-xl font-bold font-headline text-on-surface">
                  Envíos Recientes
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-high">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-extrabold text-on-primary-container uppercase tracking-widest">
                        Código
                      </th>
                      <th className="px-6 py-4 text-[10px] font-extrabold text-on-primary-container uppercase tracking-widest">
                        Destino
                      </th>
                      <th className="px-6 py-4 text-[10px] font-extrabold text-on-primary-container uppercase tracking-widest">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-[10px] font-extrabold text-on-primary-container uppercase tracking-widest">
                        Transportista
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {envios.slice(0, 5).map((envio) => {
                      const estado = estadoEnvioConfig[envio.estado] || {
                        label: envio.estado,
                        classes:
                          "bg-surface-container-high text-on-surface-variant",
                      };
                      return (
                        <tr
                          key={envio.id}
                          className="hover:bg-surface-container-low transition-colors"
                        >
                          <td className="px-6 py-4 font-bold text-sm">
                            {envio.codigo_seguimiento}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            {envio.ciudad}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 text-[10px] font-extrabold rounded-full uppercase ${estado.classes}`}
                            >
                              {estado.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {envio.transportista || "Sin asignar"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
