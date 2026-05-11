export default function InventarioPage() {
  const products = [
    {
      sku: "SL-X942-A",
      name: "SmartHub Terminal Gen 2",
      category: "Electrónica / IoT",
      stock: 420,
      stockPercent: 70,
      price: "€249.00",
      lowStock: false,
    },
    {
      sku: "SL-B102-L",
      name: "Sensor Precision L3",
      category: "Sensores / Óptica",
      stock: 8,
      stockPercent: 15,
      price: "€89.50",
      lowStock: true,
    },
    {
      sku: "SL-W450-Z",
      name: "Brazo Articulado Alpha",
      category: "Robótica / Mecánica",
      stock: 156,
      stockPercent: 45,
      price: "€1,120.00",
      lowStock: false,
    },
    {
      sku: "SL-K221-M",
      name: "Controlador Térmico Pro",
      category: "Energía",
      stock: 32,
      stockPercent: 25,
      price: "€412.00",
      lowStock: false,
    },
  ];
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
              1.284
            </span>
            <span className="text-[10px] font-bold text-secondary flex items-center">
              +12 este mes
            </span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl group hover:bg-surface-container-high transition-all">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Stock Bajo
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-headline text-error">
              18
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
              €4.2M
            </span>
            <span className="text-[10px] font-bold text-on-surface-variant">
              EUR
            </span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl group hover:bg-surface-container-high transition-all">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Capacidad
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-headline text-primary">
              82%
            </span>
            <div className="flex-1 h-1.5 bg-outline-variant/30 rounded-full ml-4 overflow-hidden">
              <div className="bg-primary h-full w-[82%]" />
            </div>
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
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-1">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="w-12 py-4 pl-6 text-left rounded-l-lg">
                  <input
                    className="w-4 h-4 rounded border-outline-variant"
                    type="checkbox"
                  />
                </th>
                <th className="px-4 py-4 text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-4 py-4 text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Nombre del Producto
                </th>
                <th className="px-4 py-4 text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-4 py-4 text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Stock Disponible
                </th>
                <th className="px-4 py-4 text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Precio Unitario
                </th>
                <th className="px-4 py-4 text-right pr-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider rounded-r-lg">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.sku}
                  className="group hover:bg-surface-container-low transition-colors"
                >
                  <td className="py-3 pl-6 rounded-l-lg">
                    <input
                      className="w-4 h-4 rounded border-outline-variant"
                      type="checkbox"
                    />
                  </td>
                  <td className="px-4 py-3 text-xs font-mono font-bold text-on-surface">
                    {product.sku}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-on-surface">
                    {product.name}
                  </td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">
                    {product.category}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold ${product.lowStock ? "text-error font-extrabold" : "text-on-surface"}`}
                      >
                        {product.stock}
                      </span>
                      <div className="w-16 h-1 bg-outline-variant/20 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${product.lowStock ? "bg-error" : "bg-secondary"}`}
                          style={{ width: `${product.stockPercent}%` }}
                        />
                      </div>
                      {product.lowStock && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-error-container text-on-error-container rounded font-bold uppercase">
                          Bajo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-on-surface">
                    {product.price}
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
        {/* Pagination */}
        <div className="flex items-center justify-between p-6 border-t border-surface-container-high/10">
          <p className="text-xs text-on-surface-variant font-medium">
            Mostrando <span className="font-bold text-on-surface">1 - 4</span>{" "}
            de <span className="font-bold text-on-surface">1,284</span>{" "}
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
                321
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
              La última sincronización con el almacén central fue hace 3
              minutos.
            </p>
          </div>
        </div>
        <button className="text-xs font-bold text-on-primary bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-all border border-white/10 cursor-pointer">
          Ver Historial de Cambios
        </button>
      </div>
    </div>
  );
}
