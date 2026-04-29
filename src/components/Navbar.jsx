import { useEffect, useMemo, useRef, useState } from "react";
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
  const [showPurchasesMenu, setShowPurchasesMenu] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [secretActive, setSecretActive] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartLuxPulse, setCartLuxPulse] = useState(false);

  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);

  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  const isLoggedIn = !!usuario;
  const isAdmin = usuario?.rol === "admin";

  const carritoGuardado = JSON.parse(
    localStorage.getItem("carrito") ||
      localStorage.getItem("cart") ||
      localStorage.getItem("cartItems") ||
      "[]"
  );

  const totalCarrito = Array.isArray(carritoGuardado)
    ? carritoGuardado.reduce(
        (total, item) =>
          total + Number(item?.cantidad || item?.quantity || item?.qty || 1),
        0
      )
    : 0;

  const categorias = useMemo(
    () => ["Collares", "Accesorios corporales", "Pulseras", "Aretes y anillos"],
    []
  );

  useEffect(() => {
    setMobileOpen(false);
    setShowCatalogMenu(false);
    setShowPurchasesMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflowX = "hidden";
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
      document.body.style.overflowX = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleCartUpdated = () => {
      setCartLuxPulse(false);

      window.requestAnimationFrame(() => {
        setCartLuxPulse(true);
      });

      setTimeout(() => {
        setCartLuxPulse(false);
      }, 820);
    };

    window.addEventListener("cart-updated", handleCartUpdated);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated);
    };
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      const el = document.querySelector('.aska-navbar-inner');
      if (el && !el.contains(e.target)) {
        setShowCatalogMenu(false);
        setShowPurchasesMenu(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);


  const closeMobileMenu = () => {
    setMobileOpen(false);
    setShowCatalogMenu(false);
    setShowPurchasesMenu(false);
  };

  const linkStyle = (active = false) => ({
    color: active ? "#bfa6ff" : "#f4efe8",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "0.95rem",
    letterSpacing: "0.04em",
    transition: "all 0.25s ease",
    whiteSpace: "nowrap",
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
    fontFamily: "inherit",
    whiteSpace: "nowrap",
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

  const openPurchasesMenu = () => {
    setShowPurchasesMenu(true);
  };

  const closePurchasesMenu = () => {
    setShowPurchasesMenu(false);
  };

  const togglePurchasesMenu = (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      setShowPurchasesMenu((value) => !value);
    }
  };

  const toggleCatalogMenu = (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      setShowCatalogMenu((value) => !value);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.dispatchEvent(new Event("auth-changed"));
    closeMobileMenu();
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
          className="aska-navbar-inner"
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "18px 112px 18px 36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "18px",
            position: "relative",
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
              flexShrink: 0,
            }}
          >
            AŞKA
          </button>

          <button
            type="button"
            className={`aska-hamburger ${mobileOpen ? "is-open" : ""}`}
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
          >
            <span />
            <span />
            <span />
          </button>

          {mobileOpen && (
            <button
              type="button"
              className="aska-mobile-backdrop"
              aria-label="Cerrar menú"
              onClick={closeMobileMenu}
            />
          )}

          <nav className={`aska-nav-menu ${mobileOpen ? "open" : ""}`}>
            <Link to="/" style={linkStyle(location.pathname === "/")} onClick={closeMobileMenu}>
              Inicio
            </Link>

            <div
              className="aska-catalog-wrapper"
              
              
            >
              <Link
                to="/catalogo"
                onClick={(e)=>{e.preventDefault(); setShowCatalogMenu(v=>!v);}}
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
                  onClick={(e)=>e.stopPropagation()}
                  className="aska-catalog-menu"
                  
                  
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
                        whiteSpace: "nowrap",
                      }}
                      onClick={closeMobileMenu}
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
              onClick={closeMobileMenu}
            >
              Nosotras
            </Link>

            {isLoggedIn ? (
              <>
                <div
                  className="aska-purchases-wrapper"
                  
                  
                >
                  <Link
                    to="/mis-pedidos"
                    onClick={(e)=>{e.preventDefault(); setShowPurchasesMenu(v=>!v);}}
                    style={linkStyle(
                      location.pathname.startsWith("/mis-pedidos") ||
                        location.pathname.startsWith("/admin")
                    )}
                  >
                    Mi cuenta ˅
                  </Link>

                  {showPurchasesMenu && (
                    <div
                      onClick={(e)=>e.stopPropagation()}
                      className="aska-purchases-menu"
                      
                      
                    >
                      <Link
                        to="/mis-pedidos"
                        style={{
                          display: "block",
                          padding: "14px 28px",
                          color: "#ddd",
                          textDecoration: "none",
                          fontSize: "0.95rem",
                          whiteSpace: "nowrap",
                          fontWeight: 700,
                        }}
                        onClick={closeMobileMenu}
                      >
                        Mis pedidos
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin/pagina"
                          style={{
                            display: "block",
                            padding: "14px 28px",
                            color: "#ddd",
                            textDecoration: "none",
                            fontSize: "0.95rem",
                            whiteSpace: "nowrap",
                            fontWeight: 700,
                          }}
                          onClick={closeMobileMenu}
                        >
                          Administración
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        style={{
                          ...buttonTextStyle,
                          display: "block",
                          width: "100%",
                          padding: "14px 28px",
                          textAlign: "left",
                          color: "#ddd",
                          fontWeight: 700,
                        }}
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div
                  className="aska-purchases-wrapper"
                  
                  
                >
                  <Link
                    to="/login"
                    onClick={(e)=>{e.preventDefault(); setShowPurchasesMenu(v=>!v);}}
                    style={linkStyle(
                      location.pathname.startsWith("/login") ||
                        location.pathname.startsWith("/register")
                    )}
                  >
                    Mi cuenta ˅
                  </Link>

                  {showPurchasesMenu && (
                    <div
                      onClick={(e)=>e.stopPropagation()}
                      className="aska-purchases-menu"
                      
                      
                    >
                      <Link
                        to="/login"
                        style={{
                          display: "block",
                          padding: "14px 28px",
                          color: "#ddd",
                          textDecoration: "none",
                          fontSize: "0.95rem",
                          whiteSpace: "nowrap",
                          fontWeight: 700,
                        }}
                        onClick={closeMobileMenu}
                      >
                        Iniciar sesión
                      </Link>

                      <Link
                        to="/register"
                        style={{
                          display: "block",
                          padding: "14px 28px",
                          color: "#ddd",
                          textDecoration: "none",
                          fontSize: "0.95rem",
                          whiteSpace: "nowrap",
                          fontWeight: 700,
                        }}
                        onClick={closeMobileMenu}
                      >
                        Registrarse
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </nav>

          <Link
            to="/cart"
            className={`aska-navbar-cart ${cartLuxPulse ? "aska-navbar-cart-lux-pulse" : ""}`}
            aria-label="Ir al carrito de compras"
            onClick={closeMobileMenu}
          >
            <span aria-hidden="true">🛒</span>
            {totalCarrito > 0 && (
              <span className={`aska-navbar-cart-badge ${cartLuxPulse ? "aska-navbar-cart-badge-lux-pulse" : ""}`}>{totalCarrito}</span>
            )}
          </Link>
        </div>
      </header>

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

          .aska-hamburger {
            display: none;
            width: 42px;
            height: 42px;
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 12px;
            background: rgba(255,255,255,0.03);
            cursor: pointer;
            padding: 9px;
            flex-direction: column;
            justify-content: center;
            gap: 5px;
            position: relative;
            z-index: 10001;
          }

          .aska-hamburger span {
            display: block;
            width: 100%;
            height: 2px;
            border-radius: 999px;
            background: #f4efe8;
            transition: transform 0.25s ease, opacity 0.25s ease;
          }

          .aska-hamburger.is-open span:nth-child(1) {
            transform: translateY(7px) rotate(45deg);
          }

          .aska-hamburger.is-open span:nth-child(2) {
            opacity: 0;
          }

          .aska-hamburger.is-open span:nth-child(3) {
            transform: translateY(-7px) rotate(-45deg);
          }

          .aska-nav-menu {
            display: flex;
            align-items: center;
            gap: 34px;
            position: relative;
          }

          .aska-catalog-wrapper {
            position: relative;
          }

          .aska-catalog-menu {
            position: absolute;
            top: 48px;
            left: 50%;
            transform: translateX(-50%);
            background: #111;
            border-radius: 6px;
            min-width: 300px;
            padding: 12px 0;
            box-shadow: 0 25px 60px rgba(0,0,0,0.5);
            border: 1px solid rgba(255,255,255,0.05);
          }


          .aska-purchases-wrapper {
            position: relative;
          }

          .aska-purchases-menu {
            position: absolute;
            top: 48px;
            left: 50%;
            transform: translateX(-50%);
            background: #111;
            border-radius: 6px;
            min-width: 260px;
            padding: 12px 0;
            box-shadow: 0 25px 60px rgba(0,0,0,0.5);
            border: 1px solid rgba(255,255,255,0.05);
          }

          .aska-mini-cart-badge {
            min-width: 22px;
            height: 22px;
            padding: 0 7px;
            border-radius: 999px;
            background: #bfa6ff;
            color: #0a0a0a;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 0.78rem;
            font-weight: 900;
          }

          .aska-navbar-cart {
            position: absolute;
            top: 50%;
            right: 86px;
            transform: translateY(-50%);
            z-index: 10002;
            width: 52px;
            height: 52px;
            border-radius: 999px;
            background: rgba(10,10,10,0.94);
            color: #f4efe8;
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 12px 32px rgba(0,0,0,0.28);
            border: 1px solid rgba(255,255,255,0.16);
            font-size: 1.22rem;
          }

          .aska-navbar-cart-badge {
            position: absolute;
            top: -6px;
            right: -6px;
            min-width: 23px;
            height: 23px;
            padding: 0 7px;
            border-radius: 999px;
            background: #bfa6ff;
            color: #0a0a0a;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.78rem;
            font-weight: 900;
          }

          .aska-navbar-cart::before {
            content: "";
            position: absolute;
            inset: -7px;
            border-radius: inherit;
            background: radial-gradient(circle, rgba(230,230,230,0.32), transparent 68%);
            opacity: 0;
            transform: scale(0.75);
            pointer-events: none;
          }

          .aska-navbar-cart-lux-pulse {
            animation: askaCartDivineBounce 0.82s cubic-bezier(0.18, 0.89, 0.32, 1.28);
            box-shadow:
              0 0 0 1px rgba(255,255,255,0.18),
              0 18px 44px rgba(0,0,0,0.38),
              0 0 34px rgba(230,230,230,0.34);
          }

          .aska-navbar-cart-lux-pulse::before {
            animation: askaCartHalo 0.82s ease-out;
          }

          .aska-navbar-cart-badge-lux-pulse {
            animation: askaBadgeDivinePop 0.82s cubic-bezier(0.18, 0.89, 0.32, 1.28);
            background: linear-gradient(135deg, #ffffff, #c9c9c9);
            color: #050505;
          }

          @keyframes askaCartDivineBounce {
            0% {
              transform: translateY(-50%) scale(1) rotate(0deg);
            }
            22% {
              transform: translateY(-50%) scale(1.18) rotate(-4deg);
            }
            42% {
              transform: translateY(-50%) scale(0.96) rotate(3deg);
            }
            64% {
              transform: translateY(-50%) scale(1.08) rotate(-1.5deg);
            }
            100% {
              transform: translateY(-50%) scale(1) rotate(0deg);
            }
          }

          @keyframes askaBadgeDivinePop {
            0% {
              transform: scale(1);
            }
            22% {
              transform: scale(1.45);
            }
            48% {
              transform: scale(0.92);
            }
            72% {
              transform: scale(1.18);
            }
            100% {
              transform: scale(1);
            }
          }

          @keyframes askaCartHalo {
            0% {
              opacity: 0;
              transform: scale(0.7);
            }
            35% {
              opacity: 1;
              transform: scale(1.2);
            }
            100% {
              opacity: 0;
              transform: scale(1.65);
            }
          }

          .aska-mobile-backdrop {
            display: none;
          }

          @media (max-width: 768px) {
            .aska-navbar-inner {
              padding: 14px 124px 14px 18px !important;
            }

            .aska-hamburger {
              display: flex;
            }

            .aska-mobile-backdrop {
              display: block;
              position: fixed;
              inset: 0;
              z-index: 9998;
              background: rgba(0,0,0,0.55);
              border: none;
              padding: 0;
            }

            .aska-nav-menu {
              position: fixed;
              top: 0;
              right: 0;
              z-index: 9999;
              width: min(82vw, 340px);
              height: 100vh;
              padding: 92px 28px 34px;
              background: rgba(8,8,9,0.98);
              border-left: 1px solid rgba(255,255,255,0.08);
              box-shadow: -20px 0 60px rgba(0,0,0,0.55);
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              justify-content: flex-start;
              gap: 22px;
              transform: translateX(105%);
              transition: transform 0.28s ease;
              overflow-y: auto;
            }

            .aska-nav-menu.open {
              transform: translateX(0);
            }

            .aska-nav-menu a,
            .aska-nav-menu button {
              font-size: 1.05rem !important;
              width: 100%;
              text-align: left;
            }


            .aska-purchases-wrapper {
              width: 100%;
            }

            .aska-purchases-menu {
              position: static;
              transform: none;
              min-width: 100%;
              margin-top: 12px;
              padding: 6px 0;
              box-shadow: none;
              background: rgba(255,255,255,0.04);
              border-radius: 14px;
            }

            .aska-purchases-menu a {
              padding: 12px 16px !important;
              white-space: normal !important;
            }

            .aska-navbar-cart {
              right: 16px;
              width: 46px;
              height: 46px;
              font-size: 1.08rem;
            }

            .aska-catalog-wrapper {
              width: 100%;
            }

            .aska-catalog-menu {
              position: static;
              transform: none;
              min-width: 100%;
              margin-top: 12px;
              padding: 6px 0;
              box-shadow: none;
              background: rgba(255,255,255,0.04);
              border-radius: 14px;
            }

            .aska-catalog-menu a {
              padding: 12px 16px !important;
              white-space: normal !important;
            }
          }
        `}
      </style>
    </>
  );
}

export default Navbar;