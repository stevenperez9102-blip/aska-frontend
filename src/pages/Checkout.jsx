import { useContext, useEffect, useMemo, useState } from "react";
import { CartContext } from "../context/CartContext";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function Checkout() {
  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const usuario = (() => {
    try {
      return JSON.parse(localStorage.getItem("usuario")) || null;
    } catch {
      return null;
    }
  })();

  const [form, setForm] = useState({
    nombre: usuario?.nombre || "",
    correo: usuario?.correo || "",
    telefono: "",
    direccion: "",
    ciudad: "",
  });

  const [metodosPago, setMetodosPago] = useState([]);
  const [loadingMetodos, setLoadingMetodos] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const total = useMemo(() => {
    return cart.reduce(
      (acc, item) =>
        acc +
        Number(item.price || item.precio || 0) *
          Number(item.quantity || item.cantidad || 0),
      0
    );
  }, [cart]);

  useEffect(() => {
    const cargarMetodosPago = async () => {
      try {
        const response = await fetch("https://aska-backend-nyx8.onrender.com/api/metodos-pago");

        let data = [];
        try {
          data = await response.json();
        } catch {
          data = [];
        }

        if (!response.ok) {
          setMetodosPago([]);
          return;
        }

        setMetodosPago(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error cargando métodos de pago:", error);
        setMetodosPago([]);
      } finally {
        setLoadingMetodos(false);
      }
    };

    cargarMetodosPago();
  }, []);

  const handleChange = (e) => {
    setMensaje("");
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cart.length) {
      setMensaje("El carrito está vacío.");
      return;
    }

    if (
      !form.nombre.trim() ||
      !form.correo.trim() ||
      !form.telefono.trim() ||
      !form.direccion.trim() ||
      !form.ciudad.trim()
    ) {
      setMensaje("Completa todos los campos.");
      return;
    }

    try {
      setLoading(true);

      const productosNormalizados = cart
        .map((item) => {
          const productoId = Number(
            item.id || item.producto_id || item.productId || 0
          );
          const nombre = item.name || item.nombre || "Producto";
          const precio = Number(item.price || item.precio || 0);
          const cantidad = Number(item.quantity || item.cantidad || 0);

          return {
            id: productoId,
            producto_id: productoId,
            nombre,
            name: nombre,
            precio,
            price: precio,
            cantidad,
            quantity: cantidad,
            imagen: item.image || item.imagen || "",
            image: item.image || item.imagen || "",
            categoria: item.category || item.categoria || "",
            category: item.category || item.categoria || "",
          };
        })
        .filter((item) => item.id && item.cantidad > 0);

      if (!productosNormalizados.length) {
        setMensaje("No fue posible preparar los productos del pedido.");
        return;
      }

      const response = await fetch("https://aska-backend-nyx8.onrender.com/api/pedidos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario_id: usuario?.id || null,

          cliente: {
            nombre: form.nombre.trim(),
            correo: form.correo.trim(),
            telefono: form.telefono.trim(),
            direccion: form.direccion.trim(),
            ciudad: form.ciudad.trim(),
          },

          nombre: form.nombre.trim(),
          correo: form.correo.trim(),
          telefono: form.telefono.trim(),
          direccion: form.direccion.trim(),
          ciudad: form.ciudad.trim(),

          productos: productosNormalizados,
          total,
          estado_pago: "pendiente",
        }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setMensaje(data.mensaje || "No fue posible crear el pedido.");
        return;
      }

      const pedidoId = data.pedidoId || data.id;

      if (!pedidoId) {
        setMensaje("Pedido creado, pero no se recibió el ID del pedido.");
        return;
      }

      const pagoResponse = await fetch(
        "https://aska-backend-nyx8.onrender.com/api/bold/crear-link-pago",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pedidoId,
            total,
            nombre: form.nombre.trim(),
            correo: form.correo.trim(),
          }),
        }
      );

      let pagoData = {};
      try {
        pagoData = await pagoResponse.json();
      } catch {
        pagoData = {};
      }

      if (!pagoResponse.ok || !pagoData.url) {
        setMensaje("Pedido creado, pero no fue posible generar el link de pago.");
        return;
      }

      // No limpiamos el carrito aquí.
      // Solo debe limpiarse cuando Bold confirme el pago.
      window.location.href = pagoData.url;
    } catch (error) {
      console.error("Error creando pedido:", error);
      setMensaje("Error creando el pedido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <section
        style={{
          minHeight: "100vh",
          background: "#f5f5f5",
          color: "#111",
          padding: "40px 24px 80px",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "24px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "24px",
              padding: "28px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
            }}
          >
            <h1
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                marginTop: 0,
                marginBottom: "10px",
              }}
            >
              Finalizar compra
            </h1>

            <p
              style={{
                color: "#666",
                lineHeight: 1.6,
                marginTop: 0,
                marginBottom: "22px",
              }}
            >
              Completa tus datos. Tu pedido quedará registrado con pago pendiente
              mientras confirmas el pago por el método disponible.
            </p>

            {mensaje && (
              <p
                style={{
                  marginBottom: "18px",
                  color: mensaje.includes("correctamente")
                    ? "#356f48"
                    : "#9b243c",
                  fontWeight: 600,
                }}
              >
                {mensaje}
              </p>
            )}

            <form
              onSubmit={handleSubmit}
              style={{
                display: "grid",
                gap: "14px",
              }}
            >
              <input
                name="nombre"
                placeholder="Nombre completo"
                value={form.nombre}
                onChange={handleChange}
                required
                style={inputStyle}
              />

              <input
                name="correo"
                placeholder="Correo"
                value={form.correo}
                onChange={handleChange}
                required
                style={inputStyle}
              />

              <input
                name="telefono"
                placeholder="Teléfono"
                value={form.telefono}
                onChange={handleChange}
                required
                style={inputStyle}
              />

              <input
                name="direccion"
                placeholder="Dirección"
                value={form.direccion}
                onChange={handleChange}
                required
                style={inputStyle}
              />

              <input
                name="ciudad"
                placeholder="Ciudad"
                value={form.ciudad}
                onChange={handleChange}
                required
                style={inputStyle}
              />

              <div
                style={{
                  marginTop: "10px",
                  padding: "20px",
                  borderRadius: "22px",
                  background: "#f7f7f7",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    marginBottom: "8px",
                    fontSize: "1.35rem",
                  }}
                >
                  Métodos de pago
                </h2>

                <p
                  style={{
                    margin: 0,
                    marginBottom: "16px",
                    color: "#666",
                    lineHeight: 1.6,
                  }}
                >
                  Al confirmar tu pedido, serás redirigido a Bold para realizar
                  el pago de forma segura.
                </p>

                {loadingMetodos ? (
                  <p style={{ margin: 0, color: "#666" }}>
                    Cargando métodos de pago...
                  </p>
                ) : metodosPago.length === 0 ? (
                  <div
                    style={{
                      borderRadius: "16px",
                      padding: "14px",
                      background: "#fff",
                      border: "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    <strong>Pago seguro con Bold</strong>
                    <p
                      style={{
                        margin: 0,
                        marginTop: "6px",
                        color: "#666",
                        lineHeight: 1.5,
                      }}
                    >
                      Tu pedido se creará y luego pasarás a la plataforma de
                      pago.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "12px" }}>
                    {metodosPago.map((metodo) => (
                      <div
                        key={metodo.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: metodo.qr_url
                            ? "1fr 120px"
                            : "1fr",
                          gap: "14px",
                          alignItems: "center",
                          borderRadius: "18px",
                          padding: "16px",
                          background: "#fff",
                          border: "1px solid rgba(0,0,0,0.08)",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              alignItems: "center",
                              flexWrap: "wrap",
                              marginBottom: "6px",
                            }}
                          >
                            <strong style={{ fontSize: "1.05rem" }}>
                              {metodo.nombre}
                            </strong>

                            {metodo.tipo && (
                              <span
                                style={{
                                  fontSize: "0.78rem",
                                  padding: "4px 8px",
                                  borderRadius: "999px",
                                  background: "#111",
                                  color: "#fff",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.08em",
                                }}
                              >
                                {metodo.tipo}
                              </span>
                            )}
                          </div>

                          {metodo.titular && (
                            <p style={paymentTextStyle}>
                              <strong>Titular:</strong> {metodo.titular}
                            </p>
                          )}

                          {metodo.numero && (
                            <p style={paymentTextStyle}>
                              <strong>Número / cuenta:</strong> {metodo.numero}
                            </p>
                          )}

                          {metodo.descripcion && (
                            <p
                              style={{
                                ...paymentTextStyle,
                                lineHeight: 1.5,
                              }}
                            >
                              {metodo.descripcion}
                            </p>
                          )}
                        </div>

                        {metodo.qr_url && (
                          <img
                            src={metodo.qr_url}
                            alt={`QR ${metodo.nombre}`}
                            style={{
                              width: "120px",
                              height: "120px",
                              objectFit: "cover",
                              borderRadius: "14px",
                              border: "1px solid rgba(0,0,0,0.08)",
                              background: "#f3f3f3",
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  border: "none",
                  borderRadius: "999px",
                  padding: "14px 22px",
                  background: "#111",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  marginTop: "4px",
                  opacity: loading ? 0.75 : 1,
                }}
              >
                {loading ? "Procesando pago..." : "Confirmar pedido y pagar"}
              </button>
            </form>
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: "24px",
              padding: "28px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
              alignSelf: "start",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "18px" }}>Resumen</h2>

            {cart.length === 0 ? (
              <p>Tu carrito está vacío.</p>
            ) : (
              <>
                <div style={{ display: "grid", gap: "14px" }}>
                  {cart.map((item) => (
                    <div
                      key={item.id || item.producto_id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "70px 1fr auto",
                        gap: "14px",
                        alignItems: "center",
                        borderBottom: "1px solid rgba(0,0,0,0.08)",
                        paddingBottom: "12px",
                      }}
                    >
                      <img
                        src={item.image || item.imagen}
                        alt={item.name || item.nombre}
                        style={{
                          width: "70px",
                          height: "70px",
                          objectFit: "cover",
                          borderRadius: "14px",
                        }}
                      />

                      <div>
                        <div style={{ fontWeight: 700 }}>
                          {item.name || item.nombre}
                        </div>
                        <div style={{ color: "#666" }}>
                          Cantidad: {item.quantity || item.cantidad}
                        </div>
                      </div>

                      <div style={{ fontWeight: 700 }}>
                        {formatPrice(
                          Number(item.price || item.precio || 0) *
                            Number(item.quantity || item.cantidad || 0)
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: "18px",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "1.2rem",
                    fontWeight: 700,
                  }}
                >
                  <span>Total:</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <div
                  style={{
                    marginTop: "20px",
                    padding: "16px",
                    borderRadius: "18px",
                    background: "#f7f7f7",
                    border: "1px solid rgba(0,0,0,0.08)",
                    color: "#555",
                    lineHeight: 1.55,
                  }}
                >
                  Tu pedido se registrará como{" "}
                  <strong>pago pendiente</strong>. Cuando el pago sea confirmado,
                  AŞKA actualizará el estado desde administración.
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

const inputStyle = {
  width: "100%",
  border: "1px solid rgba(0,0,0,0.12)",
  borderRadius: "14px",
  padding: "14px 16px",
  fontSize: "1rem",
  outline: "none",
};

const paymentTextStyle = {
  margin: 0,
  marginTop: "5px",
  color: "#555",
};

export default Checkout;