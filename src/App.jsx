import { useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import FloatingCart from "./components/FloatingCart";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Nosotras from "./pages/Nosotras";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminPagina from "./pages/AdminPagina";
import AdminProductos from "./pages/AdminProductos";
import AdminPedidos from "./pages/AdminPedidos";
import MisPedidos from "./pages/MisPedidos";

function getUsuario() {
  try {
    return JSON.parse(localStorage.getItem("usuario")) || null;
  } catch {
    return null;
  }
}

function PrivateRoute({ children }) {
  const usuario = getUsuario();
  return usuario ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const usuario = getUsuario();

  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.rol !== "admin") return <Navigate to="/" replace />;

  return children;
}

function App() {
  const [secretActive, setSecretActive] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);

  const handleSecretAreaClick = (e) => {
    const isLogoZone = e.clientX <= 150 && e.clientY <= 95;
    const text = String(e.target?.textContent || "").toLowerCase();
    const isLogoText = text.includes("aşka") || text.includes("aska");

    if (!isLogoZone && !isLogoText) return;

    clickCountRef.current += 1;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    if (clickCountRef.current >= 2) {
      clickCountRef.current = 0;
      setSecretActive(true);

      setTimeout(() => {
        setSecretActive(false);
      }, 5200);

      return;
    }

    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 500);
  };

  return (
    <Router>
      <div onClickCapture={handleSecretAreaClick}>
        <FloatingCart />

        {secretActive && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 999999,
              background:
                "radial-gradient(circle at center, rgba(138,103,179,0.28), transparent 45%), rgba(0,0,0,0.96)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {Array.from({ length: 42 }).map((_, i) => (
              <span
                key={i}
                style={{
                  position: "absolute",
                  top: "-80px",
                  left: `${(i * 7.3) % 100}%`,
                  color: "rgba(255,255,255,0.78)",
                  fontSize: "2rem",
                  animation: `askaFall ${3 + (i % 5) * 0.35}s linear ${
                    (i % 8) * 0.16
                  }s infinite`,
                }}
              >
                ⛓
              </span>
            ))}

            <div
              style={{
                position: "relative",
                zIndex: 5,
                width: "min(720px, 88vw)",
                padding: "42px 34px",
                textAlign: "center",
                borderRadius: "34px",
                background: "rgba(15,15,16,0.82)",
                border: "1px solid rgba(255,255,255,0.14)",
                boxShadow: "0 30px 90px rgba(0,0,0,0.65)",
                color: "#fff",
              }}
            >
              <p
                style={{
                  margin: "0 0 16px",
                  color: "rgba(255,255,255,0.72)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontSize: "0.85rem",
                }}
              >
                ✨ Se desbloqueó el secreto de AŞKA ✨
              </p>

              <h2
                style={{
                  margin: 0,
                  fontSize: "clamp(2.4rem, 7vw, 5.2rem)",
                  lineHeight: 1,
                }}
              >
                Aska es una chimba
              </h2>

              <h3
                style={{
                  margin: "16px 0 0",
                  fontSize: "clamp(1.05rem, 3vw, 1.7rem)",
                  color: "#d6b36a",
                  lineHeight: 1.35,
                }}
              >
                y Nicky una agente secreta de las zuricatas!
              </h3>
            </div>

            <style>
              {`
                @keyframes askaFall {
                  0% {
                    transform: translateY(-100px) rotate(0deg);
                    opacity: 0;
                  }
                  12% {
                    opacity: 1;
                  }
                  100% {
                    transform: translateY(115vh) rotate(260deg);
                    opacity: 0;
                  }
                }
              `}
            </style>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/nosotras" element={<Nosotras />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/catalogo/:slug" element={<Catalog />} />
          <Route path="/producto/:id" element={<ProductDetail />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/registro" element={<Navigate to="/register" replace />} />
          <Route path="/verificar-correo" element={<VerifyEmail />} />
          <Route path="/recuperar-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/cart" element={<Cart />} />
          <Route path="/carrito" element={<Navigate to="/cart" replace />} />

          <Route
            path="/checkout"
            element={
              <PrivateRoute>
                <Checkout />
              </PrivateRoute>
            }
          />

          <Route
            path="/mis-pedidos"
            element={
              <PrivateRoute>
                <MisPedidos />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/pagina"
            element={
              <AdminRoute>
                <AdminPagina />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/productos"
            element={
              <AdminRoute>
                <AdminProductos />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/pedidos"
            element={
              <AdminRoute>
                <AdminPedidos />
              </AdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;