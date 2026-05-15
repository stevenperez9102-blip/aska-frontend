import { useEffect, useRef, useState } from "react";
import mwakiAudio from "./assets/audio/mwaki.mp3";
import ritmoAudio from "./assets/audio/ritmo.mp3";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Confirmacion from "./pages/Confirmacion";

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
import AdminDashboard from "./pages/AdminDashboard";
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
  const [musicMuted, setMusicMuted] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(0);

  const [cmsLoaded, setCmsLoaded] = useState(false);


  const [cmsVisual, setCmsVisual] = useState({
    accent: "#c9c9c9",
    background: "#050505",
    text: "#ffffff",
    navbar: "#050505",
    font: "Playfair Display",
  });

  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);
  const audioRef = useRef(null);

  const tracks = [
    {
      title: "Mwaki",
      artist: "Zerb",
      src: mwakiAudio,
    },
    {
      title: "Ritmo",
      artist: "Raffa FL",
      src: ritmoAudio,
    },
  ];


  useEffect(() => {
    const cargarCmsVisual = async () => {
      try {
        const response = await fetch(
          "https://aska-backend-nyx8.onrender.com/api/admin/cms-visual"
        );

        const data = await response.json();

        if (!data) return;

        const visual = {
          accent: data.cms_accent_color || "#c9c9c9",
          background: data.cms_background_color || "#050505",
          text: data.cms_text_color || "#ffffff",
          navbar: data.cms_navbar_background || "#050505",
          font: data.cms_font_family || "Playfair Display",
        };

        setCmsVisual(visual);

        setCmsLoaded(true);

        const root = document.documentElement;

        root.style.setProperty(
          "--aska-accent-primary",
          visual.accent
        );

        root.style.setProperty(
          "--aska-bg-primary",
          visual.background
        );

        root.style.setProperty(
          "--aska-text-primary",
          visual.text
        );

        root.style.setProperty(
          "--aska-text-secondary",
          visual.text
        );

        root.style.setProperty(
          "--aska-navbar-background",
          visual.navbar
        );

        root.style.setProperty(
          "--aska-font-family-primary",
          visual.font
        );

        root.style.setProperty(
          "--aska-font-family-secondary",
          visual.font
        );

        root.style.setProperty(
          "--aska-card-bg",
          "rgba(255,255,255,0.96)"
        );

        root.style.setProperty(
          "--aska-card-dark",
          "#0d0d0d"
        );

        root.style.setProperty(
          "--aska-card-dark-2",
          "#111111"
        );

        root.style.setProperty(
          "--aska-card-soft",
          "rgba(255,255,255,0.06)"
        );

        root.style.setProperty(
          "--aska-success-color",
          "#1f8f5f"
        );

        document.body.style.background = visual.background;
        document.body.style.color = visual.text;
        document.body.style.fontFamily = visual.font;
      } catch (error) {
        console.error("Error cargando CMS visual:", error);
        setCmsLoaded(true);
      }
    };

    cargarCmsVisual();
  }, []);


  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.volume = 0.34;
    audioRef.current.muted = musicMuted;

    if (musicPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [musicMuted, musicPlaying, currentTrack]);

  const handleNextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
  };

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

      <style>
        {`
          :root{
            --aska-accent-primary:#c9c9c9;
            --aska-bg-primary:#050505;
            --aska-text-primary:#ffffff;
            --aska-text-secondary:#ffffff;
            --aska-navbar-background:#050505;
            --aska-font-family-primary:'Playfair Display', serif;
            --aska-font-family-secondary:'Playfair Display', serif;
          }

          *{
            box-sizing:border-box;
          }

          html{
            scroll-behavior:smooth;
          }

          body{
            margin:0;
            background:var(--aska-bg-primary, #050505);
            color:var(--aska-text-secondary, #fff);
            font-family:var(--aska-font-family-secondary, inherit);
            transition:
              background .32s ease,
              color .32s ease,
              font-family .22s ease;
          }

          button,
          input,
          textarea,
          select{
            font-family:var(--aska-font-family-secondary, inherit);
          }

          h1,
          h2,
          h3,
          h4,
          h5{
            font-family:var(--aska-font-family-primary, inherit);
          }

          a{
            color:inherit;
            text-decoration:none;
          }

          .aska-music-player{
            position:fixed;
            left:24px;
            bottom:24px;
            z-index:99999;
            min-width:290px;
            padding:16px 18px;
            background:rgba(8,8,8,0.82);
            border:1px solid rgba(255,255,255,0.12);
            backdrop-filter:blur(20px) saturate(120%);
            -webkit-backdrop-filter:blur(20px) saturate(120%);
            color:#ffffff;
            box-shadow:0 24px 70px rgba(0,0,0,0.28);
          }

          .aska-music-player-info span{
            display:block;
            margin-bottom:6px;
            color:rgba(255,255,255,0.48);
            font-size:0.62rem;
            font-weight:700;
            letter-spacing:0.18em;
            text-transform:uppercase;
          }

          .aska-music-player-info strong{
            display:block;
            font-size:1rem;
            font-weight:600;
            letter-spacing:0.04em;
          }

          .aska-music-player-info small{
            display:block;
            margin-top:3px;
            color:rgba(255,255,255,0.58);
            font-size:0.78rem;
            letter-spacing:0.08em;
            text-transform:uppercase;
          }

          .aska-music-player-controls{
            display:flex;
            gap:10px;
            margin-top:14px;
          }

          .aska-music-player-controls button{
            min-height:34px;
            padding:0 12px;
            border:none;
            background:rgba(255,255,255,0.08);
            color:#ffffff;
            cursor:pointer;
            font-size:0.66rem;
            font-weight:700;
            letter-spacing:0.14em;
            text-transform:uppercase;
            transition:
              background .24s ease,
              transform .24s ease;
          }

          .aska-music-player-controls button:hover{
            background:rgba(255,255,255,0.16);
            transform:translateY(-1px);
          }


        `}
      </style>


      <div
        onClickCapture={handleSecretAreaClick}
        style={{
          background: "var(--aska-bg-primary, #050505)",
          color: "var(--aska-text-secondary, #fff)",
          minHeight: "100vh",
          opacity: cmsLoaded ? 1 : 0,
          transition: "opacity .35s ease",
          fontFamily: "var(--aska-font-family-secondary, inherit)",
        }}
      >
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
                background: `${cmsVisual.background}EE`,
                border: "1px solid rgba(255,255,255,0.14)",
                boxShadow: "0 30px 90px rgba(0,0,0,0.65)",
                color: cmsVisual.text,
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
                  fontFamily: "var(--aska-font-family-primary, inherit)",
                }}
              >
                ¿Estás listx para elevar tu estilo con AŞKA?⚡️
              </h2>

              <h3
                style={{
                  margin: "16px 0 0",
                  fontSize: "clamp(1.05rem, 3vw, 1.7rem)",
                  color: cmsVisual.accent,
                  lineHeight: 1.35,
                }}
              >
                
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


        <audio
          ref={audioRef}
          src={tracks[currentTrack].src}
          autoPlay
          onEnded={handleNextTrack}
        />

        <div className="aska-music-player">
          <div className="aska-music-player-info">
            <span>Now playing</span>
            <strong>{tracks[currentTrack].title}</strong>
            <small>{tracks[currentTrack].artist}</small>
          </div>

          <div className="aska-music-player-controls">
            <button
              type="button"
              onClick={() => setMusicPlaying((prev) => !prev)}
              aria-label={musicPlaying ? "Pausar música" : "Reproducir música"}
            >
              {musicPlaying ? "Pause" : "Play"}
            </button>

            <button
              type="button"
              onClick={handleNextTrack}
              aria-label="Siguiente canción"
            >
              Next
            </button>

            <button
              type="button"
              onClick={() => setMusicMuted((prev) => !prev)}
              aria-label={musicMuted ? "Activar sonido" : "Silenciar"}
            >
              {musicMuted ? "Muted" : "Sound"}
            </button>
          </div>
        </div>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/confirmacion" element={<Confirmacion />} />
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

          <Route path="/checkout" element={<Checkout />} />

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

          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
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