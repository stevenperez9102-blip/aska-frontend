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
          <p className="auth-eyebrow">AŞKA private access</p>
          <h1>Crear cuenta</h1>
          <p className="auth-sub">
            Crea tu cuenta para acceder a una experiencia privada y personalizada de AŞKA.
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
            min-height:100svh;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:clamp(96px, 9vw, 132px) 18px 72px;
            background:#050505;
            overflow:hidden;
          }

          .auth-bg-video{
            position:absolute;
            inset:0;
            width:100%;
            height:100%;
            object-fit:cover;
            object-position:center center;
            opacity:.46;
            filter:contrast(1.05) saturate(.88) brightness(.72);
            transform:scale(1.02);
          }

          .auth-overlay{
            position:absolute;
            inset:0;
            background:
              linear-gradient(90deg, rgba(0,0,0,.72), rgba(0,0,0,.42) 48%, rgba(0,0,0,.76)),
              radial-gradient(circle at 50% 38%, rgba(255,255,255,.10), transparent 32%),
              linear-gradient(180deg, rgba(0,0,0,.22), rgba(0,0,0,.84));
            z-index:1;
          }

          .auth-page::after{
            content:"";
            position:absolute;
            left:0;
            right:0;
            bottom:0;
            height:26%;
            background:linear-gradient(180deg, transparent, rgba(0,0,0,.78));
            z-index:1;
            pointer-events:none;
          }

          .auth-container{
            position:relative;
            z-index:2;
            width:min(100%, 480px);
            background:rgba(8,8,8,.42);
            backdrop-filter:blur(22px) saturate(112%);
            -webkit-backdrop-filter:blur(22px) saturate(112%);
            border-radius:0;
            padding:clamp(30px, 4vw, 46px);
            border:1px solid rgba(255,255,255,.13);
            box-shadow:0 34px 100px rgba(0,0,0,.44);
            color:#ffffff;
          }

          .auth-container::before{
            content:"";
            display:block;
            width:72px;
            height:1px;
            margin-bottom:24px;
            background:linear-gradient(90deg, rgba(255,255,255,.82), transparent);
          }

          .auth-eyebrow{
            margin:0 0 12px;
            color:rgba(255,255,255,.62);
            font-family:var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size:.68rem;
            font-weight:600;
            letter-spacing:.24em;
            text-transform:uppercase;
          }

          .auth-container h1{
            margin:0 0 16px;
            color:#ffffff;
            font-family:var(--aska-font-family-primary, Georgia, serif);
            font-size:clamp(3.2rem, 8vw, 5.4rem);
            line-height:.84;
            letter-spacing:-.075em;
            font-weight:500 !important;
            text-transform:uppercase;
          }

          .auth-sub{
            margin:0 0 30px;
            max-width:360px;
            color:rgba(255,255,255,.72);
            font-family:var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size:.96rem;
            line-height:1.7;
            font-weight:300;
          }

          .auth-form{
            display:grid;
            gap:18px;
          }

          .auth-group{
            display:grid;
            gap:8px;
            margin-bottom:0;
          }

          .auth-group label{
            color:rgba(255,255,255,.68);
            font-family:var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size:.68rem;
            font-weight:600;
            letter-spacing:.18em;
            text-transform:uppercase;
          }

          .auth-group input,
          .password-input{
            width:100%;
            height:52px;
            box-sizing:border-box;
            font-family:var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            padding:0 46px 0 16px;
            border-radius:0;
            border:1px solid rgba(255,255,255,.16);
            background:rgba(255,255,255,.08);
            color:#ffffff;
            font-size:.92rem;
            outline:none;
            transition:
              border-color .28s ease,
              background .28s ease,
              box-shadow .28s ease;
          }

          .auth-group input::placeholder,
          .password-input::placeholder{
            color:rgba(255,255,255,.40);
          }

          .auth-group input:focus,
          .password-input:focus{
            border-color:rgba(255,255,255,.48);
            background:rgba(255,255,255,.12);
            box-shadow:0 0 0 4px rgba(255,255,255,.08);
          }

          .password-field{
            position:relative;
            width:100%;
          }

          .password-toggle{
            position:absolute;
            right:12px;
            top:50%;
            transform:translateY(-50%);
            width:34px;
            height:34px;
            display:flex;
            align-items:center;
            justify-content:center;
            background:transparent;
            border:0;
            cursor:pointer;
            color:rgba(255,255,255,.66);
            padding:0;
            transition:color .24s ease, transform .24s ease;
          }

          .password-toggle:hover{
            color:#ffffff;
            transform:translateY(-50%) scale(1.04);
          }

          .auth-submit-button{
            width:100%;
            min-height:52px;
            margin-top:8px;
            padding:0 18px;
            border-radius:999px;
            border:1px solid rgba(255,255,255,.86);
            background:#ffffff;
            color:#050505;
            font-family:var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size:.74rem;
            font-weight:700;
            letter-spacing:.20em;
            text-transform:uppercase;
            cursor:pointer;
            box-shadow:none;
            transition:
              transform .28s ease,
              box-shadow .28s ease,
              opacity .28s ease,
              background .28s ease;
          }

          .auth-submit-button:hover{
            transform:translateY(-2px);
            box-shadow:0 22px 52px rgba(0,0,0,.28);
            opacity:.96;
          }

          .auth-submit-button:disabled{
            cursor:not-allowed;
            opacity:.64;
            transform:none;
          }

          .auth-message{
            margin:0;
            color:#ffd6de;
            font-family:var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size:.9rem;
            line-height:1.5;
            font-weight:500;
          }

          .auth-extra{
            margin:16px 0 0;
            text-align:center;
            font-family:var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size:.82rem;
            color:rgba(255,255,255,.62);
          }

          .auth-extra a{
            color:inherit;
            text-decoration:none;
          }

          .auth-extra span{
            border-bottom:1px solid rgba(255,255,255,.32);
            padding-bottom:3px;
            transition:color .24s ease, border-color .24s ease;
          }

          .auth-extra span:hover{
            color:#ffffff;
            border-color:#ffffff;
          }

          @media (max-width:768px){
            .auth-page{
              padding:94px 14px 54px;
              align-items:flex-end;
            }

            .auth-container{
              width:100%;
              padding:28px 20px;
            }

            .auth-container h1{
              font-size:clamp(3rem, 18vw, 4.8rem);
            }
          }

        `}
      </style>

    </>
  );
}

export default Register;