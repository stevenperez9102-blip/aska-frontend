import { useContext, useMemo, useState } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function Cart() {
  const { cart, removeFromCart, updateQuantity } = useContext(CartContext);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  const total = cart.reduce(
    (acc, product) => acc + Number(product.price || 0) * Number(product.quantity || 0),
    0
  );

  const shippingCost = useMemo(() => {
    const city = deliveryCity.trim().toLowerCase();

    if (!deliveryAddress.trim() && !city) return 0;

    if (
      city.includes("bogota") ||
      city.includes("bogotá") ||
      city.includes("medellin") ||
      city.includes("medellín") ||
      city.includes("cali") ||
      city.includes("barranquilla")
    ) {
      return 10000;
    }

    return 15000;
  }, [deliveryAddress, deliveryCity]);

  const grandTotal = total + shippingCost;

  return (
    <>
      <Navbar />

      <section
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #f8f3f0 0%, #efe7e4 48%, #f8f3f0 100%)",
          padding: isMobile ? "72px 16px 72px" : "110px 28px 110px",
          color: "var(--aska-text-primary, #111)",
        }}
      >
        <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
          <div style={{ marginBottom: "28px" }}>
            <p
              style={{
                margin: 0,
                marginBottom: "10px",
                color: "rgba(0,0,0,0.58)",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                fontSize: "0.82rem",
                fontWeight: 800,
              }}
            >
              Compra
            </p>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(3.2rem, 8vw, 7rem)",
                lineHeight: 0.88,
                fontWeight: 500,
                letterSpacing: "-0.08em",
              }}
            >
              Carrito de compras
            </h1>
          </div>

          {cart.length === 0 ? (
            <div
              style={{
                minHeight: "58vh",
                background: "var(--aska-card-bg, #fff)",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: "38px",
                padding: "72px 34px",
                boxShadow: "0 30px 90px rgba(0,0,0,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <div style={{ maxWidth: "560px", margin: "0 auto" }}>
                <div
                  style={{
                    width: "150px",
                    height: "150px",
                    margin: "0 auto 24px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(145deg, rgba(17,17,17,0.05), color-mix(in srgb, var(--aska-accent-primary, #bfa6ff) 22%, transparent))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "4.2rem",
                    color: "var(--aska-text-primary, #111)",
                    animation: "pulse 2s ease-in-out infinite",
                    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
                  }}
                  aria-hidden="true"
                >
                  🛒
                </div>

                <h2
                  style={{
                    margin: "0 0 12px",
                    fontSize: "clamp(3rem, 8vw, 5.4rem)",
                    lineHeight: 0.88,
                    fontWeight: 500,
                    letterSpacing: "-0.07em",
                    color: "var(--aska-text-primary, #111)",
                  }}
                >
                  Tu carrito está vacío
                </h2>

                <p
                  style={{
                    margin: "0 auto 28px",
                    maxWidth: "430px",
                    fontSize: "1.05rem",
                    lineHeight: 1.6,
                    color: "#555",
                    fontWeight: 600,
                  }}
                >
                  Aún no has agregado productos. Descubre la colección AŞKA y encuentra
                  una pieza única para ti.
                </p>

                <Link to="/catalogo" style={{ textDecoration: "none" }}>
                  <button
                    style={{
                      border: "none",
                      background: "var(--aska-bg-primary, #111)",
                      color: "var(--aska-text-secondary, #fff)",
                      padding: "16px 34px",
                      cursor: "pointer",
                      fontWeight: 600,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      borderRadius: "999px",
                      fontSize: "1rem",
                      letterSpacing: "0.03em",
                      boxShadow: "0 14px 30px rgba(0,0,0,0.18)",
                    }}
                  >
                    Ver productos
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "minmax(0, 1.2fr) minmax(280px, 0.8fr)",
                gap: "clamp(26px, 4vw, 54px)",
                alignItems: "start",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gap: "18px",
                }}
              >
                {cart.map((product) => (
                  <div
                    key={product.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "120px 1fr",
                      gap: "18px",
                      background: "var(--aska-card-bg, #fff)",
                      border: "1px solid rgba(0,0,0,0.08)",
                      borderRadius: "30px",
                      padding: "18px",
                      boxShadow: "0 24px 70px rgba(0,0,0,0.07)",
                    }}
                  >
                    <div
                      style={{
                        width: isMobile ? "100%" : "120px",
                        height: isMobile ? "190px" : "120px",
                        borderRadius: "18px",
                        overflow: "hidden",
                        background: "#ececec",
                      }}
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
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
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#777",
                            fontSize: "0.9rem",
                            fontWeight: 700,
                          }}
                        >
                          Sin imagen
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        alignContent: "start",
                        gap: "8px",
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "clamp(1.6rem, 2.4vw, 2.2rem)",
                          lineHeight: 0.96,
                          fontWeight: 500,
                          letterSpacing: "-0.04em",
                        }}
                      >
                        {product.name}
                      </h3>

                      {product.category && (
                        <p
                          style={{
                            margin: 0,
                            color: "rgba(0,0,0,0.58)",
                            fontSize: "0.92rem",
                            fontWeight: 700,
                          }}
                        >
                          {product.category}
                        </p>
                      )}

                      <p
                        style={{
                          margin: 0,
                          fontWeight: 900,
                          fontSize: "1rem",
                        }}
                      >
                        {formatPrice(product.price)}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          margin: "6px 0",
                        }}
                      >
                        <button
                          onClick={() => updateQuantity(product.id, (product.quantity || 1) - 1)}
                          disabled={(product.quantity || 1) <= 1}
                          style={{
                            border: "1px solid rgba(0,0,0,0.18)",
                            background: "var(--aska-bg-primary, #111)",
                            color: "var(--aska-text-secondary, #fff)",
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            cursor: (product.quantity || 1) <= 1 ? "not-allowed" : "pointer",
                            fontWeight: 900,
                            fontSize: "1.2rem",
                            lineHeight: 1,
                            opacity: (product.quantity || 1) <= 1 ? 0.4 : 1,
                          }}
                        >−</button>
                        <span style={{ fontWeight: 700, minWidth: 24, textAlign: "center" }}>
                          {product.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, (product.quantity || 1) + 1)}
                          style={{
                            border: "1px solid rgba(0,0,0,0.18)",
                            background: "var(--aska-bg-primary, #111)",
                            color: "var(--aska-text-secondary, #fff)",
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            cursor: "pointer",
                            fontWeight: 900,
                            fontSize: "1.2rem",
                            lineHeight: 1,
                          }}
                        >+</button>
                      </div>

                      <p
                        style={{
                          margin: 0,
                          color: "var(--aska-text-primary, #111)",
                          fontWeight: 900,
                        }}
                      >
                        Total: {formatPrice(Number(product.price || 0) * Number(product.quantity || 0))}
                      </p>

                      <div style={{ marginTop: "8px" }}>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          style={{
                            border: "none",
                            background: "var(--aska-bg-primary, #111)",
                            color: "var(--aska-text-secondary, #fff)",
                            padding: "11px 16px",
                            cursor: "pointer",
                            fontWeight: 900,
                            borderRadius: "999px",
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <aside
                style={{
                  background: "var(--aska-card-bg, #fff)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: "34px",
                  padding: "34px",
                  boxShadow: "0 24px 70px rgba(0,0,0,0.08)",
                  position: isMobile ? "static" : "sticky",
                  top: isMobile ? "auto" : "100px",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    marginBottom: "18px",
                    fontSize: "2.2rem",
                    fontWeight: 500,
                    letterSpacing: "-0.04em",
                  }}
                >
                  Resumen
                </h2>

                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                    marginBottom: "22px",
                  }}
                >
                  <label style={{ display: "grid", gap: "7px" }}>
                    <span style={{ fontWeight: 900, fontSize: "0.92rem" }}>
                      Ciudad de envío
                    </span>
                    <input
                      type="text"
                      value={deliveryCity}
                      onChange={(e) => setDeliveryCity(e.target.value)}
                      placeholder="Ej: Bogotá"
                      style={{
                        width: "100%",
                        border: "1px solid rgba(0,0,0,0.14)",
                        borderRadius: "14px",
                        padding: "13px 14px",
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </label>

                  <label style={{ display: "grid", gap: "7px" }}>
                    <span style={{ fontWeight: 900, fontSize: "0.92rem" }}>
                      Dirección
                    </span>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Dirección de entrega"
                      style={{
                        width: "100%",
                        border: "1px solid rgba(0,0,0,0.14)",
                        borderRadius: "14px",
                        padding: "13px 14px",
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </label>

                  <p
                    style={{
                      margin: 0,
                      color: "rgba(0,0,0,0.58)",
                      fontSize: "0.86rem",
                      lineHeight: 1.45,
                      fontWeight: 700,
                    }}
                  >
                    El costo de envío se calcula cuando ingresas ciudad o dirección.
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "16px",
                    marginBottom: "14px",
                    color: "var(--aska-text-primary, #444)",
                    fontWeight: 700,
                  }}
                >
                  <span>Productos</span>
                  <span>{cart.length}</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "16px",
                    marginBottom: "14px",
                    color: "var(--aska-text-primary, #444)",
                    fontWeight: 700,
                  }}
                >
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 900, color: "#111" }}>
                    {formatPrice(total)}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "16px",
                    marginBottom: "20px",
                    color: "var(--aska-text-primary, #444)",
                    fontWeight: 700,
                  }}
                >
                  <span>Envío</span>
                  <span style={{ fontWeight: 900, color: "#111" }}>
                    {shippingCost > 0 ? formatPrice(shippingCost) : "Pendiente"}
                  </span>
                </div>

                <div
                  style={{
                    borderTop: "1px solid rgba(0,0,0,0.1)",
                    paddingTop: "18px",
                    display: "grid",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "16px",
                      marginBottom: "8px",
                      color: "var(--aska-text-primary, #111)",
                      fontSize: "1.12rem",
                      fontWeight: 900,
                    }}
                  >
                    <span>Total estimado</span>
                    <span>{formatPrice(grandTotal)}</span>
                  </div>

                  <Link to="/checkout">
                    <button
                      style={{
                        width: "100%",
                        border: "none",
                        background: "var(--aska-bg-primary, #111)",
                        color: "var(--aska-text-secondary, #fff)",
                        padding: "16px 18px",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.78rem",
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        borderRadius: "999px",
                      }}
                    >
                      Ir al checkout
                    </button>
                  </Link>

                  <Link to="/catalogo">
                    <button
                      style={{
                        width: "100%",
                        border: "1px solid rgba(0,0,0,0.15)",
                        background: "var(--aska-card-bg, #fff)",
                        color: "var(--aska-text-primary, #111)",
                        padding: "16px 18px",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.78rem",
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        borderRadius: "999px",
                      }}
                    >
                      Seguir comprando
                    </button>
                  </Link>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>

<style>
{`
  :root {
    --aska-card-bg: #ffffff;
  }

  button {
    transition:
      transform 0.22s ease,
      box-shadow 0.22s ease,
      opacity 0.22s ease;
  }

  button:hover {
    transform: translateY(-2px);
    opacity: 0.97;
  }

  .aska-cart-luxury-note {
    font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
  }

  section::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(circle at 10% 8%, rgba(255,255,255,0.72), transparent 28%),
      radial-gradient(circle at 88% 10%, rgba(17,17,17,0.08), transparent 34%);
    z-index: 0;
  }

  section > div {
    position: relative;
    z-index: 1;
  }

  button {
    letter-spacing: 0.14em;
    text-transform: uppercase;
    border-radius: 999px;
  }

  input {
    background: rgba(255,255,255,0.72);
    backdrop-filter: blur(10px);
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

export default Cart;
