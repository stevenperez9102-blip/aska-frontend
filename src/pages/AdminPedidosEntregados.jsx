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

function topLinkButton(active = false) {
  return {
    border: active ? "1px solid rgba(217, 200, 239, 0.45)" : "1px solid rgba(255,255,255,0.10)",
    background: active ? "rgba(217, 200, 239, 0.12)" : "rgba(255,255,255,0.04)",
    color: active ? "#f1e6ff" : "#f5f5f5",
    borderRadius: "999px",
    padding: "12px 18px",
    fontWeight: 600,
    cursor: "pointer",
  };
}

function actionButtonStyles(type = "default") {
  const common = {
    border: "none",
    borderRadius: "999px",
    padding: "10px 16px",
    fontWeight: 700,
    cursor: "pointer",
  };

  if (type === "secondary") {
    return {
      ...common,
      background: "rgba(255,255,255,0.08)",
      color: "#f3f3f3",
    };
  }

  return {
    ...common,
    background: "#1f1f1f",
    color: "#fff",
  };
}

function AdminPedidosEntregados() {
  const [pedidos, setPedidos] = useState([]);
  const [detalles, setDetalles] = useState({});
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const cargarPedidos = async () => {
    try {
      setLoading(true);

      const res = await fetch("https://aska-backend-nyx8.onrender.com/api/pedidos");
      const data = await res.json();

      const filtrados = Array.isArray(data)
        ? data.filter((pedido) => pedido.estado === "entregado")
        : [];

      setPedidos(filtrados);
    } catch (error) {
      console.error("Error cargando pedidos entregados:", error);
      setMensaje("No fue posible cargar los pedidos entregados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  useEffect(() => {
    if (!mensaje) return;
    const timer = setTimeout(() => setMensaje(""), 2600);
    return () => clearTimeout(timer);
  }, [mensaje]);

  const verDetalle = async (pedidoId) => {
    if (detalles[pedidoId]) {
      setDetalles((prev) => ({
        ...prev,
        [pedidoId]: null,
      }));
      return;
    }

    try {
      const response = await fetch(
        `https://aska-backend-nyx8.onrender.com/api/pedidos/${pedidoId}/detalle`
      );
      const data = await response.json();

      setDetalles((prev) => ({
        ...prev,
        [pedidoId]: Array.isArray(data) ? data : [],
      }));
    } catch (error) {
      console.error("Error cargando detalle:", error);
      setMensaje("No fue posible cargar el detalle del pedido.");
    }
  };

  return (
    <>
      <Navbar />

      {mensaje && (
        <div
          style={{
            position: "fixed",
            top: "92px",
            right: "24px",
            zIndex: 9998,
            background: "rgba(111, 84, 145, 0.96)",
            color: "#fff",
            padding: "14px 18px",
            borderRadius: "16px",
            boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
            fontWeight: 600,
            maxWidth: "360px",
          }}
        >
          {mensaje}
        </div>
      )}

      <section
        style={{
          minHeight: "100vh",
          background: "#050505",
          color: "#fff",
          padding: "38px 24px 60px",
        }}
      >
        <div
          style={{
            maxWidth: "1240px",
            margin: "0 auto",
          }}
        >
          <div style={{ marginBottom: "26px" }}>
            <p
              style={{
                color: "rgba(255,255,255,0.58)",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: "0.82rem",
                marginBottom: "8px",
              }}
            >
              Administración AŞKA
            </p>

            <h1
              style={{
                fontSize: "clamp(2rem, 5vw, 3.6rem)",
                lineHeight: 1.05,
                margin: 0,
              }}
            >
              Pedidos entregados
            </h1>

            <p
              style={{
                marginTop: "12px",
                color: "rgba(255,255,255,0.68)",
                maxWidth: "760px",
                lineHeight: 1.7,
              }}
            >
              Historial de órdenes finalizadas. Aquí puedes revisar la
              información completa y el detalle de compra de cada pedido
              entregado.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "28px",
            }}
          >
            <Link to="/admin">
              <button style={topLinkButton(false)}>Gestión de productos</button>
            </Link>

            <Link to="/admin/pedidos">
              <button style={topLinkButton(false)}>Pedidos recibidos</button>
            </Link>

            <Link to="/admin/pedidos-entregados">
              <button style={topLinkButton(true)}>Pedidos entregados</button>
            </Link>
          </div>

          <div
            style={{
              background: "#0f0f0f",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "24px",
              padding: "20px",
              marginBottom: "24px",
            }}
          >
            <p style={{ margin: 0, color: "rgba(255,255,255,0.6)" }}>
              Total entregados
            </p>
            <h3 style={{ margin: "8px 0 0", fontSize: "2rem" }}>{pedidos.length}</h3>
          </div>

          {loading ? (
            <div
              style={{
                background: "#0f0f0f",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "28px",
                padding: "28px",
              }}
            >
              Cargando pedidos entregados...
            </div>
          ) : pedidos.length === 0 ? (
            <div
              style={{
                background: "#0f0f0f",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "28px",
                padding: "28px",
              }}
            >
              No hay pedidos entregados aún.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "18px" }}>
              {pedidos.map((pedido) => (
                <article
                  key={pedido.id}
                  style={{
                    background: "#090909",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "28px",
                    padding: "24px",
                    boxShadow: "0 14px 40px rgba(0,0,0,0.18)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "18px",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      marginBottom: "18px",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: 0,
                          color: "rgba(255,255,255,0.52)",
                          marginBottom: "8px",
                        }}
                      >
                        Pedido #{pedido.id}
                      </p>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "1.6rem",
                          lineHeight: 1.1,
                        }}
                      >
                        {pedido.nombre}
                      </h3>
                    </div>

                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        borderRadius: "999px",
                        padding: "6px 12px",
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        letterSpacing: "0.2px",
                        background: "rgba(93, 170, 117, 0.18)",
                        color: "#9ce0ad",
                        border: "1px solid rgba(156, 224, 173, 0.28)",
                      }}
                    >
                      entregado
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "12px",
                      marginBottom: "18px",
                    }}
                  >
                    <div>
                      <strong>Correo:</strong>
                      <div style={{ marginTop: "4px", color: "rgba(255,255,255,0.72)" }}>
                        {pedido.correo}
                      </div>
                    </div>

                    <div>
                      <strong>Teléfono:</strong>
                      <div style={{ marginTop: "4px", color: "rgba(255,255,255,0.72)" }}>
                        {pedido.telefono}
                      </div>
                    </div>

                    <div>
                      <strong>Ciudad:</strong>
                      <div style={{ marginTop: "4px", color: "rgba(255,255,255,0.72)" }}>
                        {pedido.ciudad}
                      </div>
                    </div>

                    <div>
                      <strong>Dirección:</strong>
                      <div style={{ marginTop: "4px", color: "rgba(255,255,255,0.72)" }}>
                        {pedido.direccion}
                      </div>
                    </div>

                    <div>
                      <strong>Total:</strong>
                      <div style={{ marginTop: "4px", color: "#f3e6ff", fontWeight: 700 }}>
                        {formatPrice(pedido.total)}
                      </div>
                    </div>

                    <div>
                      <strong>Fecha:</strong>
                      <div style={{ marginTop: "4px", color: "rgba(255,255,255,0.72)" }}>
                        {formatDate(pedido.fecha)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => verDetalle(pedido.id)}
                    style={actionButtonStyles("secondary")}
                  >
                    {detalles[pedido.id] ? "Ocultar detalle" : "Ver detalle"}
                  </button>

                  {detalles[pedido.id] && (
                    <div
                      style={{
                        marginTop: "18px",
                        borderTop: "1px solid rgba(255,255,255,0.08)",
                        paddingTop: "18px",
                      }}
                    >
                      <h4
                        style={{
                          marginTop: 0,
                          marginBottom: "14px",
                          fontSize: "1.05rem",
                        }}
                      >
                        Productos comprados
                      </h4>

                      {detalles[pedido.id].length === 0 ? (
                        <p style={{ color: "rgba(255,255,255,0.65)" }}>
                          No hay detalle para este pedido.
                        </p>
                      ) : (
                        <div style={{ display: "grid", gap: "12px" }}>
                          {detalles[pedido.id].map((item) => (
                            <div
                              key={item.id}
                              style={{
                                background: "#111",
                                border: "1px solid rgba(255,255,255,0.06)",
                                borderRadius: "20px",
                                padding: "16px",
                                display: "grid",
                                gridTemplateColumns: "1.4fr 0.8fr 0.8fr 0.8fr",
                                gap: "12px",
                              }}
                            >
                              <div>
                                <div style={{ fontWeight: 700 }}>{item.nombre}</div>
                                <div
                                  style={{
                                    color: "rgba(255,255,255,0.52)",
                                    marginTop: "4px",
                                  }}
                                >
                                  Producto ID: {item.producto_id}
                                </div>
                              </div>

                              <div>
                                <div style={{ color: "rgba(255,255,255,0.52)" }}>Cantidad</div>
                                <div style={{ marginTop: "4px", fontWeight: 600 }}>
                                  {item.cantidad}
                                </div>
                              </div>

                              <div>
                                <div style={{ color: "rgba(255,255,255,0.52)" }}>Precio</div>
                                <div style={{ marginTop: "4px", fontWeight: 600 }}>
                                  {formatPrice(item.precio)}
                                </div>
                              </div>

                              <div>
                                <div style={{ color: "rgba(255,255,255,0.52)" }}>Subtotal</div>
                                <div style={{ marginTop: "4px", fontWeight: 700 }}>
                                  {formatPrice(Number(item.precio) * Number(item.cantidad))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default AdminPedidosEntregados;