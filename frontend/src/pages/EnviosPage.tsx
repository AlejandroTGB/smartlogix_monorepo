import { useEffect, useState } from "react";
import Modal from "../components/modal";
import {
  getEnvios,
  createEnvio,
  updateEnvioEstado,
  deleteEnvio,
  type Envio,
  type EnvioCreate,
} from "../api/envios";
const estadoConfig: Record<string, { label: string; classes: string }> = {
  pendiente: {
    label: "Pendiente",
    classes: "bg-tertiary-fixed text-on-tertiary-container",
  },
  preparando: { label: "Preparando", classes: "bg-blue-100 text-blue-700" },
  despachado: {
    label: "Despachado",
    classes: "bg-purple-100 text-purple-700",
  },
  en_transito: {
    label: "En Tránsito",
    classes: "bg-amber-100 text-amber-700",
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
  "pendiente",
  "preparando",
  "despachado",
  "en_transito",
  "entregado",
  "cancelado",
];
export default function EnviosPage() {
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  // Crear
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorCrear, setErrorCrear] = useState("");
  const [nuevoPedidoId, setNuevoPedidoId] = useState("");
  const [nuevaDireccion, setNuevaDireccion] = useState("");
  const [nuevaComuna, setNuevaComuna] = useState("");
  const [nuevaCiudad, setNuevaCiudad] = useState("");
  const [nuevoTransportista, setNuevoTransportista] = useState("");
  // Estado
  const [envioEditarEstado, setEnvioEditarEstado] = useState<Envio | null>(
    null,
  );
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [guardandoEstado, setGuardandoEstado] = useState(false);
  const [errorEstado, setErrorEstado] = useState("");
  // Eliminar
  const [envioParaEliminar, setEnvioParaEliminar] = useState<Envio | null>(
    null,
  );
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState("");
  useEffect(() => {
    getEnvios()
      .then(setEnvios)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  const enTransito = envios.filter((e) => e.estado === "en_transito").length;
  const entregados = envios.filter((e) => e.estado === "entregado").length;

  const enviosFiltrados = busqueda
    ? envios.filter(
        (e) =>
          e.codigo_seguimiento.toLowerCase().includes(busqueda.toLowerCase()) ||
          e.direccion_entrega.toLowerCase().includes(busqueda.toLowerCase()) ||
          e.comuna.toLowerCase().includes(busqueda.toLowerCase()) ||
          e.ciudad.toLowerCase().includes(busqueda.toLowerCase()) ||
          (e.transportista &&
            e.transportista.toLowerCase().includes(busqueda.toLowerCase())),
      )
    : envios;
  // Crear envío
  const cerrarModalCrear = () => {
    if (guardando) return;
    setModalCrearAbierto(false);
    setNuevoPedidoId("");
    setNuevaDireccion("");
    setNuevaComuna("");
    setNuevaCiudad("");
    setNuevoTransportista("");
    setErrorCrear("");
  };
  const guardarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCrear("");
    const datos: EnvioCreate = {
      pedido_id: Number(nuevoPedidoId),
      direccion_entrega: nuevaDireccion,
      comuna: nuevaComuna,
      ciudad: nuevaCiudad,
      transportista: nuevoTransportista || undefined,
    };
    if (!datos.pedido_id || Number.isNaN(datos.pedido_id)) {
      setErrorCrear("El ID del pedido es obligatorio.");
      return;
    }
    if (!datos.direccion_entrega.trim()) {
      setErrorCrear("La dirección de entrega es obligatoria.");
      return;
    }
    if (!datos.comuna.trim()) {
      setErrorCrear("La comuna es obligatoria.");
      return;
    }
    if (!datos.ciudad.trim()) {
      setErrorCrear("La ciudad es obligatoria.");
      return;
    }
    try {
      setGuardando(true);
      const creado = await createEnvio(datos);
      setEnvios((prev) => [...prev, creado]);
      cerrarModalCrear();
    } catch {
      setErrorCrear("No se pudo crear el envío. Verifica permisos o datos.");
    } finally {
      setGuardando(false);
    }
  };
  // Cambiar estado
  const guardarEstado = async () => {
    if (!envioEditarEstado || !nuevoEstado) return;
    setErrorEstado("");
    try {
      setGuardandoEstado(true);
      const actualizado = await updateEnvioEstado(envioEditarEstado.id, {
        estado: nuevoEstado,
      });
      setEnvios((prev) =>
        prev.map((e) => (e.id === actualizado.id ? actualizado : e)),
      );
      setEnvioEditarEstado(null);
      setNuevoEstado("");
    } catch {
      setErrorEstado("No se pudo actualizar el estado.");
    } finally {
      setGuardandoEstado(false);
    }
  };
  // Eliminar
  const confirmarEliminar = async () => {
    if (!envioParaEliminar) return;
    try {
      setEliminando(true);
      setErrorEliminar("");
      await deleteEnvio(envioParaEliminar.id);
      setEnvios((prev) => prev.filter((e) => e.id !== envioParaEliminar.id));
      setEnvioParaEliminar(null);
    } catch {
      setErrorEliminar("No se pudo eliminar el envío.");
    } finally {
      setEliminando(false);
    }
  };
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
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
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
          <button
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-secondary text-white rounded-xl text-sm font-bold shadow-lg shadow-secondary/20 hover:opacity-90 transition-all active:scale-95 cursor-pointer"
            onClick={() => setModalCrearAbierto(true)}
          >
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
        ) : enviosFiltrados.length === 0 ? (
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
                {enviosFiltrados.map((envio) => {
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
                        <button
                          className={`px-3 py-1 text-[10px] font-extrabold rounded-full uppercase cursor-pointer hover:opacity-80 ${estado.classes}`}
                          onClick={() => {
                            setEnvioEditarEstado(envio);
                            setNuevoEstado(envio.estado);
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
                            onClick={() => setEnvioParaEliminar(envio)}
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
      {/* Modal Crear Envío */}
      <Modal
        open={modalCrearAbierto}
        onClose={cerrarModalCrear}
        title="Nuevo envío"
        subtitle="Registra un nuevo envío en el sistema."
      >
        <form className="space-y-5 px-6 py-6" onSubmit={guardarEnvio}>
          <div className="space-y-2">
            <label
              className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"
              htmlFor="envio-pedido-id"
            >
              ID del Pedido
            </label>
            <input
              className="w-full rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-secondary"
              id="envio-pedido-id"
              min="1"
              onChange={(e) => setNuevoPedidoId(e.target.value)}
              placeholder="Ej: 1"
              required
              type="number"
              value={nuevoPedidoId}
            />
          </div>
          <div className="space-y-2">
            <label
              className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"
              htmlFor="envio-direccion"
            >
              Dirección de Entrega
            </label>
            <input
              className="w-full rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-secondary"
              id="envio-direccion"
              onChange={(e) => setNuevaDireccion(e.target.value)}
              placeholder="Ej: Av. Principal 123"
              required
              type="text"
              value={nuevaDireccion}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"
                htmlFor="envio-comuna"
              >
                Comuna
              </label>
              <input
                className="w-full rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-secondary"
                id="envio-comuna"
                onChange={(e) => setNuevaComuna(e.target.value)}
                placeholder="Ej: Providencia"
                required
                type="text"
                value={nuevaComuna}
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"
                htmlFor="envio-ciudad"
              >
                Ciudad
              </label>
              <input
                className="w-full rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-secondary"
                id="envio-ciudad"
                onChange={(e) => setNuevaCiudad(e.target.value)}
                placeholder="Ej: Santiago"
                required
                type="text"
                value={nuevaCiudad}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label
              className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"
              htmlFor="envio-transportista"
            >
              Transportista (opcional)
            </label>
            <input
              className="w-full rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-secondary"
              id="envio-transportista"
              onChange={(e) => setNuevoTransportista(e.target.value)}
              placeholder="Ej: Starken"
              type="text"
              value={nuevoTransportista}
            />
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
              Crear envío
            </button>
          </div>
        </form>
      </Modal>
      {/* Modal Cambiar Estado */}
      <Modal
        open={!!envioEditarEstado}
        onClose={() => {
          setEnvioEditarEstado(null);
          setNuevoEstado("");
          setErrorEstado("");
        }}
        title="Cambiar estado del envío"
        subtitle={
          envioEditarEstado
            ? `Envío ${envioEditarEstado.codigo_seguimiento}`
            : ""
        }
      >
        <div className="px-6 py-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"
                htmlFor="envio-estado"
              >
                Nuevo estado
              </label>
              <select
                className="w-full rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-secondary cursor-pointer"
                id="envio-estado"
                onChange={(e) => setNuevoEstado(e.target.value)}
                value={nuevoEstado}
              >
                {estadosPermitidos.map((estado) => (
                  <option key={estado} value={estado}>
                    {estadoConfig[estado]?.label || estado}
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
                setEnvioEditarEstado(null);
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
        open={!!envioParaEliminar}
        onClose={() => {
          setEnvioParaEliminar(null);
          setErrorEliminar("");
        }}
        title="Eliminar envío"
      >
        <div className="px-6 py-6">
          <div className="flex items-start gap-4 mb-2">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-error-container">
              <span className="material-symbols-outlined text-xl text-on-error-container">
                delete
              </span>
            </div>
            <p className="text-sm text-on-surface-variant leading-6 pt-2">
              ¿Seguro que quieres eliminar el envío{" "}
              <span className="font-bold text-on-surface">
                {envioParaEliminar?.codigo_seguimiento}
              </span>{" "}
              con destino a{" "}
              <span className="font-bold text-on-surface">
                {envioParaEliminar?.direccion_entrega},{" "}
                {envioParaEliminar?.comuna}
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
                setEnvioParaEliminar(null);
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
