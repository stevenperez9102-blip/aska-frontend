import { useEffect, useState } from "react";
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
  });
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

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

      setData({
        metricas: result.metricas || data.metricas,
        estados: Array.isArray(result.estados) ? result.estados : [],
        recientes: Array.isArray(result.recientes) ? result.recientes : [],
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
  }, []);

  const { metricas } = data;

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
                Métricas principales de ventas, pedidos y cupones para tomar decisiones reales del negocio.
              </p>
            </div>

            <button
              type="button"
              onClick={cargarDashboard}
              style={{
                ...topButton(false),
                marginTop: "8px",
              }}
            >
              Actualizar
            </button>
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
                  gridTemplateColumns: "minmax(0, 0.85fr) minmax(0, 1.15fr)",
                  gap: "18px",
                }}
              >
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
                      margin: "0 0 18px",
                      fontSize: "1.35rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Estados de pedidos
                  </h2>

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
                </div>

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
                      margin: "0 0 18px",
                      fontSize: "1.35rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Pedidos recientes
                  </h2>

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
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default AdminDashboard;
