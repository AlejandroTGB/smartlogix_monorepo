import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import {
  createProducto,
  deleteProducto,
  getProductos,
  updateProducto,
  type Producto,
  type ProductoCreate,
  type ProductoUpdate,
} from "../api/inventario";
const productoInicial = {
  nombre: "",
  descripcion: "",
  precio: "",
  stock: "",
};
export default function InventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  // Crear
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [guardandoProducto, setGuardandoProducto] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState("");
  const [nuevoProducto, setNuevoProducto] = useState(productoInicial);
  // Eliminar
  const [productoParaEliminar, setProductoParaEliminar] =
    useState<Producto | null>(null);
  const [eliminandoProducto, setEliminandoProducto] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState("");
  // Editar
  const [productoParaEditar, setProductoParaEditar] = useState<Producto | null>(
    null,
  );
  const [productoEditado, setProductoEditado] = useState(productoInicial);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [errorEdicion, setErrorEdicion] = useState("");
  useEffect(() => {
    getProductos()
      .then(setProductos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  const productosFiltrados = busqueda
    ? productos.filter(
        (p) =>
          p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          (p.descripcion &&
            p.descripcion.toLowerCase().includes(busqueda.toLowerCase())),
      )
    : productos;

  // --- Crear ---
  const cerrarModalCrear = () => {
    if (guardandoProducto) return;
    setModalCrearAbierto(false);
    setNuevoProducto(productoInicial);
    setErrorFormulario("");
  };
  const actualizarCampoProducto = (
    campo: keyof typeof productoInicial,
    valor: string,
  ) => {
    setNuevoProducto((prev) => ({ ...prev, [campo]: valor }));
  };
  const guardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorFormulario("");
    const datos: ProductoCreate = {
      nombre: nuevoProducto.nombre.trim(),
      descripcion: nuevoProducto.descripcion.trim() || null,
      precio: Number(nuevoProducto.precio),
      stock: Number(nuevoProducto.stock),
    };
    if (!datos.nombre) {
      setErrorFormulario("El nombre del producto es obligatorio.");
      return;
    }
    if (datos.precio <= 0 || Number.isNaN(datos.precio)) {
      setErrorFormulario("El precio debe ser mayor a 0.");
      return;
    }
    if (datos.stock < 0 || Number.isNaN(datos.stock)) {
      setErrorFormulario("El stock no puede ser negativo.");
      return;
    }
    try {
      setGuardandoProducto(true);
      const creado = await createProducto(datos);
      setProductos((prev) => [...prev, creado]);
      cerrarModalCrear();
    } catch {
      setErrorFormulario(
        "No se pudo crear el producto. Verifica permisos o datos ingresados.",
      );
    } finally {
      setGuardandoProducto(false);
    }
  };
  // --- Eliminar ---
  const cerrarModalEliminar = () => {
    if (eliminandoProducto) return;
    setProductoParaEliminar(null);
    setErrorEliminar("");
  };
  const confirmarEliminar = async () => {
    if (!productoParaEliminar) return;
    try {
      setEliminandoProducto(true);
      setErrorEliminar("");
      await deleteProducto(productoParaEliminar.id);
      setProductos((prev) =>
        prev.filter((p) => p.id !== productoParaEliminar.id),
      );
      cerrarModalEliminar();
    } catch {
      setErrorEliminar(
        "No se pudo eliminar el producto. Verifica permisos o intenta nuevamente.",
      );
    } finally {
      setEliminandoProducto(false);
    }
  };
  // --- Editar ---
  const abrirModalEditar = (producto: Producto) => {
    setProductoParaEditar(producto);
    setProductoEditado({
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      precio: String(producto.precio),
      stock: String(producto.stock),
    });
    setErrorEdicion("");
  };
  const cerrarModalEditar = () => {
    if (guardandoEdicion) return;
    setProductoParaEditar(null);
    setProductoEditado(productoInicial);
    setErrorEdicion("");
  };
  const actualizarCampoEdicion = (
    campo: keyof typeof productoInicial,
    valor: string,
  ) => {
    setProductoEditado((prev) => ({ ...prev, [campo]: valor }));
  };
  const guardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoParaEditar) return;
    setErrorEdicion("");
    const datos: ProductoUpdate = {
      nombre: productoEditado.nombre.trim(),
      descripcion: productoEditado.descripcion.trim() || null,
      precio: Number(productoEditado.precio),
      stock: Number(productoEditado.stock),
    };
    if (!datos.nombre) {
      setErrorEdicion("El nombre del producto es obligatorio.");
      return;
    }
    if (datos.precio <= 0 || Number.isNaN(datos.precio)) {
      setErrorEdicion("El precio debe ser mayor a 0.");
      return;
    }
    if (datos.stock < 0 || Number.isNaN(datos.stock)) {
      setErrorEdicion("El stock no puede ser negativo.");
      return;
    }
    try {
      setGuardandoEdicion(true);
      const actualizado = await updateProducto(productoParaEditar.id, datos);
      setProductos((prev) =>
        prev.map((p) => (p.id === actualizado.id ? actualizado : p)),
      );
      cerrarModalEditar();
    } catch {
      setErrorEdicion(
        "No se pudo editar el producto. Verifica permisos o datos ingresados.",
      );
    } finally {
      setGuardandoEdicion(false);
    }
  };
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
        <div className="flex flex-col md:flex-row justify-between items-center p-4 gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
                search
              </span>
              <input
                className="w-full pl-9 pr-4 py-2 bg-surface-container-low border-none rounded-lg text-xs focus:ring-2 focus:ring-secondary outline-none"
                placeholder="Buscar por nombre..."
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
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
          <button
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-secondary text-white rounded-xl text-sm font-bold shadow-lg shadow-secondary/20 hover:opacity-90 transition-all active:scale-95 cursor-pointer"
            onClick={() => setModalCrearAbierto(true)}
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Añadir Nuevo Producto
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant animate-spin">
              progress_activity
            </span>
          </div>
        ) : productosFiltrados.length === 0 ? (
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
                    Stock
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
                {productosFiltrados.map((producto) => (
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
                        <button
                          className="p-1.5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                          onClick={() => abrirModalEditar(producto)}
                        >
                          <span className="material-symbols-outlined text-lg">
                            edit_note
                          </span>
                        </button>
                        <button
                          className="p-1.5 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                          onClick={() => {
                            setProductoParaEliminar(producto);
                            setErrorEliminar("");
                          }}
                        >
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
      {/* Modal Crear */}
      <Modal
        open={modalCrearAbierto}
        onClose={cerrarModalCrear}
        title="Añadir nuevo producto"
        subtitle="Registra un producto para mantener actualizado el inventario."
      >
        <form className="space-y-5 px-6 py-6" onSubmit={guardarProducto}>
          <div className="space-y-2">
            <label
              className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"
              htmlFor="producto-nombre"
            >
              Nombre
            </label>
            <input
              className="w-full rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-secondary"
              id="producto-nombre"
              maxLength={100}
              minLength={2}
              onChange={(e) =>
                actualizarCampoProducto("nombre", e.target.value)
              }
              placeholder="Ej: Teclado mecánico"
              required
              type="text"
              value={nuevoProducto.nombre}
            />
          </div>
          <div className="space-y-2">
            <label
              className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"
              htmlFor="producto-descripcion"
            >
              Descripción
            </label>
            <textarea
              className="min-h-24 w-full resize-none rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-secondary"
              id="producto-descripcion"
              onChange={(e) =>
                actualizarCampoProducto("descripcion", e.target.value)
              }
              placeholder="Detalle breve del producto"
              value={nuevoProducto.descripcion}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"
                htmlFor="producto-precio"
              >
                Precio
              </label>
              <input
                className="w-full rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-secondary"
                id="producto-precio"
                min="1"
                onChange={(e) =>
                  actualizarCampoProducto("precio", e.target.value)
                }
                placeholder="0"
                required
                type="number"
                value={nuevoProducto.precio}
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"
                htmlFor="producto-stock"
              >
                Stock inicial
              </label>
              <input
                className="w-full rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-secondary"
                id="producto-stock"
                min="0"
                onChange={(e) =>
                  actualizarCampoProducto("stock", e.target.value)
                }
                placeholder="0"
                required
                type="number"
                value={nuevoProducto.stock}
              />
            </div>
          </div>
          {errorFormulario && (
            <div className="rounded-lg bg-error-container px-4 py-3 text-xs font-semibold text-on-error-container">
              {errorFormulario}
            </div>
          )}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              className="rounded-lg px-5 py-2.5 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
              disabled={guardandoProducto}
              onClick={cerrarModalCrear}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="flex items-center justify-center gap-2 rounded-lg bg-secondary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-secondary/20 transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={guardandoProducto}
              type="submit"
            >
              {guardandoProducto ? (
                <span className="material-symbols-outlined text-lg animate-spin">
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined text-lg">add</span>
              )}
              Guardar producto
            </button>
          </div>
        </form>
      </Modal>
      {/* Modal Editar */}
      <Modal
        open={!!productoParaEditar}
        onClose={cerrarModalEditar}
        title="Editar producto"
        subtitle="Actualiza los datos del producto seleccionado."
      >
        <form className="space-y-5 px-6 py-6" onSubmit={guardarEdicion}>
          <div className="space-y-2">
            <label
              className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"
              htmlFor="producto-editar-nombre"
            >
              Nombre
            </label>
            <input
              className="w-full rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-secondary"
              id="producto-editar-nombre"
              maxLength={100}
              minLength={2}
              onChange={(e) => actualizarCampoEdicion("nombre", e.target.value)}
              placeholder="Ej: Teclado mecánico"
              required
              type="text"
              value={productoEditado.nombre}
            />
          </div>
          <div className="space-y-2">
            <label
              className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"
              htmlFor="producto-editar-descripcion"
            >
              Descripción
            </label>
            <textarea
              className="min-h-24 w-full resize-none rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-secondary"
              id="producto-editar-descripcion"
              onChange={(e) =>
                actualizarCampoEdicion("descripcion", e.target.value)
              }
              placeholder="Detalle breve del producto"
              value={productoEditado.descripcion}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"
                htmlFor="producto-editar-precio"
              >
                Precio
              </label>
              <input
                className="w-full rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-secondary"
                id="producto-editar-precio"
                min="1"
                onChange={(e) =>
                  actualizarCampoEdicion("precio", e.target.value)
                }
                placeholder="0"
                required
                type="number"
                value={productoEditado.precio}
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"
                htmlFor="producto-editar-stock"
              >
                Stock
              </label>
              <input
                className="w-full rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-secondary"
                id="producto-editar-stock"
                min="0"
                onChange={(e) =>
                  actualizarCampoEdicion("stock", e.target.value)
                }
                placeholder="0"
                required
                type="number"
                value={productoEditado.stock}
              />
            </div>
          </div>
          {errorEdicion && (
            <div className="rounded-lg bg-error-container px-4 py-3 text-xs font-semibold text-on-error-container">
              {errorEdicion}
            </div>
          )}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              className="rounded-lg px-5 py-2.5 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
              disabled={guardandoEdicion}
              onClick={cerrarModalEditar}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="flex items-center justify-center gap-2 rounded-lg bg-secondary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-secondary/20 transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={guardandoEdicion}
              type="submit"
            >
              {guardandoEdicion ? (
                <span className="material-symbols-outlined text-lg animate-spin">
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined text-lg">
                  edit_note
                </span>
              )}
              Guardar cambios
            </button>
          </div>
        </form>
      </Modal>
      {/* Modal Eliminar */}
      <Modal
        open={!!productoParaEliminar}
        onClose={cerrarModalEliminar}
        title="Eliminar producto"
      >
        <div className="px-6 py-6">
          <div className="flex items-start gap-4 mb-2">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-error-container">
              <span className="material-symbols-outlined text-xl text-on-error-container">
                delete
              </span>
            </div>
            <p className="text-sm text-on-surface-variant leading-6 pt-2">
              ¿Seguro que quieres eliminar{" "}
              <span className="font-bold text-on-surface">
                {productoParaEliminar?.nombre}
              </span>
              ? Esta acción no se puede deshacer.
            </p>
          </div>
          {errorEliminar && (
            <div className="mt-4 rounded-lg bg-error-container px-4 py-3 text-xs font-semibold text-on-error-container">
              {errorEliminar}
            </div>
          )}
          <div className="flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:justify-end">
            <button
              className="rounded-lg px-5 py-2.5 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
              disabled={eliminandoProducto}
              onClick={cerrarModalEliminar}
              type="button"
            >
              No, cancelar
            </button>
            <button
              className="flex items-center justify-center gap-2 rounded-lg bg-error px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-error/20 transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={eliminandoProducto}
              onClick={confirmarEliminar}
              type="button"
            >
              {eliminandoProducto ? (
                <span className="material-symbols-outlined text-lg animate-spin">
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined text-lg">
                  delete
                </span>
              )}
              Sí, eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
