import { useContext } from "react";
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

  const total = cart.reduce(
    (acc, product) => acc + Number(product.price || 0) * Number(product.quantity || 0),
    0
  );

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
              }}
            >
              Compra
            </p>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(2.3rem, 5vw, 4rem)",
                lineHeight: 1,
              }}
            >
              Carrito
            </h1>
          </div>

          {cart.length === 0 ? (
            <div
              style={{
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: "24px",
                padding: "38px 30px",
                boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  marginBottom: "18px",
                  fontSize: "1.05rem",
                  color: "#333",
                }}
              >
                Tu carrito está vacío.
              </p>

              <Link to="/catalogo">
                <button
                  style={{
                    border: "none",
                    background: "#111",
                    color: "#fff",
                    padding: "14px 22px",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Ir al catálogo
                </button>
              </Link>
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
                          }}
                        >
                          {product.category}
                        </p>
                      )}

                      <p
                        style={{
                          margin: 0,
                          fontWeight: 700,
                          fontSize: "1rem",
                        }}
                      >
                        {formatPrice(product.price)}
                      </p>

                      <p
                        style={{
                          margin: 0,
                          color: "#444",
                        }}
                      >
                        Cantidad: {product.quantity}
                      </p>

                      <p
                        style={{
                          margin: 0,
                          color: "#111",
                          fontWeight: 700,
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
                            fontWeight: 700,
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
                  }}
                >
                  Resumen
                </h2>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "16px",
                    marginBottom: "14px",
                    color: "#444",
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
                    marginBottom: "20px",
                    color: "#444",
                  }}
                >
                  <span>Total estimado</span>
                  <span style={{ fontWeight: 700, color: "#111" }}>
                    {formatPrice(total)}
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
                  <Link to="/checkout">
                    <button
                      style={{
                        width: "100%",
                        border: "none",
                        background: "#111",
                        color: "#fff",
                        padding: "15px 18px",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: "1rem",
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
                        fontWeight: 700,
                        fontSize: "1rem",
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