import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import {
  getPedidos,
  getPedido,
  createPedido,
  updatePedidoEstado,
  deletePedido,
  type Pedido,
  type PedidoCreate,
} from "../api/pedidos";

const estadoConfig: Record<string, { label: string; classes: string }> = {
  pendiente_stock: {
    label: "Verificando Stock",
    classes: "bg-tertiary-fixed text-on-tertiary-container animate-pulse",
  },
  confirmado: {
    label: "Confirmado",
    classes: "bg-secondary-container text-on-secondary-container",
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

const estadosPermitidos = [
  "pendiente_stock",
  "confirmado",
  "preparando",
  "enviado",
  "entregado",
  "cancelado",
];

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  // Crear
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorCrear, setErrorCrear] = useState("");
  const [nuevoClienteId, setNuevoClienteId] = useState("");
  const [nuevoProductoId, setNuevoProductoId] = useState("");
  const [nuevoCantidad, setNuevoCantidad] = useState("");
  const [nuevoDireccion, setNuevoDireccion] = useState("");
  const [nuevoComuna, setNuevoComuna] = useState("");
  const [nuevoCiudad, setNuevoCiudad] = useState("");
  // Estado
  const [pedidoEditarEstado, setPedidoEditarEstado] = useState<Pedido | null>(
    null,
  );
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [guardandoEstado, setGuardandoEstado] = useState(false);
  const [errorEstado, setErrorEstado] = useState("");
  // Eliminar
  const [pedidoParaEliminar, setPedidoParaEliminar] = useState<Pedido | null>(
    null,
  );
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState("");

  useEffect(() => {
    getPedidos()
      .then(setPedidos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Polling: consultar pedidos en pendiente_stock cada 2 segundos
  useEffect(() => {
    const pendientes = pedidos.filter((p) => p.estado === "pendiente_stock");
    if (pendientes.length === 0) return;

    const intervalo = setInterval(async () => {
      const actualizados = await Promise.all(
        pendientes.map((p) => getPedido(p.id)),
      );
      setPedidos((prev) =>
        prev.map((p) => {
          const actualizado = actualizados.find((a) => a.id === p.id);
          return actualizado ? actualizado : p;
        }),
      );
    }, 2000);

    return () => clearInterval(intervalo);
  }, [pedidos]);

  const totalProductos = pedidos.reduce(
    (acc, p) => acc + p.productos.length,
    0,
  );
  const pendientes = pedidos.filter(
    (p) => p.estado === "pendiente_stock",
  ).length;
  const entregados = pedidos.filter((p) => p.estado === "entregado").length;
  const tasaEntrega =
    pedidos.length > 0 ? Math.round((entregados / pedidos.length) * 100) : 0;

  const pedidosFiltrados = busqueda
    ? pedidos.filter(
        (p) =>
          `#${p.id.toString().padStart(4, "0")}`.includes(busqueda) ||
          `Cliente #${p.cliente_id}`
            .toLowerCase()
            .includes(busqueda.toLowerCase()) ||
          p.estado.toLowerCase().includes(busqueda.toLowerCase()),
      )
    : pedidos;

  // Crear pedido
  const cerrarModalCrear = () => {
    if (guardando) return;
    setModalCrearAbierto(false);
    setNuevoClienteId("");
    setNuevoProductoId("");
    setNuevoCantidad("");
    setNuevoDireccion("");
    setNuevoComuna("");
    setNuevoCiudad("");
    setErrorCrear("");
  };

  const guardarPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCrear("");
    const datos: PedidoCreate = {
      cliente_id: Number(nuevoClienteId),
      productos: [
        {
          producto_id: Number(nuevoProductoId),
          cantidad: Number(nuevoCantidad),
        },
      ],
      direccion_entrega: nuevoDireccion,
      comuna: nuevoComuna,
      ciudad: nuevoCiudad,
    };
    if (!datos.cliente_id || Number.isNaN(datos.cliente_id)) {
      setErrorCrear("El ID del cliente es obligatorio.");
      return;
    }
    if (
      !datos.productos[0].producto_id ||
      Number.isNaN(datos.productos[0].producto_id)
    ) {
      setErrorCrear("El ID del producto es obligatorio.");
      return;
    }
    if (
      !datos.productos[0].cantidad ||
      Number.isNaN(datos.productos[0].cantidad) ||
      datos.productos[0].cantidad <= 0
    ) {
      setErrorCrear("La cantidad debe ser mayor a 0.");
      return;
    }
    if (!datos.direccion_entrega || datos.direccion_entrega.length < 5) {
      setErrorCrear(
        "La dirección de entrega es obligatoria (mínimo 5 caracteres).",
      );
      return;
    }
    if (!datos.comuna || datos.comuna.length < 2) {
      setErrorCrear("La comuna es obligatoria.");
      return;
    }
    if (!datos.ciudad || datos.ciudad.length < 2) {
      setErrorCrear("La ciudad es obligatoria.");
      return;
    }
    try {
      setGuardando(true);
      const creado = await createPedido(datos);
      setPedidos((prev) => [...prev, creado]);
      cerrarModalCrear();
    } catch {
      setErrorCrear("No se pudo crear el pedido. Verifica permisos o datos.");
    } finally {
      setGuardando(false);
    }
  };

  // Cambiar estado
  const guardarEstado = async () => {
    if (!pedidoEditarEstado || !nuevoEstado) return;
    setErrorEstado("");
    try {
      setGuardandoEstado(true);
      const actualizado = await updatePedidoEstado(pedidoEditarEstado.id, {
        estado: nuevoEstado,
      });
      setPedidos((prev) =>
        prev.map((p) => (p.id === actualizado.id ? actualizado : p)),
      );
      setPedidoEditarEstado(null);
      setNuevoEstado("");
    } catch {
      setErrorEstado("No se pudo actualizar el estado.");
    } finally {
      setGuardandoEstado(false);
    }
  };

  // Eliminar
  const confirmarEliminar = async () => {
    if (!pedidoParaEliminar) return;
    try {
      setEliminando(true);
      setErrorEliminar("");
      await deletePedido(pedidoParaEliminar.id);
      setPedidos((prev) => prev.filter((p) => p.id !== pedidoParaEliminar.id));
      setPedidoParaEliminar(null);
    } catch {
      setErrorEliminar("No se pudo eliminar el pedido.");
    } finally {
      setEliminando(false);
    }
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
      {/* Metrics */}
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
      {/* Table */}
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
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
          <button
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-secondary text-white rounded-xl text-sm font-bold shadow-lg shadow-secondary/20 hover:opacity-90 transition-all active:scale-95 cursor-pointer"
            onClick={() => setModalCrearAbierto(true)}
          >
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
        ) : pedidosFiltrados.length === 0 ? (
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
                {pedidosFiltrados.map((pedido) => {
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
                        <button
                          className={`px-3 py-1 text-[10px] font-extrabold rounded-full uppercase cursor-pointer hover:opacity-80 ${estado.classes}`}
                          onClick={() => {
                            setPedidoEditarEstado(pedido);
                            setNuevoEstado(pedido.estado);
                            setErrorEstado("");
                          }}
                        >
                          {estado.label}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right pr-6 rounded-r-lg">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-1.5 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                            onClick={() => setPedidoParaEliminar(pedido)}
                          >
                            <span className="material-symbols-outlined text-lg">
                              delete
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
      {/* Modal Crear */}
      <Modal
        open={modalCrearAbierto}
        onClose={cerrarModalCrear}
        title="Nuevo pedido"
        subtitle="Registra un nuevo pedido en el sistema."
      >
        <form className="space-y-5 px-6 py-6" onSubmit={guardarPedido}>
          <div className="space-y-2">
            <label
              className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"
              htmlFor="pedido-cliente"
            >
              ID del Cliente
            </label>
            <input
              className="w-full rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-secondary"
              id="pedido-cliente"
              min="1"
              onChange={(e) => setNuevoClienteId(e.target.value)}
              placeholder="Ej: 1"
              required
              type="number"
              value={nuevoClienteId}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"
                htmlFor="pedido-producto"
              >
                ID del Producto
              </label>
              <input
                className="w-full rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-secondary"
                id="pedido-producto"
                min="1"
                onChange={(e) => setNuevoProductoId(e.target.value)}
                placeholder="Ej: 1"
                required
                type="number"
                value={nuevoProductoId}
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"
                htmlFor="pedido-cantidad"
              >
                Cantidad
              </label>
              <input
                className="w-full rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-secondary"
                id="pedido-cantidad"
                min="1"
                onChange={(e) => setNuevoCantidad(e.target.value)}
                placeholder="Ej: 5"
                required
                type="number"
                value={nuevoCantidad}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label
              className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"
              htmlFor="pedido-direccion"
            >
              Dirección de Entrega
            </label>
            <input
              className="w-full rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-secondary"
              id="pedido-direccion"
              minLength={5}
              onChange={(e) => setNuevoDireccion(e.target.value)}
              placeholder="Ej: Av Siempre Viva 742"
              required
              type="text"
              value={nuevoDireccion}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"
                htmlFor="pedido-comuna"
              >
                Comuna
              </label>
              <input
                className="w-full rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-secondary"
                id="pedido-comuna"
                minLength={2}
                onChange={(e) => setNuevoComuna(e.target.value)}
                placeholder="Ej: Las Condes"
                required
                type="text"
                value={nuevoComuna}
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"
                htmlFor="pedido-ciudad"
              >
                Ciudad
              </label>
              <input
                className="w-full rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-secondary"
                id="pedido-ciudad"
                minLength={2}
                onChange={(e) => setNuevoCiudad(e.target.value)}
                placeholder="Ej: Santiago"
                required
                type="text"
                value={nuevoCiudad}
              />
            </div>
          </div>
          {errorCrear && (
            <div className="rounded-lg bg-error-container px-4 py-3 text-xs font-semibold text-on-error-container">
              {errorCrear}
            </div>
          )}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              className="rounded-lg px-5 py-2.5 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
              disabled={guardando}
              onClick={cerrarModalCrear}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="flex items-center justify-center gap-2 rounded-lg bg-secondary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-secondary/20 transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={guardando}
              type="submit"
            >
              {guardando ? (
                <span className="material-symbols-outlined text-lg animate-spin">
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined text-lg">add</span>
              )}
              Crear pedido
            </button>
          </div>
        </form>
      </Modal>
      {/* Modal Cambiar Estado */}
      <Modal
        open={!!pedidoEditarEstado}
        onClose={() => {
          setPedidoEditarEstado(null);
          setNuevoEstado("");
          setErrorEstado("");
        }}
        title="Cambiar estado del pedido"
        subtitle={
          pedidoEditarEstado
            ? `Pedido #${pedidoEditarEstado.id.toString().padStart(4, "0")}`
            : ""
        }
      >
        <div className="px-6 py-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"
                htmlFor="pedido-estado"
              >
                Nuevo estado
              </label>
              <select
                className="w-full rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-secondary cursor-pointer"
                id="pedido-estado"
                onChange={(e) => setNuevoEstado(e.target.value)}
                value={nuevoEstado}
              >
                {estadosPermitidos.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado.charAt(0).toUpperCase() +
                      estado.slice(1).replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            {errorEstado && (
              <div className="rounded-lg bg-error-container px-4 py-3 text-xs font-semibold text-on-error-container">
                {errorEstado}
              </div>
            )}
          </div>
          <div className="flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:justify-end">
            <button
              className="rounded-lg px-5 py-2.5 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
              disabled={guardandoEstado}
              onClick={() => {
                setPedidoEditarEstado(null);
                setNuevoEstado("");
                setErrorEstado("");
              }}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="flex items-center justify-center gap-2 rounded-lg bg-secondary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-secondary/20 transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={guardandoEstado || !nuevoEstado}
              onClick={guardarEstado}
              type="button"
            >
              {guardandoEstado ? (
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
        </div>
      </Modal>
      {/* Modal Eliminar */}
      <Modal
        open={!!pedidoParaEliminar}
        onClose={() => {
          setPedidoParaEliminar(null);
          setErrorEliminar("");
        }}
        title="Eliminar pedido"
      >
        <div className="px-6 py-6">
          <div className="flex items-start gap-4 mb-2">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-error-container">
              <span className="material-symbols-outlined text-xl text-on-error-container">
                delete
              </span>
            </div>
            <p className="text-sm text-on-surface-variant leading-6 pt-2">
              ¿Seguro que quieres eliminar el pedido{" "}
              <span className="font-bold text-on-surface">
                #{pedidoParaEliminar?.id.toString().padStart(4, "0")}
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
              disabled={eliminando}
              onClick={() => {
                setPedidoParaEliminar(null);
                setErrorEliminar("");
              }}
              type="button"
            >
              No, cancelar
            </button>
            <button
              className="flex items-center justify-center gap-2 rounded-lg bg-error px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-error/20 transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={eliminando}
              onClick={confirmarEliminar}
              type="button"
            >
              {eliminando ? (
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
