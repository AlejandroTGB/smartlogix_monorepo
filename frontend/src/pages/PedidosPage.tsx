export default function PedidosPage() {
  const pedidos = [
    {
      id: 1,
      cliente: "Alejandro Ruiz",
      productos: 3,
      estado: "pendiente",
      fecha: "12 Oct, 2023",
    },
    {
      id: 2,
      cliente: "María González",
      productos: 1,
      estado: "preparando",
      fecha: "11 Oct, 2023",
    },
    {
      id: 3,
      cliente: "Carlos Mendez",
      productos: 5,
      estado: "enviado",
      fecha: "10 Oct, 2023",
    },
    {
      id: 4,
      cliente: "Laura Torres",
      productos: 2,
      estado: "entregado",
      fecha: "09 Oct, 2023",
    },
    {
      id: 5,
      cliente: "Pedro Sánchez",
      productos: 1,
      estado: "cancelado",
      fecha: "08 Oct, 2023",
    },
  ];
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
              2,847
            </span>
            <span className="text-[10px] font-bold text-secondary flex items-center">
              +8%
            </span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl group hover:bg-surface-container-high transition-all">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Pendientes
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-headline text-tertiary-fixed-dim">
              452
            </span>
            <span className="text-[10px] font-bold text-error flex items-center">
              Requieren atención
            </span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl group hover:bg-surface-container-high transition-all">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            En Proceso
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-headline text-primary">
              1,203
            </span>
            <span className="text-[10px] font-bold text-on-surface-variant">
              Preparando + Enviados
            </span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl group hover:bg-surface-container-high transition-all">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Tasa Entrega
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-headline text-secondary">
              96.4%
            </span>
            <span className="text-[10px] font-bold text-secondary">
              Este mes
            </span>
          </div>
        </div>
      </div>
      {/* Orders Table */}
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
                placeholder="Buscar pedido..."
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
            Nuevo Pedido
          </button>
        </div>
        {/* Table */}
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
                <th className="px-4 py-4 text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-4 py-4 text-right pr-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider rounded-r-lg">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => {
                const estado = estadoConfig[pedido.estado];
                return (
                  <tr
                    key={pedido.id}
                    className="group hover:bg-surface-container-low transition-colors"
                  >
                    <td className="px-6 py-3 rounded-l-lg text-xs font-mono font-bold text-on-surface">
                      #{pedido.id.toString().padStart(4, "0")}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-on-surface">
                      {pedido.cliente}
                    </td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">
                      {pedido.productos}{" "}
                      {pedido.productos === 1 ? "producto" : "productos"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 text-[10px] font-extrabold rounded-full uppercase ${estado?.classes}`}
                      >
                        {estado?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">
                      {pedido.fecha}
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
        {/* Pagination */}
        <div className="flex items-center justify-between p-6 border-t border-surface-container-high/10">
          <p className="text-xs text-on-surface-variant font-medium">
            Mostrando <span className="font-bold text-on-surface">1 - 5</span>{" "}
            de <span className="font-bold text-on-surface">2,847</span>{" "}
            resultados
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-surface-container-low rounded-lg text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm">
                chevron_left
              </span>
            </button>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center text-xs font-bold bg-primary text-white rounded-lg cursor-pointer">
                1
              </button>
              <button className="w-8 h-8 flex items-center justify-center text-xs font-bold text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer">
                2
              </button>
              <button className="w-8 h-8 flex items-center justify-center text-xs font-bold text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer">
                3
              </button>
              <span className="px-2 text-xs text-on-surface-variant">...</span>
              <button className="w-8 h-8 flex items-center justify-center text-xs font-bold text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer">
                142
              </button>
            </div>
            <button className="p-2 bg-surface-container-low rounded-lg text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
