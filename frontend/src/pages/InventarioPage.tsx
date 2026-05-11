import { useEffect, useState, type FormEvent } from "react";
import {
  createProducto,
  deleteProducto,
  getProductos,
  type Producto,
  type ProductoCreate,
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
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [guardandoProducto, setGuardandoProducto] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState("");
  const [nuevoProducto, setNuevoProducto] = useState(productoInicial);
  const [productoParaEliminar, setProductoParaEliminar] =
    useState<Producto | null>(null);
  const [eliminandoProducto, setEliminandoProducto] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState("");

  useEffect(() => {
    getProductos()
      .then(setProductos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
    setNuevoProducto((producto) => ({
      ...producto,
      [campo]: valor,
    }));
  };

  const guardarProducto = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorFormulario("");

    const productoParaCrear: ProductoCreate = {
      nombre: nuevoProducto.nombre.trim(),
      descripcion: nuevoProducto.descripcion.trim() || null,
      precio: Number(nuevoProducto.precio),
      stock: Number(nuevoProducto.stock),
    };

    if (!productoParaCrear.nombre) {
      setErrorFormulario("El nombre del producto es obligatorio.");
      return;
    }

    if (productoParaCrear.precio <= 0 || Number.isNaN(productoParaCrear.precio)) {
      setErrorFormulario("El precio debe ser mayor a 0.");
      return;
    }

    if (productoParaCrear.stock < 0 || Number.isNaN(productoParaCrear.stock)) {
      setErrorFormulario("El stock no puede ser negativo.");
      return;
    }

    try {
      setGuardandoProducto(true);
      const productoCreado = await createProducto(productoParaCrear);
      setProductos((productosActuales) => [...productosActuales, productoCreado]);
      cerrarModalCrear();
    } catch (error) {
      console.error(error);
      setErrorFormulario(
        "No se pudo crear el producto. Verifica permisos o datos ingresados.",
      );
    } finally {
      setGuardandoProducto(false);
    }
  };

  const cerrarModalEliminar = () => {
    if (eliminandoProducto) return;
    setProductoParaEliminar(null);
    setErrorEliminar("");
  };

  const confirmarEliminarProducto = async () => {
    if (!productoParaEliminar) return;

    try {
      setEliminandoProducto(true);
      setErrorEliminar("");
      await deleteProducto(productoParaEliminar.id);
      setProductos((productosActuales) =>
        productosActuales.filter(
          (producto) => producto.id !== productoParaEliminar.id,
        ),
      );
      cerrarModalEliminar();
    } catch (error) {
      console.error(error);
      setErrorEliminar(
        "No se pudo eliminar el producto. Verifica permisos o intenta nuevamente.",
      );
    } finally {
      setEliminandoProducto(false);
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
          <button
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-secondary text-white rounded-xl text-sm font-bold shadow-lg shadow-secondary/20 hover:opacity-90 transition-all active:scale-95 cursor-pointer"
            onClick={() => setModalCrearAbierto(true)}
            type="button"
          >
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
                        <button
                          className="p-1.5 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                          onClick={() => {
                            setProductoParaEliminar(producto);
                            setErrorEliminar("");
                          }}
                          type="button"
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
      {modalCrearAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8 backdrop-blur-[2px]">
          <div className="w-full max-w-lg rounded-xl bg-surface-container-lowest shadow-2xl shadow-black/20">
            <div className="flex items-start justify-between gap-4 border-b border-outline-variant px-6 py-5">
              <div>
                <h3 className="font-headline text-lg font-extrabold text-on-surface">
                  Añadir nuevo producto
                </h3>
                <p className="mt-1 text-xs text-on-surface-variant">
                  Registra un producto para mantener actualizado el inventario.
                </p>
              </div>
              <button
                aria-label="Cerrar modal"
                className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
                onClick={cerrarModalCrear}
                type="button"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

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
                  onChange={(event) =>
                    actualizarCampoProducto("nombre", event.target.value)
                  }
                  placeholder="Ej: Teclado mecanico"
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
                  Descripcion
                </label>
                <textarea
                  className="min-h-24 w-full resize-none rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-secondary"
                  id="producto-descripcion"
                  onChange={(event) =>
                    actualizarCampoProducto("descripcion", event.target.value)
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
                    onChange={(event) =>
                      actualizarCampoProducto("precio", event.target.value)
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
                    onChange={(event) =>
                      actualizarCampoProducto("stock", event.target.value)
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
          </div>
        </div>
      )}
      {productoParaEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-xl bg-surface-container-lowest shadow-2xl shadow-black/20">
            <div className="flex items-start justify-between gap-4 px-6 py-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-error-container text-on-error-container">
                  <span className="material-symbols-outlined text-xl">
                    delete
                  </span>
                </div>
                <div>
                  <h3 className="font-headline text-lg font-extrabold text-on-surface">
                    Eliminar producto
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                    ¿Seguro que quieres eliminar{" "}
                    <span className="font-bold text-on-surface">
                      {productoParaEliminar.nombre}
                    </span>
                    ?
                  </p>
                </div>
              </div>
              <button
                aria-label="Cerrar modal"
                className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
                onClick={cerrarModalEliminar}
                type="button"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {errorEliminar && (
              <div className="mx-6 rounded-lg bg-error-container px-4 py-3 text-xs font-semibold text-on-error-container">
                {errorEliminar}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 px-6 pb-6 pt-5 sm:flex-row sm:justify-end">
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
                onClick={confirmarEliminarProducto}
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
        </div>
      )}
    </div>
  );
}
