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
      const response = await fetch("https://aska-backend-nyx8.onrender.com/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: nombreLimpio,
          correo: correoLimpio,
          fechaNacimiento: formData.fechaNacimiento,
          password: passwordLimpia,
        }),
      });

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

      navigate("/verificar-correo", {
        state: { correo: correoLimpio },
      });
    } catch (error) {
      console.error("Error al registrar:", error);
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
    </>
  );
}

export default Register;