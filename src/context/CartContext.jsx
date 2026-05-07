import { createContext, useEffect, useMemo, useState } from "react";

export const CartContext = createContext();

const safeParse = (value, fallback = null) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const getUserId = () => {
  const user = safeParse(localStorage.getItem("usuario"), null);
  return user?.id || null;
};

const getCartKey = (userId) => {
  return userId ? `aska_cart_user_${userId}` : "aska_cart_guest";
};

const readCartFromStorage = (userId) => {
  const userKey = getCartKey(userId);
  const userCart = safeParse(localStorage.getItem(userKey), null);

  if (Array.isArray(userCart) && userCart.length > 0) {
    return userCart;
  }

  const guestCart = safeParse(localStorage.getItem("aska_cart_guest"), null);

  if (Array.isArray(guestCart) && guestCart.length > 0) {
    return guestCart;
  }

  return [];
};

const normalizeCartItem = (product) => {
  const id = product.id || product.producto_id || product.productId;

  return {
    ...product,
    id,
    producto_id: product.producto_id || id,
    name: product.name || product.nombre || "Producto",
    nombre: product.nombre || product.name || "Producto",
    price: Number(product.price || product.precio || 0),
    precio: Number(product.precio || product.price || 0),
    image: product.image || product.imagen || "",
    imagen: product.imagen || product.image || "",
    category: product.category || product.categoria || "",
    categoria: product.categoria || product.category || "",
    quantity: Number(product.quantity || product.cantidad || 1),
    cantidad: Number(product.cantidad || product.quantity || 1),
  };
};

export function CartProvider({ children }) {
  const [userId, setUserId] = useState(() => getUserId());
  const [cart, setCart] = useState(() => readCartFromStorage(getUserId()));
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [cartPulse, setCartPulse] = useState(false);
  const [lastAddedId, setLastAddedId] = useState(null);


  const cartKey = useMemo(() => getCartKey(userId), [userId]);

  const saveCart = (nextCart, targetUserId = userId) => {
    const key = getCartKey(targetUserId);
    localStorage.setItem(key, JSON.stringify(nextCart));
  };

  useEffect(() => {
    saveCart(cart, userId);
  }, [cart, userId]);

  useEffect(() => {
    const syncUser = () => {
      const newUserId = getUserId();
      setUserId(newUserId);

      const nextCart = readCartFromStorage(newUserId);
      setCart(nextCart);
      saveCart(nextCart, newUserId);
    };

    window.addEventListener("auth-changed", syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("auth-changed", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const addToCart = (product) => {
    const normalized = normalizeCartItem(product);

    setCart((prev) => {
      const existing = prev.find((item) => String(item.id) === String(normalized.id));

      const nextCart = existing
        ? prev.map((item) =>
            String(item.id) === String(normalized.id)
              ? {
                  ...item,
                  quantity: Number(item.quantity || item.cantidad || 0) + 1,
                  cantidad: Number(item.cantidad || item.quantity || 0) + 1,
                }
              : item
          )
        : [...prev, normalized];

      saveCart(nextCart, userId);
      return nextCart;
    });

    // Microinteracciones
    setLastAddedId(normalized.id);
    setCartPulse(true);

    const pulseTimeout = setTimeout(() => {
      setCartPulse(false);
    }, 380);

    // Toast más rico
    const name = normalized.name || normalized.nombre || "Producto";
    setToastMessage(`Tu ítem ha sido agregado al carrito 🛍️`);

    const toastTimeout = setTimeout(() => {
      setToastMessage("");
    }, 2400);

    // Notificar a la UI (Navbar badge, etc.)
    window.dispatchEvent(new Event("cart-updated"));

    setIsCartOpen(true);

    return () => {
      clearTimeout(pulseTimeout);
      clearTimeout(toastTimeout);
    };
  };

  const removeFromCart = (id) => {
    setCart((prev) => {
      const nextCart = prev.filter((item) => String(item.id) !== String(id));
      saveCart(nextCart, userId);
      return nextCart;
    });
  };

  const updateQuantity = (id, quantity) => {
    const newQuantity = Math.max(1, Number(quantity || 1));

    setCart((prev) => {
      const nextCart = prev.map((item) =>
        String(item.id) === String(id)
          ? {
              ...item,
              quantity: newQuantity,
              cantidad: newQuantity,
            }
          : item
      );

      saveCart(nextCart, userId);
      return nextCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem(cartKey);
  };

  const toggleCart = () => setIsCartOpen((prev) => !prev);
  const closeCart = () => setIsCartOpen(false);
  const openCart = () => setIsCartOpen(true);

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        toggleCart,
        closeCart,
        openCart,
        toastMessage,
        cartPulse,
        lastAddedId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}