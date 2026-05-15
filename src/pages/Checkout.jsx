import { useContext, useEffect, useMemo, useState } from "react";
import { CartContext } from "../context/CartContext";
import Navbar from "../components/Navbar";

const API_URL = "https://aska-backend-nyx8.onrender.com";
const SHIPPING_COST = 10000;
const REQUEST_TIMEOUT = 30000;

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

async function fetchWithTimeout(url, options = {}, timeout = REQUEST_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function readJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function Checkout() {
  const { cart } = useContext(CartContext);

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
  const [cupon, setCupon] = useState("");
  const [cuponAplicado, setCuponAplicado] = useState(null);
  const [loading, setLoading] = useState(false);

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  const subtotal = useMemo(() => {
    return cart.reduce(
      (acc, item) =>
        acc +
        Number(item.price || item.precio || 0) *
          Number(item.quantity || item.cantidad || 0),
      0
    );
  }, [cart]);

  const descuento = useMemo(() => {
    if (!cuponAplicado) return 0;
    const porcentaje = Number(cuponAplicado.descuento_porcentaje || 0);
    return Math.round((subtotal * porcentaje) / 100);
  }, [cuponAplicado, subtotal]);

  const totalPedido = useMemo(() => {
    return Math.max(0, Math.round(subtotal + SHIPPING_COST - descuento));
  }, [subtotal, descuento]);

  useEffect(() => {
    const cargarMetodosPago = async () => {
      try {
        const response = await fetchWithTimeout(`${API_URL}/api/metodos-pago`, {}, 15000);
        const data = await readJsonSafe(response);

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

  const aplicarCupon = async () => {
    const codigo = cupon.trim().toUpperCase();
    if (!codigo) return;

    try {
      setMensaje("");
      const res = await fetchWithTimeout(`${API_URL}/api/cupones/${codigo}`, {}, 15000);
      const data = await readJsonSafe(res);

      if (!res.ok || !data?.cupon) {
        setCuponAplicado(null);
        setMensaje(data?.mensaje || "Cupón inválido o expirado");
        return;
      }

      setCuponAplicado(data.cupon);
      setMensaje("Cupón aplicado correctamente");
    } catch (error) {
      console.error("Error aplicando cupón:", error);
      setCuponAplicado(null);
      setMensaje("Error aplicando cupón. Inténtalo nuevamente.");
    }
  };

  const guardarIntento = async () => {
    try {
      await fetchWithTimeout(
        `${API_URL}/api/lead-carrito`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: form.nombre.trim(),
            correo: form.correo.trim(),
            carrito: cart,
            total: totalPedido,
          }),
        },
        12000
      );
    } catch (error) {
      console.log("lead no guardado", error?.message || error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!cart.length) {
      setMensaje("El carrito está vacío.");
      return;
    }

    const nombreFinal = form.nombre.trim();
    const correoFinal = form.correo.trim().toLowerCase();
    const telefonoFinal = form.telefono.trim();
    const direccionFinal = form.direccion.trim();
    const ciudadFinal = form.ciudad.trim();

    if (!nombreFinal || !correoFinal || !telefonoFinal || !direccionFinal || !ciudadFinal) {
      setMensaje("Completa todos los campos.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoFinal)) {
      setMensaje("Ingresa un correo electrónico válido.");
      return;
    }

    try {
      setLoading(true);
      setMensaje("Preparando tu pedido seguro...");

      await guardarIntento();

      const productosNormalizados = cart
        .map((item) => {
          const productoId = Number(item.id || item.producto_id || item.productId || 0);
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
        .filter((item) => item.id && item.cantidad > 0 && item.precio >= 0);

      if (!productosNormalizados.length) {
        setMensaje("No fue posible preparar los productos del pedido.");
        return;
      }

      if (totalPedido < 1000) {
        setMensaje("El total del pedido no es válido para pago en línea.");
        return;
      }

      const response = await fetchWithTimeout(`${API_URL}/api/pedidos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario_id: usuario?.id || null,
          cliente: {
            nombre: nombreFinal,
            correo: correoFinal,
            telefono: telefonoFinal,
            direccion: direccionFinal,
            ciudad: ciudadFinal,
          },
          nombre: nombreFinal,
          correo: correoFinal,
          telefono: telefonoFinal,
          direccion: direccionFinal,
          ciudad: ciudadFinal,
          productos: productosNormalizados,
          total: totalPedido,
          subtotal,
          envio: SHIPPING_COST,
          descuento,
          cupon: cuponAplicado?.codigo || null,
          estado_pago: "pendiente",
        }),
      });

      const data = await readJsonSafe(response);

      if (!response.ok) {
        setMensaje(data?.mensaje || "No fue posible crear el pedido.");
        return;
      }

      const pedidoId = data.pedidoId || data.id;

      if (!pedidoId) {
        setMensaje("Pedido creado, pero no se recibió el ID del pedido.");
        return;
      }

      setMensaje("Pedido creado. Conectando con Bold...");

      const pagoResponse = await fetchWithTimeout(`${API_URL}/api/bold/crear-link-pago`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pedidoId,
          total: totalPedido,
          nombre: nombreFinal,
          correo: correoFinal,
        }),
      });

      const pagoData = await readJsonSafe(pagoResponse);

      if (!pagoResponse.ok || !pagoData?.url) {
        console.error("Error generando link Bold:", pagoData);
        setMensaje(
          pagoData?.mensaje ||
            "Pedido creado, pero no fue posible generar el link de pago. Inténtalo nuevamente o contacta a AŞKA."
        );
        return;
      }

      try {
        sessionStorage.setItem(
          "aska_pending_order",
          JSON.stringify({
            pedidoId,
            reference: pagoData.reference || "",
            total: totalPedido,
            createdAt: Date.now(),
          })
        );
      } catch {
        // No bloquea el pago si sessionStorage no está disponible.
      }

      setMensaje("Redirigiendo a Bold...");

      // No limpiamos el carrito aquí.
      // Solo debe limpiarse cuando el pago sea confirmado por Bold/webhook.
      window.location.assign(pagoData.url);
    } catch (error) {
      console.error("Error creando pedido:", error);

      if (error?.name === "AbortError") {
        setMensaje(
          "El servidor tardó demasiado en responder. Verifica tu conexión e inténtalo nuevamente."
        );
      } else {
        setMensaje("Error creando el pedido. Inténtalo nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <section
        className="aska-checkout-premium-page"
        style={{
          minHeight: "100vh",
          background: "#0b0b0b",
          color: "#ffffff",
          padding: isMobile ? "72px 16px 80px" : "110px 28px 120px",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.1fr 0.9fr",
            gap: "clamp(26px, 4vw, 54px)",
          }}
        >
          <div
            className="aska-checkout-card"
            style={{
              background: "#111111",
              borderRadius: "36px",
              padding: "clamp(28px, 4vw, 54px)",
              boxShadow: "0 30px 90px rgba(0,0,0,0.38)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h1
              style={{
                fontSize: "clamp(2.8rem, 6.8vw, 5.4rem)",
                color: "#ffffff",
                lineHeight: ".88",
                letterSpacing: "-0.065em",
                marginTop: 0,
                fontFamily: "var(--aska-font-family-primary, inherit)",
                marginBottom: "16px",
              }}
            >
              FINALIZAR EXPERIENCIA
            </h1>

            <p
              style={{
                color: "rgba(255,255,255,0.62)",
                lineHeight: 1.6,
                marginTop: 0,
                marginBottom: "22px",
              }}
            >
              Completa tus datos para finalizar tu compra. Tu pedido será preparado
              con cuidado por AŞKA ✨ mientras confirmas el pago.
              <br />
              <br />
              Puedes comprar sin registrarte. Solo completa tus datos.
            </p>

            <p
              style={{
                color: "rgba(255,255,255,0.48)",
                lineHeight: 1.7,
                marginTop: "-4px",
                marginBottom: "28px",
                letterSpacing: ".03em",
              }}
            >
              Cada pieza es preparada artesanalmente antes de ser enviada.
            </p>

            {mensaje && (
              <p
                style={{
                  marginBottom: "18px",
                  color:
                    mensaje.includes("correctamente") ||
                    mensaje.includes("Preparando") ||
                    mensaje.includes("Conectando") ||
                    mensaje.includes("Redirigiendo")
                      ? "#7dd39a"
                      : "#ff6b81",
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
                type="email"
                name="correo"
                placeholder="Correo electrónico"
                value={form.correo}
                onChange={handleChange}
                required
                style={inputStyle}
              />

              <input
                type="tel"
                name="telefono"
                placeholder="Número de celular"
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
                  padding: "28px",
                  borderRadius: "28px",
                  background: "#171717",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    marginBottom: "8px",
                    fontSize: "2rem",
                  }}
                >
                  Métodos de pago
                </h2>

                <p
                  style={{
                    margin: 0,
                    marginBottom: "16px",
                    color: "rgba(255,255,255,0.62)",
                    lineHeight: 1.6,
                  }}
                >
                  Al confirmar tu pedido, serás redirigido a Bold para realizar
                  el pago de forma segura.
                  <br />
                  <br />
                  🔒 Pago seguro con Bold. Tus datos están protegidos con estándares
                  de seguridad.
                </p>

                {loadingMetodos ? (
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.62)" }}>
                    Cargando métodos de pago...
                  </p>
                ) : metodosPago.length === 0 ? (
                  <div
                    style={{
                      borderRadius: "16px",
                      padding: "14px",
                      background: "#111111",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <strong>Pago seguro con Bold</strong>
                    <p
                      style={{
                        margin: 0,
                        marginTop: "6px",
                        color: "rgba(255,255,255,0.62)",
                        lineHeight: 1.5,
                      }}
                    >
                      Tu pedido se creará y luego pasarás a la plataforma de pago.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "12px" }}>
                    {metodosPago.map((metodo) => (
                      <div
                        key={metodo.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: metodo.qr_url ? "1fr 120px" : "1fr",
                          gap: "14px",
                          alignItems: "center",
                          borderRadius: "18px",
                          padding: "16px",
                          background: "#111111",
                          border: "1px solid rgba(255,255,255,0.08)",
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
                                  background: "#ffffff",
                                  color: "#111111",
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
                            <p style={{ ...paymentTextStyle, lineHeight: 1.5 }}>
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
                              border: "1px solid rgba(255,255,255,0.08)",
                              background: "#171717",
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
                  padding: "16px 24px",
                  background: "#ffffff",
                  color: "#111111",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "var(--aska-font-family-secondary, inherit)",
                  boxShadow: "0 18px 48px rgba(0,0,0,0.36)",
                  marginTop: "4px",
                  opacity: loading ? 0.75 : 1,
                }}
              >
                {loading ? "Procesando pago..." : "CONTINUAR CON EL PEDIDO"}
              </button>

              <a
                href={`https://wa.me/573125183100?text=${encodeURIComponent(
                  "Hola ASKA, necesito ayuda con mi pedido."
                )}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "block",
                  marginTop: "18px",
                  textAlign: "center",
                  color: "rgba(255,255,255,0.66)",
                  textDecoration: "none",
                  letterSpacing: ".08em",
                  fontSize: ".88rem",
                }}
              >
                ¿Necesitas ayuda? Hablar con ASKA
              </a>
            </form>
          </div>

          <div
            className="aska-checkout-card aska-checkout-summary-card"
            style={{
              background: "#111111",
              borderRadius: "36px",
              padding: "clamp(28px, 4vw, 54px)",
              boxShadow: "0 30px 90px rgba(0,0,0,0.38)",
              border: "1px solid rgba(255,255,255,0.06)",
              alignSelf: "start",
              position: isMobile ? "relative" : "sticky",
              top: isMobile ? "0" : "120px",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "24px", fontSize: "2rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#ffffff" }}>Resumen</h2>

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
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
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
                        <div style={{ fontWeight: 700 }}>{item.name || item.nombre}</div>
                        <div style={{ color: "rgba(255,255,255,0.62)" }}>
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

                <div style={{ marginTop: "18px" }}>
                  <input
                    placeholder="Código de descuento"
                    value={cupon}
                    onChange={(e) => {
                      setCupon(e.target.value);
                      if (cuponAplicado) setCuponAplicado(null);
                      setMensaje("");
                    }}
                    style={{ ...inputStyle, marginBottom: "10px" }}
                  />
                  <button
                    type="button"
                    onClick={aplicarCupon}
                    style={{
                      border: "1px solid rgba(255,255,255,0.14)",
                      borderRadius: "999px",
                      padding: "10px 16px",
                      background: "rgba(255,255,255,0.08)",
                      color: "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    Aplicar cupón
                  </button>
                </div>

                {cuponAplicado && (
                  <div style={{ marginTop: "10px", color: "#7dd39a", fontWeight: 600 }}>
                    Cupón aplicado: {cuponAplicado.codigo}
                  </div>
                )}

                <div
                  style={{
                    marginTop: "18px",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "1.2rem",
                    fontWeight: 700,
                  }}
                >
                  <span>Subtotal:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "10px",
                    color: "rgba(255,255,255,0.72)",
                  }}
                >
                  <span>Envío:</span>
                  <span>{formatPrice(SHIPPING_COST)}</span>
                </div>

                {descuento > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "10px",
                      color: "#7dd39a",
                      fontWeight: 700,
                    }}
                  >
                    <span>Descuento:</span>
                    <span>-{formatPrice(descuento)}</span>
                  </div>
                )}

                <div
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "1.2rem",
                    fontWeight: 700,
                  }}
                >
                  <span>Total:</span>
                  <span>{formatPrice(totalPedido)}</span>
                </div>

                <div
                  style={{
                    marginTop: "20px",
                    padding: "16px",
                    borderRadius: "18px",
                    background: "#171717",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.72)",
                    lineHeight: 1.55,
                  }}
                >
                  Tu pedido se registrará como <strong>pago pendiente</strong>. Cuando
                  el pago sea confirmado, AŞKA actualizará el estado desde
                  administración.
                </div>
              </>
            )}
          </div>
        </div>
      </section>

<style>
{`
  :root {
    --aska-card-bg: #111111;
    --aska-card-bg-soft: #171717;
    --aska-success-color: #7dd39a;
    --aska-error-color: #ff6b81;
  }


  .aska-checkout-premium-page {
    position: relative;
    overflow: hidden;
    isolation: isolate;
  }

  .aska-checkout-premium-page::before {
    content: "";
    position: absolute;
    inset: -20%;
    pointer-events: none;
    background:
      radial-gradient(circle at 14% 8%, rgba(255,255,255,0.08), transparent 30%),
      radial-gradient(circle at 90% 18%, rgba(255,255,255,0.05), transparent 34%);
    z-index: 0;
  }

  .aska-checkout-premium-page > div {
    position: relative;
    z-index: 1;
  }

  .aska-checkout-card {
    color: #ffffff !important;
    backdrop-filter: blur(18px);
  }

  .aska-checkout-card h1,
  .aska-checkout-card h2,
  .aska-checkout-card h3,
  .aska-checkout-card strong {
    color: #ffffff !important;
  }

  .aska-checkout-card p,
  .aska-checkout-card span,
  .aska-checkout-card div {
    color: inherit;
  }

  .aska-checkout-card input {
    background: rgba(255,255,255,0.045) !important;
    border: 1px solid rgba(255,255,255,0.10) !important;
    color: #ffffff !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
  }

  .aska-checkout-card input:focus {
    border-color: rgba(255,255,255,0.28) !important;
    box-shadow: 0 0 0 4px rgba(255,255,255,0.05);
  }

  .aska-checkout-card input::placeholder {
    color: rgba(255,255,255,0.40) !important;
  }

  .aska-checkout-summary-card {
    max-height: calc(100vh - 145px);
    overflow-y: auto;
  }

  .aska-checkout-summary-card::-webkit-scrollbar {
    width: 6px;
  }

  .aska-checkout-summary-card::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.18);
    border-radius: 999px;
  }

  @media (max-width: 768px) {
    .aska-checkout-premium-page {
      padding-top: 86px !important;
    }

    .aska-checkout-summary-card {
      max-height: none;
      overflow-y: visible;
    }
  }


  button {
    transition:
      transform 0.22s ease,
      opacity 0.22s ease,
      box-shadow 0.22s ease;
  }

  button:hover {
    transform: translateY(-3px);
    opacity: 0.98;
    box-shadow: 0 24px 54px rgba(0,0,0,.32);
  }

  button {
    border-radius: 999px !important;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  input {
    background: rgba(255,255,255,0.04) !important;
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.08);
    color: #fff !important;
  }

  input::placeholder {
    color: rgba(255,255,255,0.42);
  }

  img {
    transition:
      transform .72s cubic-bezier(.22,.61,.36,1),
      filter .72s ease;
  }

  img:hover {
    transform: scale(1.03);
    filter: contrast(1.04);
  }
`}
</style>

    </>
  );
}

const inputStyle = {
  width: "100%",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "14px",
  padding: "14px 16px",
  fontSize: "1rem",
  outline: "none",
  fontFamily: "var(--aska-font-family-secondary, inherit)",
  background: "rgba(255,255,255,0.04)",
  color: "#ffffff",
};

const paymentTextStyle = {
  margin: 0,
  marginTop: "5px",
  color: "rgba(255,255,255,0.72)",
};

export default Checkout;
