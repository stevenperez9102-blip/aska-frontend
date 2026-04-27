import { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";

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

function estadoStyle(estado) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "999px",
    padding: "8px 14px",
    fontSize: "0.88rem",
    fontWeight: 700,
    textTransform: "capitalize",
  };

  if (estado === "recibido") {
    return {
      ...base,
      background: "rgba(255,255,255,0.08)",
      color: "#f5f5f5",
      border: "1px solid rgba(255,255,255,0.12)",
    };
  }

  if (estado === "en espera") {
    return {
      ...base,
      background: "rgba(197, 167, 90, 0.18)",
      color: "#e8c97a",
      border: "1px solid rgba(232, 201, 122, 0.28)",
    };
  }

  if (estado === "enviado") {
    return {
      ...base,
      background: "rgba(96, 130, 193, 0.18)",
      color: "#a9c7ff",
      border: "1px solid rgba(169, 199, 255, 0.28)",
    };
  }

  return {
    ...base,
    background: "rgba(93, 170, 117, 0.18)",
    color: "#9ce0ad",
    border: "1px solid rgba(156, 224, 173, 0.28)",
  };
}

function normalizarEstadoPago(estado) {
  const e = String(estado || "").toLowerCase().trim();

  if (e === "pagado" || e === "approved" || e === "aprobado") {
    return "pagado";
  }

  if (
    e === "rechazado" ||
    e === "rejected" ||
    e === "fallido" ||
    e === "failed" ||
    e === "declined"
  ) {
    return "rechazado";
  }

  return "pendiente";
}

function estadoPagoStyle(estado) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "999px",
    padding: "8px 14px",
    fontSize: "0.88rem",
    fontWeight: 700,
    textTransform: "capitalize",
  };

  if (estado === "pagado") {
    return {
      ...base,
      background: "rgba(93, 170, 117, 0.18)",
      color: "#9ce0ad",
      border: "1px solid rgba(156, 224, 173, 0.28)",
    };
  }

  if (estado === "rechazado") {
    return {
      ...base,
      background: "rgba(211, 83, 83, 0.18)",
      color: "#ff9f9f",
      border: "1px solid rgba(255, 159, 159, 0.3)",
    };
  }

  return {
    ...base,
    background: "rgba(197, 167, 90, 0.18)",
    color: "#e8c97a",
    border: "1px solid rgba(232, 201, 122, 0.28)",
  };
}

function MisPedidos() {
  const { cart, clearCart } = useContext(CartContext);

  const usuario = (() => {
    try {
      return JSON.parse(localStorage.getItem("usuario")) || null;
    } catch {
      return null;
    }
  })();

  const [pedidos, setPedidos] = useState([]);
  const [detalles, setDetalles] = useState({});
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const cargarPedidos = async () => {
    if (!usuario) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      let data = [];

      if (usuario?.id) {
        const response = await fetch(
          `https://aska-backend-nyx8.onrender.com/api/mis-pedidos/${usuario.id}`
        );

        if (response.ok) {
          try {
            data = await response.json();
          } catch {
            data = [];
          }
        }
      }

      if (!data || data.length === 0) {
        const responseAll = await fetch("https://aska-backend-nyx8.onrender.com/api/pedidos");

        if (responseAll.ok) {
          let todos = [];

          try {
            todos = await responseAll.json();
          } catch {
            todos = [];
          }

          data = (todos || []).filter(
            (p) =>
              String(p.correo || "").toLowerCase().trim() ===
              String(usuario.correo || "").toLowerCase().trim()
          );
        }
      }

      setPedidos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando mis pedidos:", error);
      setMensaje("No fue posible cargar tus pedidos.");
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

  useEffect(() => {
    if (!usuario || !cart.length || !pedidos.length) return;

    const pedidoPagado = pedidos.find(
      (pedido) => normalizarEstadoPago(pedido.estado_pago) === "pagado"
    );

    if (!pedidoPagado) return;

    const key = `aska_carrito_limpiado_${usuario.id}_${pedidoPagado.id}`;

    if (localStorage.getItem(key)) return;

    clearCart();
    localStorage.setItem(key, "true");
    setMensaje("Pago confirmado. Tu carrito fue limpiado correctamente.");
  }, [pedidos, cart.length, usuario, clearCart]);

  const verDetalle = async (pedidoId) => {
    if (!usuario) return;

    if (detalles[pedidoId]) {
      setDetalles((prev) => ({
        ...prev,
        [pedidoId]: null,
      }));
      return;
    }

    try {
      let data = null;
      let ok = false;

      if (usuario?.id) {
        const response = await fetch(
          `https://aska-backend-nyx8.onrender.com/api/mis-pedidos/${usuario.id}/${pedidoId}/detalle`
        );

        ok = response.ok;

        try {
          data = await response.json();
        } catch {
          data = null;
        }
      }

      if (!ok) {
        const responseAdminDetail = await fetch(
          `https://aska-backend-nyx8.onrender.com/api/pedidos/${pedidoId}/detalle`
        );

        ok = responseAdminDetail.ok;

        try {
          data = await responseAdminDetail.json();
        } catch {
          data = null;
        }
      }

      if (!ok) {
        setMensaje(data?.mensaje || "No fue posible cargar el detalle del pedido.");
        return;
      }

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
          background: "linear-gradient(180deg, #060606 0%, #111 100%)",
          color: "#fff",
          padding: "38px 24px 60px",
        }}
      >
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
          <div style={{ marginBottom: "28px" }}>
            <p
              style={{
                color: "rgba(255,255,255,0.58)",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: "0.82rem",
                marginBottom: "8px",
              }}
            >
              Mi cuenta
            </p>

            <h1
              style={{
                fontSize: "clamp(2rem, 5vw, 3.6rem)",
                lineHeight: 1.05,
                margin: 0,
              }}
            >
              Mis pedidos
            </h1>

            <p
              style={{
                marginTop: "12px",
                color: "rgba(255,255,255,0.68)",
                maxWidth: "760px",
                lineHeight: 1.7,
              }}
            >
              Aquí puedes revisar el estado de tus compras y abrir seguimiento
              directo por WhatsApp.
            </p>
          </div>

          {!usuario ? (
            <div
              style={{
                background: "#0f0f0f",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "28px",
                padding: "28px",
                display: "grid",
                gap: "14px",
              }}
            >
              <p style={{ margin: 0 }}>Debes iniciar sesión para ver tus pedidos.</p>
              <div>
                <Link to="/login">
                  <button
                    style={{
                      border: "none",
                      borderRadius: "999px",
                      padding: "12px 18px",
                      fontWeight: 700,
                      cursor: "pointer",
                      background: "#fff",
                      color: "#111",
                    }}
                  >
                    Ir a iniciar sesión
                  </button>
                </Link>
              </div>
            </div>
          ) : loading ? (
            <div
              style={{
                background: "#0f0f0f",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "28px",
                padding: "28px",
              }}
            >
              Cargando tus pedidos...
            </div>
          ) : pedidos.length === 0 ? (
            <div
              style={{
                background: "#0f0f0f",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "28px",
                padding: "28px",
                display: "grid",
                gap: "14px",
              }}
            >
              <p style={{ margin: 0 }}>
                Aún no tienes pedidos registrados con esta cuenta.
              </p>
              <div>
                <Link to="/catalogo">
                  <button
                    style={{
                      border: "none",
                      borderRadius: "999px",
                      padding: "12px 18px",
                      fontWeight: 700,
                      cursor: "pointer",
                      background: "#fff",
                      color: "#111",
                    }}
                  >
                    Ir al catálogo
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "18px" }}>
              {pedidos.map((pedido) => {
                const estadoPago = normalizarEstadoPago(pedido.estado_pago);

                const wa = `https://wa.me/573125183100?text=${encodeURIComponent(
                  `Hola AŞKA, quiero hacer seguimiento a mi pedido #${pedido.id}. Estado actual: ${pedido.estado}. Pago: ${estadoPago}.`
                )}`;

                return (
                  <article
                    key={pedido.id}
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(18,18,18,0.98) 0%, rgba(9,9,9,0.98) 100%)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "28px",
                      padding: "24px",
                      boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
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
                            fontSize: "1.55rem",
                            lineHeight: 1.1,
                          }}
                        >
                          {pedido.nombre || "Pedido realizado"}
                        </h3>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span style={estadoStyle(pedido.estado)}>
                          {pedido.estado}
                        </span>

                        <span style={estadoPagoStyle(estadoPago)}>
                          {estadoPago}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "12px",
                        marginBottom: "18px",
                      }}
                    >
                      <div
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: "18px",
                          padding: "14px",
                        }}
                      >
                        <strong>Total</strong>
                        <div
                          style={{
                            marginTop: "6px",
                            color: "#f3e6ff",
                            fontWeight: 700,
                          }}
                        >
                          {formatPrice(pedido.total)}
                        </div>
                      </div>

                      <div
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: "18px",
                          padding: "14px",
                        }}
                      >
                        <strong>Fecha</strong>
                        <div
                          style={{
                            marginTop: "6px",
                            color: "rgba(255,255,255,0.72)",
                          }}
                        >
                          {formatDate(pedido.fecha)}
                        </div>
                      </div>

                      <div
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: "18px",
                          padding: "14px",
                        }}
                      >
                        <strong>Ciudad</strong>
                        <div
                          style={{
                            marginTop: "6px",
                            color: "rgba(255,255,255,0.72)",
                          }}
                        >
                          {pedido.ciudad}
                        </div>
                      </div>

                      <div
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: "18px",
                          padding: "14px",
                        }}
                      >
                        <strong>Dirección</strong>
                        <div
                          style={{
                            marginTop: "6px",
                            color: "rgba(255,255,255,0.72)",
                          }}
                        >
                          {pedido.direccion}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                        marginBottom: detalles[pedido.id] ? "18px" : 0,
                      }}
                    >
                      <button
                        onClick={() => verDetalle(pedido.id)}
                        style={{
                          border: "none",
                          borderRadius: "999px",
                          padding: "10px 16px",
                          fontWeight: 700,
                          cursor: "pointer",
                          background: "rgba(255,255,255,0.08)",
                          color: "#f3f3f3",
                        }}
                      >
                        {detalles[pedido.id] ? "Ocultar detalle" : "Ver detalle"}
                      </button>

                      <a
                        href={wa}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: "none" }}
                      >
                        <button
                          style={{
                            border: "none",
                            borderRadius: "999px",
                            padding: "10px 16px",
                            fontWeight: 700,
                            cursor: "pointer",
                            background: "#1f8f5f",
                            color: "#fff",
                          }}
                        >
                          Seguimiento por WhatsApp
                        </button>
                      </a>
                    </div>

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
                            {detalles[pedido.id].map((item, index) => (
                              <div
                                key={item.id || `${pedido.id}-${index}`}
                                style={{
                                  background: "#111",
                                  border: "1px solid rgba(255,255,255,0.06)",
                                  borderRadius: "20px",
                                  padding: "16px",
                                  display: "grid",
                                  gridTemplateColumns:
                                    "minmax(84px, 84px) minmax(0, 1.5fr) repeat(3, minmax(90px, 1fr))",
                                  gap: "14px",
                                  alignItems: "center",
                                }}
                              >
                                <div
                                  style={{
                                    width: "84px",
                                    height: "84px",
                                    borderRadius: "16px",
                                    overflow: "hidden",
                                    background: "#1d1d1d",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {item.imagen ? (
                                    <img
                                      src={item.imagen}
                                      alt={item.nombre}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        display: "block",
                                      }}
                                    />
                                  ) : (
                                    <div
                                      style={{
                                        color: "rgba(255,255,255,0.35)",
                                        fontSize: "0.75rem",
                                        textAlign: "center",
                                        padding: "8px",
                                      }}
                                    >
                                      Sin imagen
                                    </div>
                                  )}
                                </div>

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
                                  <div style={{ color: "rgba(255,255,255,0.52)" }}>
                                    Cantidad
                                  </div>
                                  <div style={{ marginTop: "4px", fontWeight: 600 }}>
                                    {item.cantidad}
                                  </div>
                                </div>

                                <div>
                                  <div style={{ color: "rgba(255,255,255,0.52)" }}>
                                    Precio
                                  </div>
                                  <div style={{ marginTop: "4px", fontWeight: 600 }}>
                                    {formatPrice(item.precio)}
                                  </div>
                                </div>

                                <div>
                                  <div style={{ color: "rgba(255,255,255,0.52)" }}>
                                    Subtotal
                                  </div>
                                  <div style={{ marginTop: "4px", fontWeight: 700 }}>
                                    {formatPrice(
                                      Number(item.precio) * Number(item.cantidad)
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default MisPedidos;