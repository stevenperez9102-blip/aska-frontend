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
  const { cart, removeFromCart } = useContext(CartContext);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");

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
          background: "#f3f3f3",
          padding: "42px 24px 70px",
          color: "#111",
        }}
      >
        <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
          <div style={{ marginBottom: "28px" }}>
            <p
              style={{
                margin: 0,
                marginBottom: "10px",
                color: "#666",
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
                fontSize: "clamp(2.3rem, 5vw, 4rem)",
                lineHeight: 1,
                fontWeight: 900,
              }}
            >
              Carrito de compras
            </h1>
          </div>

          {cart.length === 0 ? (
            <div
              style={{
                minHeight: "58vh",
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: "30px",
                padding: "42px 26px",
                boxShadow: "0 18px 45px rgba(0,0,0,0.07)",
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
                      "linear-gradient(145deg, rgba(17,17,17,0.05), rgba(191,166,255,0.18))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "4.2rem",
                    color: "#111",
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
                    fontSize: "clamp(2rem, 5vw, 3.2rem)",
                    lineHeight: 1,
                    fontWeight: 900,
                    color: "#111",
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
                  Aún no has agregado productos.
Descubre la colección AŞKA y encuentra una pieza única para ti.
                </p>

                <Link to="/catalogo" style={{ textDecoration: "none" }}>
                  <button
                    style={{
                      border: "none",
                      background: "#111",
                      color: "#fff",
                      padding: "15px 28px",
                      cursor: "pointer",
                      fontWeight: 900,
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
                gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)",
                gap: "24px",
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
                      gridTemplateColumns: "120px 1fr",
                      gap: "18px",
                      background: "#fff",
                      border: "1px solid rgba(0,0,0,0.08)",
                      borderRadius: "24px",
                      padding: "16px",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div
                      style={{
                        width: "120px",
                        height: "120px",
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
                          fontSize: "1.35rem",
                          lineHeight: 1.1,
                          fontWeight: 900,
                        }}
                      >
                        {product.name}
                      </h3>

                      {product.category && (
                        <p
                          style={{
                            margin: 0,
                            color: "#666",
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

                      <p
                        style={{
                          margin: 0,
                          color: "#444",
                          fontWeight: 700,
                        }}
                      >
                        Cantidad: {product.quantity}
                      </p>

                      <p
                        style={{
                          margin: 0,
                          color: "#111",
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
                            background: "#111",
                            color: "#fff",
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
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: "24px",
                  padding: "26px",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
                  position: "sticky",
                  top: "100px",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    marginBottom: "18px",
                    fontSize: "1.7rem",
                    fontWeight: 900,
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
                      color: "#666",
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
                    color: "#444",
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
                    color: "#444",
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
                    color: "#444",
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
                      color: "#111",
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
                        background: "#111",
                        color: "#fff",
                        padding: "15px 18px",
                        cursor: "pointer",
                        fontWeight: 900,
                        fontSize: "1rem",
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
                        background: "#fff",
                        color: "#111",
                        padding: "15px 18px",
                        cursor: "pointer",
                        fontWeight: 900,
                        fontSize: "1rem",
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
    </>
  );
}

export default Cart;
