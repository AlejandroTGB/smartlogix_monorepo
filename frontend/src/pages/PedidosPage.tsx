import { useEffect, useState } from "react";
import { getPedidos, type Pedido } from "../api/pedidos";
const estadoConfig: Record<string, { label: string; classes: string }> = {
  pendiente: {
    label: "Pendiente",
    classes: "bg-tertiary-fixed text-on-tertiary-container",
  },
  preparando: { label: "Preparando", classes: "bg-blue-100 text-blue-700" },
  enviado: {
    label: "Enviado",
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
export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getPedidos()
      .then(setPedidos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  const totalProductos = pedidos.reduce(
    (acc, p) => acc + p.productos.length,
    0,
  );
  const pendientes = pedidos.filter((p) => p.estado === "pendiente").length;
  const entregados = pedidos.filter((p) => p.estado === "entregado").length;
  const tasaEntrega =
    pedidos.length > 0 ? Math.round((entregados / pedidos.length) * 100) : 0;
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-extrabold tracking-tight text-on-surface font-headline">
          Gestión de Pedidos
        </h2>
        <p className="text-on-surface-variant text-sm">
          Seguimiento y control de órdenes en el sistema.
        </p>
      </div>
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-low p-6 rounded-xl group hover:bg-surface-container-high transition-all">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Total Pedidos
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-headline text-primary">
              {pedidos.length}
            </span>
            <span className="text-[10px] font-bold text-on-surface-variant">
              en el sistema
            </span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl group hover:bg-surface-container-high transition-all">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Pendientes
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-headline text-tertiary-fixed-dim">
              {pendientes}
            </span>
            {pendientes > 0 && (
              <span className="text-[10px] font-bold text-error">
                Requieren atención
              </span>
            )}
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl group hover:bg-surface-container-high transition-all">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Productos Totales
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-headline text-primary">
              {totalProductos}
            </span>
            <span className="text-[10px] font-bold text-on-surface-variant">
              unidades pedidas
            </span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl group hover:bg-surface-container-high transition-all">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Tasa Entrega
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-headline text-secondary">
              {tasaEntrega}%
            </span>
            <span className="text-[10px] font-bold text-secondary">
              completados
            </span>
          </div>
        </div>
      </div>
      {/* Orders Table */}
      <div className="bg-surface-container-lowest rounded-xl p-2">
        <div className="flex flex-col md:flex-row justify-between items-center p-4 gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
                search
              </span>
              <input
                className="w-full pl-9 pr-4 py-2 bg-surface-container-low border-none rounded-lg text-xs focus:ring-2 focus:ring-secondary outline-none"
                placeholder="Buscar pedido..."
                type="text"
              />
            </div>
          </div>
          <button className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-secondary text-white rounded-xl text-sm font-bold shadow-lg shadow-secondary/20 hover:opacity-90 transition-all active:scale-95 cursor-pointer">
            <span className="material-symbols-outlined text-sm">add</span>
            Nuevo Pedido
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant animate-spin">
              progress_activity
            </span>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-4">
              shopping_cart
            </span>
            <p className="text-lg font-bold">No hay pedidos registrados</p>
            <p className="text-sm">Creá el primer pedido para comenzar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-1">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-wider rounded-l-lg">
                    ID
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Productos
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-4 text-right pr-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider rounded-r-lg">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => {
                  const estado = estadoConfig[pedido.estado] || {
                    label: pedido.estado,
                    classes:
                      "bg-surface-container-high text-on-surface-variant",
                  };
                  return (
                    <tr
                      key={pedido.id}
                      className="group hover:bg-surface-container-low transition-colors"
                    >
                      <td className="px-6 py-3 rounded-l-lg text-xs font-mono font-bold text-on-surface">
                        #{pedido.id.toString().padStart(4, "0")}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-on-surface">
                        Cliente #{pedido.cliente_id}
                      </td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant">
                        {pedido.productos.length}{" "}
                        {pedido.productos.length === 1
                          ? "producto"
                          : "productos"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 text-[10px] font-extrabold rounded-full uppercase ${estado.classes}`}
                        >
                          {estado.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right pr-6 rounded-r-lg">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-lg">
                              visibility
                            </span>
                          </button>
                          <button className="p-1.5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-lg">
                              edit_note
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
