import { useContext, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import cartLogo from "../assets/casado.png";

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function FloatingCart() {
  const location = useLocation();

  const {
    cart,
    removeFromCart,
    isCartOpen,
    toggleCart,
    closeCart,
    toastMessage,
  } = useContext(CartContext);

  const hiddenRoutes = [
    "/login",
    "/register",
    "/verificar-correo",
    "/recuperar-password",
    "/reset-password",
  ];

  const shouldHideCart = hiddenRoutes.includes(location.pathname);

  const totalItems = useMemo(() => {
    return cart.reduce(
      (acc, item) => acc + Number(item.quantity || 0),
      0
    );
  }, [cart]);

  const totalPrice = useMemo(() => {
    return cart.reduce(
      (acc, item) =>
        acc + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
  }, [cart]);

  if (shouldHideCart) return null;

  return (
    <>
      {toastMessage && (
        <div className="cart-toast">
          {toastMessage}
        </div>
      )}

      <button
        className="floating-cart-button"
        onClick={toggleCart}
        aria-label="Abrir carrito"
        title="Abrir carrito"
        type="button"
      >
        <img
          src={cartLogo}
          alt="Carrito AŞKA"
          className="floating-cart-image"
        />

        {totalItems > 0 && (
          <span className="floating-cart-badge">{totalItems}</span>
        )}
      </button>

      {isCartOpen && (
        <>
          <div className="cart-overlay" onClick={closeCart}></div>

          <aside className="cart-drawer">
            <div className="cart-drawer-header">
              <h2>Tu carrito</h2>

              <button
                className="cart-close-button"
                onClick={closeCart}
                aria-label="Cerrar carrito"
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="cart-drawer-body">
              {cart.length === 0 ? (
                <p style={{ color: "rgba(255,255,255,0.72)" }}>
                  Tu carrito está vacío.
                </p>
              ) : (
                cart.map((product) => (
                  <div key={product.id} className="cart-item">
                    <img
                      src={product.image || ""}
                      alt={product.name}
                      className="cart-item-image"
                    />

                    <div className="cart-item-info">
                      <h4>{product.name}</h4>

                      {product.category && <p>{product.category}</p>}

                      <p>Cantidad: {Number(product.quantity || 0)}</p>

                      <p>
                        {formatPrice(
                          Number(product.price || 0) *
                            Number(product.quantity || 0)
                        )}
                      </p>

                      <button
                        className="cart-remove-button"
                        onClick={() => removeFromCart(product.id)}
                        type="button"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="cart-drawer-footer">
              <h3>Total: {formatPrice(totalPrice)}</h3>

              <Link to="/cart" onClick={closeCart}>
                <button className="cart-checkout-button" type="button">
                  Ver carrito
                </button>
              </Link>

              <Link to="/checkout" onClick={closeCart}>
                <button className="cart-checkout-button" type="button">
                  Ir al checkout
                </button>
              </Link>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

export default FloatingCart;