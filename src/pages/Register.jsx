import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import videoRegistro from "../assets/proceso2.mp4";

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

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    fechaNacimiento: "",
    password: "",
    confirmarPassword: "",
  });

  const [mensaje, setMensaje] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false);
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

    const nombreLimpio = formData.nombre.trim();
    const correoLimpio = formData.correo.trim().toLowerCase();
    const passwordLimpia = formData.password;
    const confirmarPasswordLimpia = formData.confirmarPassword;

    setMensaje("");

    if (
      !nombreLimpio ||
      !correoLimpio ||
      !formData.fechaNacimiento ||
      !passwordLimpia ||
      !confirmarPasswordLimpia
    ) {
      setMensaje("Completa todos los campos");
      return;
    }

    if (passwordLimpia !== confirmarPasswordLimpia) {
      setMensaje("Las contraseñas no coinciden");
      return;
    }

    if (passwordLimpia.length < 6) {
      setMensaje("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setCargando(true);

    try {
      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 30000);

      const response = await fetch("https://aska-backend-nyx8.onrender.com/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          nombre: nombreLimpio,
          correo: correoLimpio,
          fechaNacimiento: formData.fechaNacimiento,
          password: passwordLimpia,
        }),
      });

      clearTimeout(timeout);

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setMensaje(data?.mensaje || "No se pudo registrar la cuenta");
        return;
      }

      setCargando(false);

      navigate("/verificar-correo", {
        state: { correo: correoLimpio },
      });
    } catch (error) {
      console.error("Error al registrar:", error);

      if (error.name === "AbortError") {
        setMensaje("El servidor tardó demasiado en responder");
      } else {
        setMensaje("Error de conexión con el servidor");
      }
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
          src={videoRegistro}
          autoPlay
          loop
          muted
          playsInline
        />

        <div className="auth-overlay" />

        <div className="auth-container">
          <p className="auth-eyebrow">Únete a AŞKA</p>
          <h1>Crear cuenta</h1>
          <p className="auth-sub">
            Regístrate para guardar tus datos y vivir una experiencia más personal.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-group">
              <label>Nombre completo</label>
              <input
                type="text"
                name="nombre"
                placeholder="Tu nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

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
              <label>Fecha de nacimiento</label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
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
                  placeholder="Crea una contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
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

            <div className="auth-group">
              <label>Confirmar contraseña</label>
              <div className="password-field">
                <input
                  className="password-input"
                  type={mostrarConfirmarPassword ? "text" : "password"}
                  name="confirmarPassword"
                  placeholder="Repite tu contraseña"
                  value={formData.confirmarPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setMostrarConfirmarPassword((prev) => !prev)}
                  aria-label={
                    mostrarConfirmarPassword
                      ? "Ocultar confirmación de contraseña"
                      : "Mostrar confirmación de contraseña"
                  }
                  title={
                    mostrarConfirmarPassword
                      ? "Ocultar confirmación de contraseña"
                      : "Mostrar confirmación de contraseña"
                  }
                >
                  <EyeIcon open={!mostrarConfirmarPassword} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-button"
              disabled={cargando}
            >
              {cargando ? "Creando cuenta..." : "Crear cuenta"}
            </button>

            {mensaje && <p className="auth-message">{mensaje}</p>}
          </form>

          <p className="auth-extra">
            <Link to="/login">
              <span>Ya tengo cuenta</span>
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
            background: linear-gradient(
              to bottom,
              rgba(0,0,0,0.85) 40%,
              var(--aska-bg-secondary, #f5f5f5) 100%
            );
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
            max-width:460px;
            background: color-mix(in srgb, var(--aska-card-bg, #ffffff) 8%, transparent);
            backdrop-filter: blur(14px);
            border-radius:24px;
            padding:30px 24px;
            border:1px solid rgba(255,255,255,0.15);
            box-shadow:0 20px 60px rgba(0,0,0,0.5);
            color:var(--aska-text-secondary, #fff);
          }

          .auth-container h1{
            font-size:2.2rem;
            margin:8px 0 10px;
            font-family:var(--aska-font-family-primary, inherit);
          }

          .auth-sub,
          .auth-extra{
            font-family:var(--aska-font-family-secondary, inherit);
          }

          .auth-sub{
            font-size:0.92rem;
            color:rgba(255,255,255,0.74);
            margin-bottom:20px;
            line-height:1.6;
          }

          .auth-group{
            margin-bottom:14px;
          }

          .auth-group label{
            font-size:0.82rem;
            color:rgba(255,255,255,0.82);
            font-weight:700;
          }

          .auth-group input{
            width:100%;
            padding:13px 15px;
            border-radius:14px;
            border:none;
            margin-top:6px;
            background:var(--aska-card-bg, #fff);
            color:var(--aska-text-primary, #000);
            font-size:0.95rem;
            font-family:var(--aska-font-family-secondary, inherit);
            box-sizing:border-box;
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
            padding:14px;
            border-radius:999px;
            border:none;
            background:var(--aska-accent-primary, #fff);
            color:var(--aska-text-primary, #000);
            font-weight:700;
            cursor:pointer;
            font-family:var(--aska-font-family-secondary, inherit);
            box-shadow:0 14px 34px rgba(0,0,0,0.18);
            transition:transform .22s ease, opacity .22s ease;
          }

          .auth-submit-button:hover{
            transform:translateY(-2px);
            opacity:.97;
          }

          .auth-message{
            margin-top:14px;
            font-weight:700;
          }

          .auth-extra{
            margin-top:12px;
            font-size:0.84rem;
            text-align:center;
          }

          .auth-extra a{
            color:var(--aska-text-secondary, #fff);
            text-decoration:none;
          }

          @media (max-width:768px){
            .auth-container{
              padding:24px 18px;
              border-radius:18px;
            }
          }
        `}
      </style>

    </>
  );
}

export default Register;