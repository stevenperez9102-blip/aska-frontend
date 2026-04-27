import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

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

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const correoInicial = location.state?.correo || "";

  const [correo, setCorreo] = useState(correoInicial);
  const [codigo, setCodigo] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarNuevaPassword, setMostrarNuevaPassword] = useState(false);
  const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cargando) return;

    const correoLimpio = correo.trim().toLowerCase();
    const codigoLimpio = codigo.trim();

    setMensaje("");

    if (!correoLimpio || !codigoLimpio || !nuevaPassword || !confirmarPassword) {
      setMensaje("Completa todos los campos");
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setMensaje("Las contraseñas no coinciden");
      return;
    }

    if (nuevaPassword.length < 6) {
      setMensaje("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setCargando(true);

    try {
      const response = await fetch("https://aska-backend-nyx8.onrender.com/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: correoLimpio,
          codigo: codigoLimpio,
          nuevaPassword,
        }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setMensaje(data?.mensaje || "No se pudo cambiar la contraseña");
        return;
      }

      navigate("/login");
    } catch (error) {
      console.error("Error cambiando contraseña:", error);
      setMensaje("Error de conexión con el servidor");
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <Navbar />

      <section className="auth-page">
        <div className="auth-container">
          <p className="auth-eyebrow">Seguridad</p>
          <h1>Restablecer contraseña</h1>
          <p className="auth-sub">
            Escribe el código recibido y define tu nueva contraseña.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-group">
              <label>Correo electrónico</label>
              <input
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={correo}
                onChange={(e) => {
                  setMensaje("");
                  setCorreo(e.target.value);
                }}
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-group">
              <label>Código</label>
              <input
                type="text"
                placeholder="Código recibido"
                value={codigo}
                onChange={(e) => {
                  setMensaje("");
                  setCodigo(e.target.value);
                }}
                required
              />
            </div>

            <div className="auth-group">
              <label>Nueva contraseña</label>
              <div className="password-field">
                <input
                  className="password-input"
                  type={mostrarNuevaPassword ? "text" : "password"}
                  placeholder="Nueva contraseña"
                  value={nuevaPassword}
                  onChange={(e) => {
                    setMensaje("");
                    setNuevaPassword(e.target.value);
                  }}
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setMostrarNuevaPassword((prev) => !prev)}
                  aria-label={
                    mostrarNuevaPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  title={
                    mostrarNuevaPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  <EyeIcon open={!mostrarNuevaPassword} />
                </button>
              </div>
            </div>

            <div className="auth-group">
              <label>Confirmar nueva contraseña</label>
              <div className="password-field">
                <input
                  className="password-input"
                  type={mostrarConfirmarPassword ? "text" : "password"}
                  placeholder="Confirma tu nueva contraseña"
                  value={confirmarPassword}
                  onChange={(e) => {
                    setMensaje("");
                    setConfirmarPassword(e.target.value);
                  }}
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
              {cargando ? "Cambiando..." : "Cambiar contraseña"}
            </button>

            {mensaje && <p className="auth-message">{mensaje}</p>}
          </form>

          <p className="auth-extra">
            <Link to="/login">
              <span>Volver al acceso</span>
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

export default ResetPassword;