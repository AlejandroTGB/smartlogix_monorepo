import { useEffect, useState } from "react";
import { getProductos, type Producto } from "../api/inventario";
export default function InventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getProductos()
      .then(setProductos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-extrabold tracking-tight text-on-surface font-headline">
          Gestión de Inventario
        </h2>
        <p className="text-on-surface-variant text-sm">
          Supervisión en tiempo real de existencias y logística de almacén.
        </p>
      </div>
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-low p-6 rounded-xl group hover:bg-surface-container-high transition-all">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Total SKUs
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-headline text-primary">
              {productos.length}
            </span>
            <span className="text-[10px] font-bold text-secondary flex items-center">
              Productos registrados
            </span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl group hover:bg-surface-container-high transition-all">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Stock Bajo
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-headline text-error">
              {productos.filter((p) => p.stock < 10).length}
            </span>
            <span className="text-[10px] font-bold text-error flex items-center">
              Revisión urgente
            </span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl group hover:bg-surface-container-high transition-all">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Valor Total
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-headline text-primary">
              $
              {productos
                .reduce((acc, p) => acc + p.precio * p.stock, 0)
                .toLocaleString("es-CL")}
            </span>
            <span className="text-[10px] font-bold text-on-surface-variant">
              CLP
            </span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl group hover:bg-surface-container-high transition-all">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Stock Total
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-headline text-primary">
              {productos.reduce((acc, p) => acc + p.stock, 0)}
            </span>
            <span className="text-[10px] font-bold text-on-surface-variant">
              Unidades
            </span>
          </div>
        </div>
      </div>
      {/* Product Table */}
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
                placeholder="Filtrar SKU..."
                type="text"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm">
                filter_list
              </span>
              Categoría
              <span className="material-symbols-outlined text-sm">
                expand_more
              </span>
            </button>
          </div>
          <button className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-secondary text-white rounded-xl text-sm font-bold shadow-lg shadow-secondary/20 hover:opacity-90 transition-all active:scale-95 cursor-pointer">
            <span className="material-symbols-outlined text-sm">add</span>
            Añadir Nuevo Producto
          </button>
        </div>
        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant animate-spin">
              progress_activity
            </span>
          </div>
        ) : productos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-4">
              inventory_2
            </span>
            <p className="text-lg font-bold">No hay productos registrados</p>
            <p className="text-sm">Agregá el primer producto para comenzar.</p>
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
                    Nombre
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Stock Disponible
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-4 py-4 text-right pr-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider rounded-r-lg">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto) => (
                  <tr
                    key={producto.id}
                    className="group hover:bg-surface-container-low transition-colors"
                  >
                    <td className="px-6 py-3 rounded-l-lg text-xs font-mono font-bold text-on-surface">
                      #{producto.id}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-on-surface">
                      {producto.nombre}
                    </td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">
                      {producto.descripcion || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold ${producto.stock < 10 ? "text-error font-extrabold" : "text-on-surface"}`}
                        >
                          {producto.stock}
                        </span>
                        {producto.stock < 10 && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-error-container text-on-error-container rounded font-bold uppercase">
                            Bajo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-on-surface">
                      ${producto.precio.toLocaleString("es-CL")}
                    </td>
                    <td className="px-4 py-3 text-right pr-6 rounded-r-lg">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                          <span className="material-symbols-outlined text-lg">
                            edit_note
                          </span>
                        </button>
                        <button className="p-1.5 text-on-surface-variant hover:text-error transition-colors cursor-pointer">
                          <span className="material-symbols-outlined text-lg">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Sync Info */}
      <div className="bg-primary-container p-6 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-surface-container-low/10 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-fixed">
              info
            </span>
          </div>
          <div>
            <h4 className="text-on-primary font-bold text-sm">
              Sincronización de Inventario Activa
            </h4>
            <p className="text-on-primary-container text-xs">
              Los datos se actualizan en tiempo real desde el servicio de
              inventario.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
