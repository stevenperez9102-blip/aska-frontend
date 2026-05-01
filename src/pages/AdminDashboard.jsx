import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-CO");
}

function formatDay(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(5);
  return date.toLocaleDateString("es-CO", {
    month: "short",
    day: "numeric",
  });
}

function metricCard(label, value, helper) {
  return (
    <div
      style={{
        background: "linear-gradient(145deg, #111, #070707)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: "28px",
        padding: "24px",
        boxShadow: "0 18px 45px rgba(0,0,0,0.28)",
      }}
    >
      <p
        style={{
          margin: 0,
          marginBottom: "10px",
          color: "rgba(255,255,255,0.58)",
          fontSize: "0.82rem",
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          fontWeight: 800,
        }}
      >
        {label}
      </p>

      <h3
        style={{
          margin: 0,
          fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
          lineHeight: 1,
          color: "#fff",
          fontWeight: 900,
        }}
      >
        {value}
      </h3>

      {helper && (
        <p
          style={{
            margin: "12px 0 0",
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.5,
          }}
        >
          {helper}
        </p>
      )}
    </div>
  );
}

function topButton(active = false) {
  return {
    border: active
      ? "1px solid rgba(217, 200, 239, 0.45)"
      : "1px solid rgba(255,255,255,0.10)",
    background: active
      ? "rgba(217, 200, 239, 0.12)"
      : "rgba(255,255,255,0.04)",
    color: active ? "#f1e6ff" : "#f5f5f5",
    borderRadius: "999px",
    padding: "12px 18px",
    fontWeight: 800,
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  };
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div
      style={{
        background: "#0f0f0f",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "28px",
        padding: "24px",
        boxShadow: "0 18px 45px rgba(0,0,0,0.22)",
      }}
    >
      <h2
        style={{
          margin: "0 0 8px",
          fontSize: "1.25rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 900,
        }}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          style={{
            margin: "0 0 20px",
            color: "rgba(255,255,255,0.58)",
            lineHeight: 1.55,
          }}
        >
          {subtitle}
        </p>
      )}

      {children}
    </div>
  );
}

function AdminDashboard() {
  const [data, setData] = useState({
    metricas: {
      pedidos_pagados: 0,
      ingresos_totales: 0,
      pedidos_hoy: 0,
      ingresos_hoy: 0,
      cupones_creados: 0,
      cupones_usados: 0,
    },
    estados: [],
    recientes: [],
    ventas_por_dia: [],
    top_productos: [],
  });
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [desdeExcel, setDesdeExcel] = useState("");
  const [hastaExcel, setHastaExcel] = useState("");
  const [ultimoPedidoId, setUltimoPedidoId] = useState(null);
  const [nuevoPedido, setNuevoPedido] = useState(false);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      setMensaje("");

      const res = await fetch("https://aska-backend-nyx8.onrender.com/api/admin/dashboard");
      const result = await res.json();

      if (!res.ok) {
        setMensaje(result.mensaje || "No fue posible cargar el dashboard.");
        return;
      }

      const recientes = Array.isArray(result.recientes) ? result.recientes : [];

      if (recientes.length > 0) {
        const idActual = recientes[0].id;
        if (ultimoPedidoId && idActual !== ultimoPedidoId) {
          setNuevoPedido(true);
        }
        setUltimoPedidoId(idActual);
      }

      setData({
        metricas: result.metricas || data.metricas,
        estados: Array.isArray(result.estados) ? result.estados : [],
        recientes: Array.isArray(result.recientes) ? result.recientes : [],
        ventas_por_dia: Array.isArray(result.ventas_por_dia)
          ? result.ventas_por_dia
          : [],
        top_productos: Array.isArray(result.top_productos)
          ? result.top_productos
          : [],
      });
    } catch (error) {
      console.error("Error cargando dashboard:", error);
      setMensaje("Error cargando dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDashboard();

    const interval = setInterval(() => {
      cargarDashboard();
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const { metricas } = data;

  const maxIngresosDia = useMemo(() => {
    return Math.max(...data.ventas_por_dia.map((item) => Number(item.ingresos || 0)), 1);
  }, [data.ventas_por_dia]);

  const maxTopProducto = useMemo(() => {
    return Math.max(...data.top_productos.map((item) => Number(item.unidades || 0)), 1);
  }, [data.top_productos]);

  const exportarExcel = () => {
    const params = new URLSearchParams();

    if (desdeExcel) {
      params.append("desde", desdeExcel);
    }

    if (hastaExcel) {
      params.append("hasta", hastaExcel);
    }

    const query = params.toString();
    const url = `https://aska-backend-nyx8.onrender.com/api/admin/exportar${query ? `?${query}` : ""}`;

    window.open(url, "_blank");
  };

  return (
    <>
      <Navbar />

      <section
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top left, rgba(191,166,255,0.14), transparent 32%), #050505",
          color: "#fff",
          padding: "38px 24px 70px",
        }}
      >
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "18px",
              flexWrap: "wrap",
              marginBottom: "26px",
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 10px",
                  color: "rgba(255,255,255,0.58)",
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  fontSize: "0.82rem",
                  fontWeight: 900,
                }}
              >
                Panel AŞKA
              </p>

              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(2.2rem, 6vw, 4.2rem)",
                  lineHeight: 1,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Dashboard
              </h1>

              <p
                style={{
                  marginTop: "14px",
                  maxWidth: "720px",
                  color: "rgba(255,255,255,0.68)",
                  lineHeight: 1.7,
                }}
              >
                Métricas principales, ventas por día y productos más vendidos.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginTop: "8px" }}>
              <input
                type="date"
                value={desdeExcel}
                onChange={(e) => setDesdeExcel(e.target.value)}
                title="Desde"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.16)",
                  padding: "11px 12px",
                  borderRadius: "999px",
                  fontWeight: 800,
                  outline: "none",
                }}
              />

              <input
                type="date"
                value={hastaExcel}
                onChange={(e) => setHastaExcel(e.target.value)}
                title="Hasta"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.16)",
                  padding: "11px 12px",
                  borderRadius: "999px",
                  fontWeight: 800,
                  outline: "none",
                }}
              />

              <button
                type="button"
                onClick={exportarExcel}
                style={{
                  background: "#fff",
                  color: "#000",
                  padding: "12px 18px",
                  borderRadius: "999px",
                  border: "none",
                  fontWeight: 900,
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Exportar Excel
              </button>

              <button
                type="button"
                onClick={cargarDashboard}
                style={{
                  ...topButton(false),
                }}
              >
                Actualizar
              </button>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "30px",
            }}
          >
            <Link to="/admin/dashboard">
              <button style={topButton(true)}>Dashboard</button>
            </Link>

            <Link to="/admin/productos">
              <button style={topButton(false)}>Productos</button>
            </Link>

            <Link to="/admin/pedidos">
              <button style={topButton(false)}>Pedidos</button>
            </Link>

            <Link to="/admin/pagina">
              <button style={topButton(false)}>Página</button>
            </Link>
          </div>

          {mensaje && (
            <div
              style={{
                background: "rgba(122,47,67,0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "18px",
                padding: "16px",
                marginBottom: "24px",
                color: "#fff",
                fontWeight: 700,
              }}
            >
              {mensaje}
            </div>
          )}

          
          {nuevoPedido && (
            <div
              style={{
                background: "#0f5132",
                border: "1px solid #198754",
                borderRadius: "16px",
                padding: "14px",
                marginBottom: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap"
              }}
            >
              <strong>Nuevo pedido recibido 🛒</strong>
              <button
                onClick={() => {
                  setNuevoPedido(false);
                  window.location.href = "/admin/pedidos";
                }}
                style={{
                  background: "#fff",
                  color: "#000",
                  padding: "8px 14px",
                  borderRadius: "999px",
                  border: "none",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                Ver pedidos
              </button>
            </div>
          )}

          {loading ? (
            <div
              style={{
                background: "#0f0f0f",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "28px",
                padding: "28px",
              }}
            >
              Cargando métricas...
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                  gap: "16px",
                  marginBottom: "28px",
                }}
              >
                {metricCard(
                  "Ingresos totales",
                  formatPrice(metricas.ingresos_totales),
                  "Suma de pedidos pagados o activos."
                )}

                {metricCard(
                  "Pedidos pagados",
                  metricas.pedidos_pagados,
                  "Pedidos con pago confirmado o en proceso posterior."
                )}

                {metricCard(
                  "Ingresos hoy",
                  formatPrice(metricas.ingresos_hoy),
                  "Ventas registradas durante el día actual."
                )}

                {metricCard(
                  "Pedidos hoy",
                  metricas.pedidos_hoy,
                  "Cantidad de pedidos pagados hoy."
                )}

                {metricCard(
                  "Cupones creados",
                  metricas.cupones_creados,
                  "Cupones automáticos de compra y cumpleaños."
                )}

                {metricCard(
                  "Cupones usados",
                  metricas.cupones_usados,
                  "Cupones marcados como utilizados."
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: "18px",
                  marginBottom: "18px",
                }}
              >
                <ChartCard
                  title="Ventas últimos 14 días"
                  subtitle="Ingresos diarios por pedidos pagados o activos."
                >
                  {data.ventas_por_dia.length === 0 ? (
                    <p style={{ color: "rgba(255,255,255,0.62)" }}>
                      Aún no hay ventas suficientes para graficar.
                    </p>
                  ) : (
                    <div
                      style={{
                        height: "260px",
                        display: "flex",
                        alignItems: "flex-end",
                        gap: "10px",
                        paddingTop: "20px",
                      }}
                    >
                      {data.ventas_por_dia.map((item) => {
                        const height = Math.max(
                          8,
                          (Number(item.ingresos || 0) / maxIngresosDia) * 210
                        );

                        return (
                          <div
                            key={String(item.dia)}
                            style={{
                              flex: 1,
                              minWidth: "24px",
                              display: "grid",
                              alignItems: "end",
                              gap: "8px",
                            }}
                            title={`${formatDay(item.dia)} · ${formatPrice(item.ingresos)}`}
                          >
                            <div
                              style={{
                                height: `${height}px`,
                                borderRadius: "999px 999px 8px 8px",
                                background:
                                  "linear-gradient(180deg, #f1e6ff, #6f5491)",
                                boxShadow:
                                  "0 12px 28px rgba(111,84,145,0.32)",
                              }}
                            />
                            <span
                              style={{
                                color: "rgba(255,255,255,0.55)",
                                fontSize: "0.72rem",
                                textAlign: "center",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {formatDay(item.dia)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ChartCard>

                <ChartCard
                  title="Productos más vendidos"
                  subtitle="Top por unidades vendidas."
                >
                  {data.top_productos.length === 0 ? (
                    <p style={{ color: "rgba(255,255,255,0.62)" }}>
                      Aún no hay productos vendidos para graficar.
                    </p>
                  ) : (
                    <div style={{ display: "grid", gap: "14px" }}>
                      {data.top_productos.map((item) => {
                        const width = Math.max(
                          8,
                          (Number(item.unidades || 0) / maxTopProducto) * 100
                        );

                        return (
                          <div key={item.nombre}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: "14px",
                                marginBottom: "8px",
                              }}
                            >
                              <strong
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: "70%",
                                }}
                              >
                                {item.nombre}
                              </strong>
                              <span style={{ color: "rgba(255,255,255,0.64)" }}>
                                {item.unidades} uds
                              </span>
                            </div>

                            <div
                              style={{
                                height: "12px",
                                borderRadius: "999px",
                                background: "rgba(255,255,255,0.08)",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${width}%`,
                                  height: "100%",
                                  borderRadius: "999px",
                                  background:
                                    "linear-gradient(90deg, #f1e6ff, #6f5491)",
                                }}
                              />
                            </div>

                            <p
                              style={{
                                margin: "6px 0 0",
                                color: "rgba(255,255,255,0.52)",
                                fontSize: "0.82rem",
                              }}
                            >
                              {formatPrice(item.ingresos)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ChartCard>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 0.85fr) minmax(0, 1.15fr)",
                  gap: "18px",
                }}
              >
                <ChartCard title="Estados de pedidos">
                  {data.estados.length === 0 ? (
                    <p style={{ color: "rgba(255,255,255,0.62)" }}>
                      No hay pedidos activos todavía.
                    </p>
                  ) : (
                    <div style={{ display: "grid", gap: "12px" }}>
                      {data.estados.map((item) => (
                        <div
                          key={item.estado}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "14px",
                            padding: "14px 0",
                            borderBottom: "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          <span
                            style={{
                              color: "rgba(255,255,255,0.72)",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              fontWeight: 800,
                            }}
                          >
                            {item.estado || "Sin estado"}
                          </span>
                          <strong>{item.total}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </ChartCard>

                <ChartCard title="Pedidos recientes">
                  {data.recientes.length === 0 ? (
                    <p style={{ color: "rgba(255,255,255,0.62)" }}>
                      No hay pedidos recientes.
                    </p>
                  ) : (
                    <div style={{ display: "grid", gap: "12px" }}>
                      {data.recientes.map((pedido) => (
                        <Link
                          key={pedido.id}
                          to="/admin/pedidos"
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr auto",
                              gap: "12px",
                              padding: "16px",
                              borderRadius: "20px",
                              background: "rgba(255,255,255,0.045)",
                              border: "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            <div>
                              <strong
                                style={{
                                  display: "block",
                                  marginBottom: "6px",
                                  fontSize: "1rem",
                                }}
                              >
                                Pedido #{pedido.id} · {pedido.nombre}
                              </strong>
                              <p
                                style={{
                                  margin: 0,
                                  color: "rgba(255,255,255,0.58)",
                                  lineHeight: 1.55,
                                }}
                              >
                                {pedido.ciudad || "Sin ciudad"} · {formatDate(pedido.fecha)}
                              </p>
                            </div>

                            <div style={{ textAlign: "right" }}>
                              <strong style={{ color: "#f1e6ff" }}>
                                {formatPrice(pedido.total)}
                              </strong>
                              <p
                                style={{
                                  margin: "6px 0 0",
                                  color: "rgba(255,255,255,0.58)",
                                  textTransform: "uppercase",
                                  fontSize: "0.75rem",
                                  letterSpacing: "0.08em",
                                }}
                              >
                                {pedido.estado}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </ChartCard>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default AdminDashboard;
