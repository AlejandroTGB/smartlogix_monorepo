import { useEffect, useState } from "react";
import { getEnvios, type Envio } from "../api/envios";
const estadoConfig: Record<string, { label: string; classes: string }> = {
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
export default function EnviosPage() {
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getEnvios()
      .then(setEnvios)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  const enTransito = envios.filter((e) => e.estado === "en_transito").length;
  const entregados = envios.filter((e) => e.estado === "entregado").length;
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-extrabold tracking-tight text-on-surface font-headline">
          Gestión de Envíos
        </h2>
        <p className="text-on-surface-variant text-sm">
          Seguimiento y control de entregas en tiempo real.
        </p>
      </div>
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-low p-6 rounded-xl group hover:bg-surface-container-high transition-all">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Total Envíos
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-headline text-primary">
              {envios.length}
            </span>
            <span className="text-[10px] font-bold text-on-surface-variant">
              registrados
            </span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl group hover:bg-surface-container-high transition-all">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            En Tránsito
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-headline text-secondary">
              {enTransito}
            </span>
            <span className="text-[10px] font-bold text-on-surface-variant">
              en curso
            </span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl group hover:bg-surface-container-high transition-all">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Entregados
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-headline text-secondary">
              {entregados}
            </span>
            <span className="text-[10px] font-bold text-secondary">
              completados
            </span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl group hover:bg-surface-container-high transition-all">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Pendientes
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-headline text-tertiary-fixed-dim">
              {envios.filter((e) => e.estado === "pendiente").length}
            </span>
            <span className="text-[10px] font-bold text-on-surface-variant">
              por despachar
            </span>
          </div>
        </div>
      </div>
      {/* Shipments Table */}
      <div className="bg-surface-container-lowest rounded-xl p-2">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center p-4 gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
                search
              </span>
              <input
                className="w-full pl-9 pr-4 py-2 bg-surface-container-low border-none rounded-lg text-xs focus:ring-2 focus:ring-secondary outline-none"
                placeholder="Buscar por código o destino..."
                type="text"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm">
                filter_list
              </span>
              Estado
              <span className="material-symbols-outlined text-sm">
                expand_more
              </span>
            </button>
          </div>
          <button className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-secondary text-white rounded-xl text-sm font-bold shadow-lg shadow-secondary/20 hover:opacity-90 transition-all active:scale-95 cursor-pointer">
            <span className="material-symbols-outlined text-sm">add</span>
            Nuevo Envío
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant animate-spin">
              progress_activity
            </span>
          </div>
        ) : envios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-4">
              local_shipping
            </span>
            <p className="text-lg font-bold">No hay envíos registrados</p>
            <p className="text-sm">Creá el primer envío para comenzar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-1">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-wider rounded-l-lg">
                    Código
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Destino
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Transportista
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
                {envios.map((envio) => {
                  const estado = estadoConfig[envio.estado] || {
                    label: envio.estado,
                    classes:
                      "bg-surface-container-high text-on-surface-variant",
                  };
                  return (
                    <tr
                      key={envio.id}
                      className="group hover:bg-surface-container-low transition-colors"
                    >
                      <td className="px-6 py-3 rounded-l-lg text-xs font-mono font-bold text-on-surface">
                        {envio.codigo_seguimiento}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-on-surface">
                        {envio.direccion_entrega}, {envio.comuna}
                      </td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant">
                        {envio.transportista || "Sin asignar"}
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
