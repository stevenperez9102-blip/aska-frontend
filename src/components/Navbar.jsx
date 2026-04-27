import { useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function slugifyCategory(name = "") {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+y\s+/g, "-y-")
    .replace(/\s+/g, "-");
}

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [showCatalogMenu, setShowCatalogMenu] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [secretActive, setSecretActive] = useState(false);

  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);

  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  const isLoggedIn = !!usuario;
  const isAdmin = usuario?.rol === "admin";

  const categorias = useMemo(
    () => ["Collares", "Accesorios corporales", "Pulseras", "Aretes y anillos"],
    []
  );

  const linkStyle = (active = false) => ({
    color: active ? "#bfa6ff" : "#f4efe8",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "0.95rem",
    letterSpacing: "0.04em",
    transition: "all 0.25s ease",
  });

  const buttonTextStyle = {
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    color: "#f4efe8",
    fontWeight: 600,
    fontSize: "0.95rem",
    letterSpacing: "0.04em",
  };

  const openMenu = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setShowCatalogMenu(true);
  };

  const closeMenu = () => {
    const id = setTimeout(() => {
      setShowCatalogMenu(false);
    }, 200);
    setTimeoutId(id);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.dispatchEvent(new Event("auth-changed"));
  };

  const handleSecretClick = (e) => {
    e.preventDefault();

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
      navigate("/");
    }, 450);
  };

  return (
    <>
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
          {Array.from({ length: 38 }).map((_, i) => (
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

      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 9999,
          background: "rgba(10,10,10,0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "18px 36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button
            type="button"
            onClick={handleSecretClick}
            style={{
              color: "#fff",
              background: "transparent",
              border: "none",
              textDecoration: "none",
              fontSize: "1.3rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              cursor: "pointer",
              fontFamily: "inherit",
              padding: 0,
            }}
          >
            AŞKA
          </button>

          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "34px",
              position: "relative",
            }}
          >
            <Link to="/" style={linkStyle(location.pathname === "/")}>
              Inicio
            </Link>

            <div
              style={{ position: "relative" }}
              onMouseEnter={openMenu}
              onMouseLeave={closeMenu}
            >
              <Link
                to="/catalogo"
                style={linkStyle(
                  location.pathname === "/catalogo" ||
                    location.pathname.startsWith("/catalogo/") ||
                    location.pathname.startsWith("/producto/")
                )}
              >
                Catálogo ˅
              </Link>

              {showCatalogMenu && (
                <div
                  onMouseEnter={openMenu}
                  onMouseLeave={closeMenu}
                  style={{
                    position: "absolute",
                    top: "48px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#111",
                    borderRadius: "6px",
                    minWidth: "300px",
                    padding: "12px 0",
                    boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  {categorias.map((categoria) => (
                    <Link
                      key={categoria}
                      to={`/catalogo/${slugifyCategory(categoria)}`}
                      style={{
                        display: "block",
                        padding: "14px 28px",
                        color: "#ddd",
                        textDecoration: "none",
                        fontSize: "0.95rem",
                      }}
                      onClick={() => setShowCatalogMenu(false)}
                    >
                      {categoria}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/nosotras"
              style={linkStyle(location.pathname.startsWith("/nosotras"))}
            >
              Nosotras
            </Link>

            {isLoggedIn ? (
              <>
                <Link to="/mis-pedidos" style={linkStyle(false)}>
                  Mis pedidos
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin/pagina"
                    style={linkStyle(location.pathname.startsWith("/admin"))}
                  >
                    Administración
                  </Link>
                )}

                <button onClick={handleLogout} style={buttonTextStyle}>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  style={linkStyle(location.pathname.startsWith("/login"))}
                >
                  Ingresar
                </Link>

                <Link
                  to="/register"
                  style={linkStyle(location.pathname.startsWith("/register"))}
                >
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}

export default Navbar;