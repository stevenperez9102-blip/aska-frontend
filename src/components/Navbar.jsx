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


function ClassicBagIcon() {
  return (
    <svg
      className="aska-cart-bag-svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M7.25 8.25V7.1C7.25 4.42 9.36 2.25 12 2.25C14.64 2.25 16.75 4.42 16.75 7.1V8.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
      />
      <path
        d="M5.65 8.25H18.35L19.25 21.25H4.75L5.65 8.25Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinejoin="round"
      />
    </svg>
  );
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
  const [scrolled, setScrolled] = useState(false);

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
    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.72;
      setScrolled(window.scrollY > heroHeight);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setShowCatalogMenu(false);
    setShowPurchasesMenu(false);
  };

  const linkStyle = (active = false) => ({
    color: active ? "#ffffff" : "rgba(255,255,255,0.78)",
    textDecoration: "none",
    fontWeight: active ? 560 : 440,
    fontSize: "0.7rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    transition: "color 0.28s ease, opacity 0.28s ease, transform 0.28s ease",
    whiteSpace: "nowrap",
  });

  const buttonTextStyle = {
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    color: "rgba(255,255,255,0.78)",
    fontWeight: 440,
    fontSize: "0.7rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    fontFamily: "var(--aska-font-family-secondary, Helvetica, Arial, sans-serif)",
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
    e.preventDefault();
    setShowPurchasesMenu((value) => !value);
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

  const dropdownLinkStyle = {
    display: "block",
    padding: "15px 28px",
    color: "rgba(255,255,255,0.78)",
    textDecoration: "none",
    fontSize: "0.74rem",
    whiteSpace: "nowrap",
    fontWeight: 440,
    letterSpacing: "0.08em",
  };

  return (
    <>
      {secretActive && (
        <div className="aska-secret-overlay">
          {Array.from({ length: 38 }).map((_, i) => (
            <span
              key={i}
              className="aska-secret-chain"
              style={{
                left: `${(i * 7.3) % 100}%`,
                animationDuration: `${3 + (i % 5) * 0.35}s`,
                animationDelay: `${(i % 8) * 0.16}s`,
              }}
            >
              ⛓
            </span>
          ))}

          <div className="aska-secret-card-lux">
            <p>✨ Se desbloqueó el secreto de AŞKA ✨</p>
            <h2>¿Estás listx para elevar tu estilo con AŞKA?⚡️</h2>
            <h3>y Nicky una agente secreta de las zuricatas!</h3>
          </div>
        </div>
      )}

      <header
        className={`aska-site-header ${scrolled ? "is-scrolled" : "is-transparent"}`}
      >
        <div className="aska-navbar-inner">
          <button
            type="button"
            onClick={handleSecretClick}
            className="aska-brand-logo-button"
            aria-label="Ir al inicio AŞKA"
          >
            <img
              src="/askablanco.png"
              alt="AŞKA"
              className="aska-brand-logo-img"
            />
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
              onMouseEnter={openMenu}
              onMouseLeave={closeMenu}
            >
              <Link
                to="/catalogo"
                onClick={toggleCatalogMenu}
                style={linkStyle(
                  location.pathname === "/catalogo" ||
                    location.pathname.startsWith("/catalogo/") ||
                    location.pathname.startsWith("/producto/")
                )}
              >
                Catálogo
              </Link>

              {showCatalogMenu && (
                <div
                  className="aska-catalog-menu"
                  onMouseEnter={openMenu}
                  onMouseLeave={closeMenu}
                >
                  <p className="aska-menu-kicker">Colecciones</p>
                  {categorias.map((categoria) => (
                    <Link
                      key={categoria}
                      to={`/catalogo/${slugifyCategory(categoria)}`}
                      style={dropdownLinkStyle}
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
              <div
                className="aska-purchases-wrapper"
                onMouseEnter={openPurchasesMenu}
                onMouseLeave={closePurchasesMenu}
              >
                <Link
                  to="/mis-pedidos"
                  onClick={togglePurchasesMenu}
                  style={linkStyle(
                    location.pathname.startsWith("/mis-pedidos") ||
                      location.pathname.startsWith("/admin")
                  )}
                >
                  Mi cuenta
                </Link>

                {showPurchasesMenu && (
                  <div
                    className="aska-purchases-menu"
                    onMouseEnter={openPurchasesMenu}
                    onMouseLeave={closePurchasesMenu}
                  >
                    <p className="aska-menu-kicker">Cuenta</p>
                    <Link
                      to="/mis-pedidos"
                      style={dropdownLinkStyle}
                      onClick={closeMobileMenu}
                    >
                      Mis pedidos
                    </Link>

                    {isAdmin && (
                      <>
                        <Link
                          to="/admin/dashboard"
                          style={dropdownLinkStyle}
                          onClick={closeMobileMenu}
                        >
                          Dashboard
                        </Link>

                        <Link
                          to="/admin/pagina"
                          style={dropdownLinkStyle}
                          onClick={closeMobileMenu}
                        >
                          Administración
                        </Link>
                      </>
                    )}

                    <button
                      onClick={handleLogout}
                      style={{
                        ...buttonTextStyle,
                        display: "block",
                        width: "100%",
                        padding: "15px 28px",
                        textAlign: "left",
                      }}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="aska-purchases-wrapper"
                onMouseEnter={openPurchasesMenu}
                onMouseLeave={closePurchasesMenu}
              >
                <Link
                  to="/login"
                  onClick={togglePurchasesMenu}
                  style={linkStyle(
                    location.pathname.startsWith("/login") ||
                      location.pathname.startsWith("/register")
                  )}
                >
                  Mi cuenta
                </Link>

                {showPurchasesMenu && (
                  <div
                    className="aska-purchases-menu"
                    onMouseEnter={openPurchasesMenu}
                    onMouseLeave={closePurchasesMenu}
                  >
                    <p className="aska-menu-kicker">Acceso</p>
                    <Link
                      to="/login"
                      style={dropdownLinkStyle}
                      onClick={closeMobileMenu}
                    >
                      Iniciar sesión
                    </Link>

                    <Link
                      to="/register"
                      style={dropdownLinkStyle}
                      onClick={closeMobileMenu}
                    >
                      Registrarse
                    </Link>
                  </div>
                )}
              </div>
            )}
          </nav>

          <Link
            to="/cart"
            className={`aska-navbar-cart ${cartLuxPulse ? "aska-navbar-cart-lux-pulse" : ""}`}
            aria-label="Ir al carrito de compras"
            onClick={closeMobileMenu}
          >
            <ClassicBagIcon />
            {totalCarrito > 0 && (
              <span className={`aska-navbar-cart-badge ${cartLuxPulse ? "aska-navbar-cart-badge-lux-pulse" : ""}`}>{totalCarrito}</span>
            )}
          </Link>
        </div>
      </header>

      <style>
        {`
          :root {
            --aska-navbar-bg: rgba(7,7,7,0.42);
            --aska-navbar-bg-scrolled: rgba(8,8,8,0.86);
            --aska-navbar-border: rgba(255,255,255,0.06);
            --aska-text-color: #f7f2ec;
            --aska-menu-bg: rgba(9,9,9,0.86);
            --aska-menu-border: rgba(255,255,255,0.10);
            --aska-font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
          }

          .aska-site-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 9999;
            background: transparent;
            border-bottom: 1px solid transparent;
            transition:
              background .42s ease,
              backdrop-filter .42s ease,
              border-color .42s ease,
              transform .42s ease;
          }

          .aska-site-header.is-transparent {
            background: transparent !important;
            border-bottom-color: transparent !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }

          .aska-site-header.is-transparent::before {
            content: "";
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            height: 140%;
            background: linear-gradient(180deg, rgba(0,0,0,0.34), rgba(0,0,0,0.10) 56%, rgba(0,0,0,0.00));
            pointer-events: none;
            z-index: -1;
          }

          .aska-site-header.is-transparent .aska-navbar-inner {
            background: transparent !important;
            border-bottom-color: transparent !important;
            box-shadow: none !important;
          }

          .aska-site-header.is-scrolled {
            background: var(--aska-navbar-bg-scrolled) !important;
            border-bottom-color: var(--aska-navbar-border) !important;
            backdrop-filter: blur(18px) saturate(118%);
            -webkit-backdrop-filter: blur(18px) saturate(118%);
          }

          .aska-navbar-inner {
            width: 100%;
            margin: 0;
            min-height: 78px;
            padding: 0 92px 0 18px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 24px;
            position: relative;
            background: transparent !important;
            transition:
              min-height .42s ease,
              padding .42s ease;
          }

          .aska-site-header.is-scrolled .aska-navbar-inner {
            min-height: 64px;
          }

          .aska-brand-logo-button {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 0;
            flex-shrink: 0;
            display: inline-flex;
            align-items: center;
            justify-content: flex-start;
            min-width: 190px;
            overflow: visible;
            transform: translateY(0);
          }

          .aska-brand-logo-img {
            display: block;
            height: 58px;
            width: auto;
            object-fit: contain;
            transform: scale(1.58) translateX(-10px);
            transform-origin: left center;
            transition:
              height .42s ease,
              transform .42s ease,
              opacity .28s ease;
          }

          .aska-brand-logo-button:hover .aska-brand-logo-img {
            opacity: .86;
          }

          .aska-site-header.is-scrolled .aska-brand-logo-img {
            height: 50px;
            transform: scale(1.46) translateX(-8px);
          }

          .aska-nav-menu {
            display: flex;
            align-items: center;
            gap: clamp(32px, 4vw, 62px);
            position: relative;
            margin-left: auto;
            padding-right: 4px;
          }

          .aska-nav-menu > a,
          .aska-nav-menu > div > a {
            position: relative;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif) !important;
          }

          .aska-nav-menu > a:hover,
          .aska-nav-menu > div > a:hover {
            color: #ffffff !important;
            transform: translateY(-1px);
          }

          .aska-nav-menu > a::after,
          .aska-nav-menu > div > a::after {
            content: "";
            position: absolute;
            left: 50%;
            bottom: -12px;
            width: 22px;
            height: 1px;
            background: currentColor;
            transform: translateX(-50%) scaleX(0);
            transform-origin: center;
            transition: transform .34s ease, opacity .34s ease;
            opacity: .68;
          }

          .aska-nav-menu > a:hover::after,
          .aska-nav-menu > div > a:hover::after {
            transform: translateX(-50%) scaleX(1);
          }

          .aska-catalog-wrapper,
          .aska-purchases-wrapper {
            position: relative;
          }

          .aska-purchases-wrapper::after,
          .aska-catalog-wrapper::after {
            content: "";
            position: absolute;
            left: -22px;
            right: -22px;
            top: 22px;
            height: 44px;
            pointer-events: auto;
          }

          .aska-catalog-menu,
          .aska-purchases-menu {
            position: absolute;
            top: 44px;
            left: 50%;
            transform: translateX(-50%);
            min-width: 292px;
            padding: 18px 0 10px;
            border-radius: 0;
            background: var(--aska-menu-bg) !important;
            border: 1px solid var(--aska-menu-border);
            box-shadow: 0 20px 48px rgba(0,0,0,0.18);
            backdrop-filter: blur(22px) saturate(118%);
            -webkit-backdrop-filter: blur(22px) saturate(118%);
            animation: askaMenuReveal .28s ease both;
            overflow: hidden;
          }

          .aska-purchases-menu {
            min-width: 248px;
          }

          .aska-catalog-menu::before,
          .aska-purchases-menu::before {
            content: "";
            position: absolute;
            left: 22px;
            right: 22px;
            top: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent);
          }

          .aska-menu-kicker {
            margin: 0 28px 8px;
            color: rgba(255,255,255,0.40);
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: 0.62rem;
            font-weight: 600;
            letter-spacing: 0.24em;
            text-transform: uppercase;
          }

          .aska-catalog-menu a,
          .aska-purchases-menu a,
          .aska-purchases-menu button {
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif) !important;
            transition:
              color .28s ease,
              background .28s ease,
              padding-left .28s ease;
          }

          .aska-catalog-menu a:hover,
          .aska-purchases-menu a:hover,
          .aska-purchases-menu button:hover {
            color: #ffffff !important;
            background: rgba(255,255,255,0.055) !important;
            padding-left: 34px !important;
            box-shadow: none !important;
            transform: none !important;
            opacity: 1 !important;
          }

          .aska-navbar-cart {
            position: absolute;
            top: 50%;
            right: 26px;
            transform: translateY(-50%);
            z-index: 10002;
            width: 38px;
            height: 42px;
            padding: 0;
            border-radius: 0;
            color: rgba(255,255,255,0.88);
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: none;
            box-shadow: none;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            overflow: visible;
            transition:
              color .28s ease,
              opacity .28s ease,
              transform .28s ease;
          }

          .aska-site-header.is-scrolled .aska-navbar-cart {
            background: transparent;
          }

          .aska-navbar-cart:hover {
            color: #ffffff;
            opacity: 1;
            transform: translateY(-50%) translateY(-1px);
          }

          .aska-cart-bag-svg {
            width: 24px;
            height: 24px;
            display: block;
            color: currentColor;
            opacity: 0.92;
            transition:
              opacity .28s ease,
              transform .28s ease;
          }

          .aska-navbar-cart:hover .aska-cart-bag-svg {
            opacity: 1;
            transform: scale(1.045);
          }

          .aska-navbar-cart-badge {
            position: absolute;
            top: 3px;
            right: -10px;
            min-width: 16px;
            height: 16px;
            padding: 0 4px;
            border-radius: 999px;
            background: transparent;
            color: rgba(255,255,255,0.92);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.62rem;
            font-weight: 600;
            border: none;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
          }

          .aska-navbar-cart::before {
            content: "";
            position: absolute;
            inset: -7px;
            border-radius: inherit;
            background: radial-gradient(circle, rgba(255,255,255,0.32), transparent 68%);
            opacity: 0;
            transform: scale(0.75);
            pointer-events: none;
          }

          .aska-navbar-cart-lux-pulse {
            animation: askaCartLuxuryPulse 0.82s cubic-bezier(0.18, 0.89, 0.32, 1.28);
          }

          .aska-navbar-cart-lux-pulse::before {
            animation: askaCartHalo 0.82s ease-out;
          }

          .aska-navbar-cart-badge-lux-pulse {
            animation: askaBadgeLuxuryPop 0.82s cubic-bezier(0.18, 0.89, 0.32, 1.28);
            background: transparent;
            color: #ffffff;
          }

          .aska-hamburger {
            display: none;
            width: 42px;
            height: 42px;
            border: 1px solid rgba(255,255,255,0.16);
            border-radius: 999px;
            background: rgba(255,255,255,0.045);
            cursor: pointer;
            padding: 11px;
            flex-direction: column;
            justify-content: center;
            gap: 5px;
            position: relative;
            z-index: 10001;
            transition: background .28s ease, border-color .28s ease;
          }

          .aska-hamburger span {
            display: block;
            width: 100%;
            height: 1px;
            border-radius: 999px;
            background: #ffffff;
            transition: transform 0.25s ease, opacity 0.25s ease;
          }

          .aska-hamburger.is-open span:nth-child(1) {
            transform: translateY(6px) rotate(45deg);
          }

          .aska-hamburger.is-open span:nth-child(2) {
            opacity: 0;
          }

          .aska-hamburger.is-open span:nth-child(3) {
            transform: translateY(-6px) rotate(-45deg);
          }

          .aska-mobile-backdrop {
            display: none;
          }

          .aska-secret-overlay {
            position: fixed;
            inset: 0;
            z-index: 999999;
            background: radial-gradient(circle at center, rgba(138,103,179,0.24), transparent 45%), rgba(0,0,0,0.96);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }

          .aska-secret-chain {
            position: absolute;
            top: -80px;
            color: rgba(255,255,255,0.78);
            font-size: 2rem;
            animation-name: askaFall;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
          }

          .aska-secret-card-lux {
            position: relative;
            z-index: 5;
            width: min(720px, 88vw);
            padding: 42px 34px;
            text-align: center;
            border-radius: 34px;
            background: rgba(15,15,16,0.82);
            border: 1px solid rgba(255,255,255,0.14);
            box-shadow: 0 30px 90px rgba(0,0,0,0.65);
            color: #fff;
          }

          .aska-secret-card-lux p {
            margin: 0 0 16px;
            color: rgba(255,255,255,0.72);
            letter-spacing: 0.12em;
            text-transform: uppercase;
            font-size: 0.85rem;
          }

          .aska-secret-card-lux h2 {
            margin: 0;
            font-size: clamp(2.4rem, 7vw, 5.2rem);
            line-height: 1;
          }

          .aska-secret-card-lux h3 {
            margin: 16px 0 0;
            font-size: clamp(1.05rem, 3vw, 1.7rem);
            color: #d6b36a;
            line-height: 1.35;
          }

          @keyframes askaMenuReveal {
            from {
              opacity: 0;
              transform: translateX(-50%) translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
          }

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

          @keyframes askaCartLuxuryPulse {
            0% { transform: translateY(-50%) scale(1); }
            32% { transform: translateY(-50%) scale(1.08); }
            68% { transform: translateY(-50%) scale(0.98); }
            100% { transform: translateY(-50%) scale(1); }
          }

          @keyframes askaBadgeLuxuryPop {
            0% { transform: scale(1); }
            32% { transform: scale(1.34); }
            68% { transform: scale(0.94); }
            100% { transform: scale(1); }
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

          @media (max-width: 920px) {
            .aska-navbar-inner {
              padding-right: 104px;
            }

            .aska-nav-menu {
              gap: 24px;
            }
          }

          @media (max-width: 768px) {
            .aska-site-header.is-transparent {
              background: transparent !important;
              border-bottom-color: transparent !important;
              backdrop-filter: none !important;
              -webkit-backdrop-filter: none !important;
            }

            .aska-site-header.is-scrolled {
              background: rgba(5,5,5,0.88) !important;
              border-bottom: 1px solid rgba(255,255,255,0.08) !important;
              backdrop-filter: blur(16px);
              -webkit-backdrop-filter: blur(16px);
            }

            .aska-navbar-inner {
              padding: 10px 108px 10px 16px !important;
              min-height: 66px !important;
            }

            .aska-brand-logo-button {
              min-width: 128px;
            }

            .aska-brand-logo-img,
            .aska-site-header.is-scrolled .aska-brand-logo-img {
              height: 54px;
              max-width: none;
              transform: scale(1.78) translateX(-10px);
              transform-origin: left center;
            }

            .aska-hamburger {
              display: flex;
              position: absolute;
              right: 60px;
              top: 50%;
              transform: translateY(-50%);
              width: 42px;
              height: 42px;
            }

            .aska-mobile-backdrop {
              display: block;
              position: fixed;
              inset: 0;
              z-index: 9998;
              background: rgba(0,0,0,0.58);
              border: none;
              padding: 0;
            }

            .aska-nav-menu {
              position: fixed;
              top: 0;
              right: 0;
              z-index: 9999;
              width: min(84vw, 360px);
              height: 100vh;
              padding: 94px 30px 36px;
              background:
                linear-gradient(180deg, rgba(255,255,255,0.04), transparent 24%),
                rgba(7,7,8,0.98);
              border-left: 1px solid rgba(255,255,255,0.10);
              box-shadow: -24px 0 70px rgba(0,0,0,0.54);
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              justify-content: flex-start;
              gap: 24px;
              transform: translateX(105%);
              transition: transform 0.32s ease;
              overflow-y: auto;
              margin-left: 0;
            }

            .aska-nav-menu.open {
              transform: translateX(0);
            }

            .aska-nav-menu a,
            .aska-nav-menu button {
              font-size: 0.86rem !important;
              width: 100%;
              text-align: left;
              letter-spacing: 0.18em !important;
            }

            .aska-nav-menu > a::after,
            .aska-nav-menu > div > a::after {
              left: 0;
              bottom: -8px;
              transform: scaleX(0);
              transform-origin: left;
            }

            .aska-nav-menu > a:hover::after,
            .aska-nav-menu > div > a:hover::after {
              transform: scaleX(1);
            }

            .aska-purchases-wrapper,
            .aska-catalog-wrapper {
              width: 100%;
            }

            .aska-purchases-wrapper::after,
            .aska-catalog-wrapper::after {
              display: none;
              pointer-events: none !important;
            }

            .aska-purchases-menu,
            .aska-catalog-menu {
              position: static;
              transform: none;
              min-width: 100%;
              margin-top: 14px;
              padding: 18px 0 10px;
              box-shadow: none;
              background: rgba(255,255,255,0.045) !important;
              border-radius: 0;
              border: 1px solid rgba(255,255,255,0.08);
              animation: none;
            }

            .aska-purchases-menu a,
            .aska-catalog-menu a,
            .aska-purchases-menu button {
              padding: 13px 18px !important;
              white-space: normal !important;
              font-size: 0.78rem !important;
            }

            .aska-menu-kicker {
              margin: 0 18px 8px;
            }

            .aska-navbar-cart {
              right: 16px;
              min-width: 34px;
              width: 34px;
              height: 40px;
              padding: 0;
            }

            .aska-cart-bag-svg {
              width: 22px;
              height: 22px;
            }
          }
        `}
      </style>
    </>
  );
}

export default Navbar;
