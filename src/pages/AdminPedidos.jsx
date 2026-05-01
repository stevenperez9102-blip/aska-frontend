import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import ConfirmModal from "../components/ConfirmModal";

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

function normalizarTelefono(telefono = "") {
  const limpio = String(telefono).replace(/\D/g, "");
  if (!limpio) return "";
  return limpio.startsWith("57") ? limpio : `57${limpio}`;
}

function estadoBadgeStyles(estado) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "999px",
    padding: "6px 12px",
    fontSize: "0.88rem",
    fontWeight: 700,
    letterSpacing: "0.2px",
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

function topLinkButton(active = false) {
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

  if (type === "warning") {
    return {
      ...common,
      background: "rgba(197, 167, 90, 0.18)",
      color: "#e8c97a",
      border: "1px solid rgba(232, 201, 122, 0.25)",
    };
  }

  if (type === "info") {
    return {
      ...common,
      background: "rgba(96, 130, 193, 0.18)",
      color: "#a9c7ff",
      border: "1px solid rgba(169, 199, 255, 0.25)",
    };
  }

  if (type === "success") {
    return {
      ...common,
      background: "#6f5491",
      color: "#fff",
    };
  }

  if (type === "whatsapp") {
    return {
      ...common,
      background: "#1f8f5f",
      color: "#fff",
    };
  }

  return {
    ...common,
    background: "#1f1f1f",
    color: "#fff",
  };
}

function AdminPedidos() {
  const [todosPedidos, setTodosPedidos] = useState([]);
  const [detalles, setDetalles] = useState({});
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [noticeType, setNoticeType] = useState("success");
  const [vista, setVista] = useState("activos");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "Aceptar",
    cancelText: "Cancelar",
    danger: false,
  });

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://aska-backend-nyx8.onrender.com/api/pedidos");
      const data = await res.json();

      setTodosPedidos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
      setNoticeType("error");
      setMensaje("No fue posible cargar los pedidos.");
      setTodosPedidos([]);
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

  const pedidos = useMemo(() => {
    if (vista === "entregados") {
      return todosPedidos.filter((pedido) => pedido.estado === "entregado");
    }

    return todosPedidos.filter((pedido) => pedido.estado !== "entregado");
  }, [todosPedidos, vista]);

  const resumen = useMemo(() => {
    const activos = todosPedidos.filter((p) => p.estado !== "entregado");
    const entregados = todosPedidos.filter((p) => p.estado === "entregado");

    const totalPedidos = activos.length;
    const recibidos = activos.filter((p) => p.estado === "recibido").length;
    const espera = activos.filter((p) => p.estado === "en espera").length;
    const enviados = activos.filter((p) => p.estado === "enviado").length;

    return {
      totalPedidos,
      recibidos,
      espera,
      enviados,
      entregados: entregados.length,
    };
  }, [todosPedidos]);

  const abrirModal = ({
    title,
    message,
    onConfirm,
    confirmText = "Aceptar",
    cancelText = "Cancelar",
    danger = false,
  }) => {
    setModalConfig({
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
      danger,
    });
    setModalOpen(true);
  };

  const cerrarModal = () => setModalOpen(false);

  const confirmarModal = async () => {
    if (typeof modalConfig.onConfirm === "function") {
      await modalConfig.onConfirm();
    }
    setModalOpen(false);
  };

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
      setNoticeType("error");
      setMensaje("No fue posible cargar el detalle del pedido.");
    }
  };

  const actualizarEstado = async (pedidoId, estado) => {
    try {
      const response = await fetch(
        `https://aska-backend-nyx8.onrender.com/api/pedidos/${pedidoId}/estado`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ estado }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setNoticeType("error");
        setMensaje(data.mensaje || "No fue posible actualizar el estado.");
        return;
      }

      setNoticeType("success");
      setMensaje(data.mensaje || "Estado actualizado correctamente.");
      await cargarPedidos();

      if (estado === "entregado") {
        setVista("entregados");
      }
    } catch (error) {
      console.error("Error actualizando estado:", error);
      setNoticeType("error");
      setMensaje("Ocurrió un error actualizando el estado del pedido.");
    }
  };

  const tituloPagina =
    vista === "entregados" ? "Pedidos entregados" : "Pedidos recibidos";

  const textoPagina =
    vista === "entregados"
      ? "Consulta el historial de pedidos entregados y revisa sus detalles cuando lo necesites."
      : "Gestiona pedidos activos, revisa detalles, da seguimiento por WhatsApp y mueve cada orden entre recibido, en espera, enviado y entregado.";

  return (
    <>
      <Navbar />

      <ConfirmModal
        open={modalOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        danger={modalConfig.danger}
        onConfirm={confirmarModal}
        onCancel={cerrarModal}
      />

      {mensaje && (
        <div
          style={{
            position: "fixed",
            top: "92px",
            right: "24px",
            zIndex: 9998,
            background:
              noticeType === "error"
                ? "rgba(122, 47, 67, 0.96)"
                : "rgba(111, 84, 145, 0.96)",
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
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
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
              {tituloPagina}
            </h1>

            <p
              style={{
                marginTop: "12px",
                color: "rgba(255,255,255,0.68)",
                maxWidth: "760px",
                lineHeight: 1.7,
              }}
            >
              {textoPagina}
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
            <Link to="/admin/productos">
              <button style={topLinkButton(false)}>Gestión de productos</button>
            </Link>

            <button
              type="button"
              onClick={() => setVista("activos")}
              style={topLinkButton(vista === "activos")}
            >
              Pedidos recibidos
            </button>

            <button
              type="button"
              onClick={() => setVista("entregados")}
              style={topLinkButton(vista === "entregados")}
            >
              Pedidos entregados
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginBottom: "30px",
            }}
          >
            {[
              { label: "Pedidos activos", value: resumen.totalPedidos },
              { label: "Recibidos", value: resumen.recibidos },
              { label: "En espera", value: resumen.espera },
              { label: "Enviados", value: resumen.enviados },
              { label: "Entregados", value: resumen.entregados },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: "#0f0f0f",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "24px",
                  padding: "20px",
                }}
              >
                <p
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    margin: 0,
                    marginBottom: "8px",
                  }}
                >
                  {item.label}
                </p>
                <h3 style={{ margin: 0, fontSize: "2rem" }}>{item.value}</h3>
              </div>
            ))}
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
              Cargando pedidos...
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
              {vista === "entregados"
                ? "No hay pedidos entregados en este momento."
                : "No hay pedidos activos en este momento."}
            </div>
          ) : (
            <div style={{ display: "grid", gap: "18px" }}>
              {pedidos.map((pedido) => {
                const telefonoWhatsApp = normalizarTelefono(pedido.telefono);
                const waLink = telefonoWhatsApp
                  ? `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(`Hola ${pedido.nombre} ✨%0A%0ATu pedido #${pedido.id} en AŞKA está en estado: ${pedido.estado.toUpperCase()} 🛍️%0A%0ATotal: ${formatPrice(pedido.total)}%0A%0ACualquier duda estamos atentos 💎`)}`
                  : null;

                return (
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
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <h3
                            style={{
                              margin: 0,
                              fontSize: "1.6rem",
                              lineHeight: 1.1,
                            }}
                          >
                            {pedido.nombre}
                          </h3>

                          {!pedido.usuario_id && (
                            <span
                              style={{
                                background: "rgba(255,255,255,0.08)",
                                border: "1px solid rgba(255,255,255,0.18)",
                                color: "#f5f5f5",
                                borderRadius: "999px",
                                padding: "4px 10px",
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                letterSpacing: "0.1em",
                              }}
                            >
                              INVITADO
                            </span>
                          )}
                        </div>
                      </div>

                      <span style={estadoBadgeStyles(pedido.estado)}>
                        {pedido.estado}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "12px",
                        marginBottom: "20px",
                      }}
                    >
                      <div>
                        <strong>Correo:</strong>
                        <div
                          style={{
                            marginTop: "4px",
                            color: "rgba(255,255,255,0.72)",
                          }}
                        >
                          {pedido.correo}
                        </div>
                      </div>

                      <div>
                        <strong>Teléfono:</strong>
                        <div
                          style={{
                            marginTop: "4px",
                            color: "rgba(255,255,255,0.72)",
                          }}
                        >
                          {pedido.telefono}
                        </div>
                      </div>

                      <div>
                        <strong>Ciudad:</strong>
                        <div
                          style={{
                            marginTop: "4px",
                            color: "rgba(255,255,255,0.72)",
                          }}
                        >
                          {pedido.ciudad}
                        </div>
                      </div>

                      <div>
                        <strong>Dirección:</strong>
                        <div
                          style={{
                            marginTop: "4px",
                            color: "rgba(255,255,255,0.72)",
                          }}
                        >
                          {pedido.direccion}
                        </div>
                      </div>

                      <div>
                        <strong>Total:</strong>
                        <div
                          style={{
                            marginTop: "4px",
                            color: "#f3e6ff",
                            fontWeight: 700,
                          }}
                        >
                          {formatPrice(pedido.total)}
                        </div>
                      </div>

                      <div>
                        <strong>Fecha:</strong>
                        <div
                          style={{
                            marginTop: "4px",
                            color: "rgba(255,255,255,0.72)",
                          }}
                        >
                          {formatDate(pedido.fecha)}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "10px",
                        marginBottom: detalles[pedido.id] ? "18px" : 0,
                      }}
                    >
                      <button
                        onClick={() => verDetalle(pedido.id)}
                        style={actionButtonStyles("secondary")}
                      >
                        {detalles[pedido.id] ? "Ocultar detalle" : "Ver detalle"}
                      </button>

                      {waLink && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noreferrer"
                          style={{ textDecoration: "none" }}
                        >
                          <button style={actionButtonStyles("whatsapp")}>
                            WhatsApp
                          </button>
                        </a>
                      )}

                      {vista !== "entregados" && (
                        <>
                          <button
                            onClick={() =>
                              abrirModal({
                                title: "¿Mover pedido a en espera?",
                                message: `Se actualizará el pedido #${pedido.id} de ${pedido.nombre} al estado "en espera".`,
                                confirmText: "Sí, mover",
                                onConfirm: () =>
                                  actualizarEstado(pedido.id, "en espera"),
                              })
                            }
                            style={actionButtonStyles("warning")}
                          >
                            En espera
                          </button>

                          <button
                            onClick={() =>
                              abrirModal({
                                title: "¿Marcar pedido como enviado?",
                                message: `El pedido #${pedido.id} quedará con estado "enviado".`,
                                confirmText: "Sí, enviar",
                                onConfirm: () =>
                                  actualizarEstado(pedido.id, "enviado"),
                              })
                            }
                            style={actionButtonStyles("info")}
                          >
                            Enviado
                          </button>

                          <button
                            onClick={() =>
                              abrirModal({
                                title: "¿Confirmar entrega del pedido?",
                                message: `El pedido #${pedido.id} pasará a "entregado" y dejará de mostrarse en pedidos recibidos.`,
                                confirmText: "Sí, entregar",
                                onConfirm: () =>
                                  actualizarEstado(pedido.id, "entregado"),
                              })
                            }
                            style={actionButtonStyles("success")}
                          >
                            Entregado
                          </button>
                        </>
                      )}
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
                            {detalles[pedido.id].map((item) => (
                              <div
                                key={item.id}
                                style={{
                                  background: "#111",
                                  border: "1px solid rgba(255,255,255,0.06)",
                                  borderRadius: "20px",
                                  padding: "16px",
                                  display: "grid",
                                  gridTemplateColumns:
                                    "1.4fr 0.8fr 0.8fr 0.8fr",
                                  gap: "12px",
                                }}
                              >
                                <div>
                                  <div style={{ fontWeight: 700 }}>
                                    {item.nombre}
                                  </div>
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
                                  <div
                                    style={{ color: "rgba(255,255,255,0.52)" }}
                                  >
                                    Cantidad
                                  </div>
                                  <div
                                    style={{ marginTop: "4px", fontWeight: 600 }}
                                  >
                                    {item.cantidad}
                                  </div>
                                </div>

                                <div>
                                  <div
                                    style={{ color: "rgba(255,255,255,0.52)" }}
                                  >
                                    Precio
                                  </div>
                                  <div
                                    style={{ marginTop: "4px", fontWeight: 600 }}
                                  >
                                    {formatPrice(item.precio)}
                                  </div>
                                </div>

                                <div>
                                  <div
                                    style={{ color: "rgba(255,255,255,0.52)" }}
                                  >
                                    Subtotal
                                  </div>
                                  <div
                                    style={{ marginTop: "4px", fontWeight: 700 }}
                                  >
                                    {formatPrice(
                                      Number(item.precio) *
                                        Number(item.cantidad)
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

export default AdminPedidos;