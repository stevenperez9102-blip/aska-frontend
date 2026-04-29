import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import videoLogin from "../assets/proceso5.mp4";

function EyeIcon({ open = true }) {
  if (open) {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 12C3.8 8.5 7.3 6 12 6C16.7 6 20.2 8.5 22 12C20.2 15.5 16.7 18 12 18C7.3 18 3.8 15.5 2 12Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 3L21 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10.6 6.3C11.1 6.1 11.5 6 12 6C16.7 6 20.2 8.5 22 12C21.2 13.5 20.2 14.8 18.9 15.9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14.8 14.9C14.1 15.6 13.1 16 12 16C9.8 16 8 14.2 8 12C8 10.9 8.4 9.9 9.1 9.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.1 8.1C4.8 9.2 3.8 10.5 2 12C3.8 15.5 7.3 18 12 18C12.5 18 12.9 17.9 13.4 17.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    correo: "",
    password: "",
  });

  const [mensaje, setMensaje] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setMensaje("");
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cargando) return;

    const correoLimpio = formData.correo.trim().toLowerCase();
    const passwordLimpio = formData.password;

    if (!correoLimpio || !passwordLimpio) {
      setMensaje("Completa todos los campos");
      return;
    }

    setMensaje("");
    setCargando(true);

    try {
      const response = await fetch("https://aska-backend-nyx8.onrender.com/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: correoLimpio,
          password: passwordLimpio,
        }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setMensaje(data?.mensaje || "No se pudo iniciar sesión");
        return;
      }

      if (!data?.usuario) {
        setMensaje("La respuesta del servidor no es válida");
        return;
      }

      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      window.dispatchEvent(new Event("auth-changed"));
      navigate("/");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setMensaje("Error de conexión con el servidor");
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <Navbar />

      <section className="auth-page">
        <video
          className="auth-bg-video"
          src={videoLogin}
          autoPlay
          loop
          muted
          playsInline
        />

        <div className="auth-overlay" />

        <div className="auth-container">
          <p className="auth-eyebrow">Bienvenida de nuevo</p>
          <h1>Iniciar sesión</h1>
          <p className="auth-sub">
            Entra a tu cuenta para continuar con tu experiencia en AŞKA.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-group">
              <label>Correo electrónico</label>
              <input
                type="email"
                name="correo"
                placeholder="tucorreo@ejemplo.com"
                value={formData.correo}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-group">
              <label>Contraseña</label>
              <div className="password-field">
                <input
                  className="password-input"
                  type={mostrarPassword ? "text" : "password"}
                  name="password"
                  placeholder="Tu contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setMostrarPassword((prev) => !prev)}
                  aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  title={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <EyeIcon open={!mostrarPassword} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-button"
              disabled={cargando}
            >
              {cargando ? "Entrando..." : "Entrar"}
            </button>

            {mensaje && <p className="auth-message">{mensaje}</p>}
          </form>

          <p className="auth-extra">
            <Link to="/recuperar-password">
              <span>¿Olvidaste tu contraseña?</span>
            </Link>
          </p>

          <p className="auth-extra">
            <Link to="/register">
              <span>Crear una cuenta</span>
            </Link>
          </p>
        </div>
      </section>
    
      <style>
        {`
        .auth-page{
          position:relative;
          min-height:100vh;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:40px 16px;
          background: linear-gradient(to bottom, rgba(0,0,0,0.85) 40%, #f5f5f5 100%);
        }
        .auth-bg-video{
          position:absolute;
          inset:0;
          width:100%;
          height:100%;
          object-fit:cover;
          opacity:0.35;
        }
        .auth-overlay{
          position:absolute;
          inset:0;
          background: radial-gradient(circle at center, rgba(0,0,0,0.6), rgba(0,0,0,0.9));
        }
        .auth-container{
          position:relative;
          z-index:2;
          width:100%;
          max-width:420px;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(14px);
          border-radius:20px;
          padding:28px 22px;
          border:1px solid rgba(255,255,255,0.15);
          box-shadow:0 20px 60px rgba(0,0,0,0.5);
          color:#fff;
        }
        .auth-container h1{
          font-size:2rem;
          margin:8px 0 10px;
        }
        .auth-sub{
          font-size:0.9rem;
          color:rgba(255,255,255,0.7);
          margin-bottom:18px;
        }
        .auth-group label{
          font-size:0.8rem;
          color:#ddd;
        }
        .auth-group input{
          width:100%;
          padding:12px 14px;
          border-radius:12px;
          border:none;
          margin-top:6px;
          background:#fff;
          color:#000;
          font-size:0.9rem;
        }
        .password-field{
          position:relative;
        }
        .password-toggle{
          position:absolute;
          right:10px;
          top:50%;
          transform:translateY(-50%);
          background:none;
          border:none;
          cursor:pointer;
          color:#333;
        }
        .auth-submit-button{
          width:100%;
          margin-top:18px;
          padding:12px;
          border-radius:999px;
          border:none;
          background:#fff;
          color:#000;
          font-weight:600;
          cursor:pointer;
        }
        .auth-extra{
          margin-top:10px;
          font-size:0.8rem;
          text-align:center;
        }
        @media (max-width:768px){
          .auth-container{
            padding:22px 16px;
            border-radius:16px;
          }
        }
        `}
      </style>

    </>
  );
}

export default Login;