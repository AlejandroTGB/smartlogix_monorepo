export default function DashboardPage() {
  const metrics = [
    {
      value: "1,284",
      label: "Envíos en Tránsito",
      change: "+12%",
      changeType: "up" as const,
      icon: "local_shipping",
      color: "bg-blue-50 text-blue-600",
    },
    {
      value: "452",
      label: "Pedidos Pendientes",
      change: "-3%",
      changeType: "down" as const,
      icon: "pending_actions",
      color: "bg-amber-50 text-amber-600",
    },
    {
      value: "94%",
      label: "Stock Disponible",
      change: "Estable",
      changeType: "stable" as const,
      icon: "inventory_2",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      value: "2.4d",
      label: "Tiempo Entrega Prom.",
      change: "Óptimo",
      changeType: "stable" as const,
      icon: "avg_time",
      color: "bg-purple-50 text-purple-600",
    },
  ];
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
  const criticalShipments = [
    {
      id: "SL-8923-X",
      destination: "Madrid, ES",
      status: "En Aduanas",
      statusType: "tertiary" as const,
      eta: "Hoy, 18:45",
    },
    {
      id: "SL-4412-M",
      destination: "Ciudad de México, MX",
      status: "Entregado",
      statusType: "secondary" as const,
      eta: "Ayer",
    },
    {
      id: "SL-2290-B",
      destination: "Bogotá, CO",
      status: "En Ruta",
      statusType: "blue" as const,
      eta: "Mañana, 09:00",
    },
  ];
  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <section className="flex flex-col gap-1">
        <h2 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">
          Bienvenido, Admin
        </h2>
        <p className="text-on-surface-variant font-medium">
          Aquí tienes el resumen de operaciones de hoy.
        </p>
      </section>
      {/* Summary Widgets */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="bg-surface-container-lowest p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${metric.color}`}>
                <span className="material-symbols-outlined">{metric.icon}</span>
              </div>
              <span
                className={`text-xs font-bold flex items-center gap-1 ${metric.changeType === "up" ? "text-secondary" : metric.changeType === "down" ? "text-error" : "text-secondary"}`}
              >
                {metric.changeType === "up" && (
                  <span className="material-symbols-outlined text-sm">
                    trending_up
                  </span>
                )}
                {metric.changeType === "down" && (
                  <span className="material-symbols-outlined text-sm">
                    trending_down
                  </span>
                )}
                {metric.change}
              </span>
            </div>
            <p className="text-4xl font-extrabold font-headline text-on-surface mb-1">
              {metric.value}
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              {metric.label}
            </p>
          </div>
        ))}
      </section>
      {/* Quick Access & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Access */}
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
                  <span className="material-symbols-outlined">{link.icon}</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">{link.title}</h4>
                  <p className="text-xs text-on-surface-variant">{link.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
        {/* Predictive Logic Card */}
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
                Velocidad de la Red
              </p>
              <p className="text-sm text-on-secondary-container/80 mb-6 leading-relaxed">
                El motor predictivo sugiere desviar 12 envíos de la Ruta Norte
                para evitar el retraso por clima en la zona central.
              </p>
              <button className="w-full py-3 bg-on-secondary-container text-white rounded-lg font-bold text-sm active:scale-95 transition-transform cursor-pointer">
                Aplicar Optimización
              </button>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Eficiencia Operativa
              </p>
              <span className="text-sm font-bold text-secondary">98.2%</span>
            </div>
            <div className="h-2 bg-surface-container-low rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full w-[98%]" />
            </div>
            <p className="text-[10px] text-on-surface-variant italic">
              Basado en los últimos 5,000 movimientos de carga.
            </p>
          </div>
        </div>
      </div>
      {/* Critical Shipments Table */}
      <section className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold font-headline text-on-surface">
            Envíos Críticos
          </h3>
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-on-surface">
            more_horiz
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high">
              <tr>
                <th className="px-6 py-4 text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest">
                  ID Rastreo
                </th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest">
                  Destino
                </th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest">
                  Estado
                </th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest">
                  ETA
                </th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {criticalShipments.map((shipment) => (
                <tr
                  key={shipment.id}
                  className="hover:bg-surface-container-low transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-sm">{shipment.id}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {shipment.destination}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-[10px] font-extrabold rounded-full uppercase ${
                        shipment.statusType === "secondary"
                          ? "bg-secondary-container text-on-secondary-container"
                          : shipment.statusType === "tertiary"
                            ? "bg-tertiary-fixed text-on-tertiary-container"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {shipment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{shipment.eta}</td>
                  <td className="px-6 py-4">
                    <button className="text-secondary font-bold text-xs hover:underline cursor-pointer">
                      Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
