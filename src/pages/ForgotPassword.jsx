import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function ForgotPassword() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cargando) return;

    const correoLimpio = correo.trim().toLowerCase();

    if (!correoLimpio) {
      setMensaje("Ingresa tu correo electrónico");
      return;
    }

    setMensaje("");
    setCargando(true);

    try {
      const response = await fetch("https://aska-backend-nyx8.onrender.com/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo: correoLimpio }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setMensaje(data?.mensaje || "No se pudo enviar el código");
        return;
      }

      navigate("/reset-password", {
        state: { correo: correoLimpio },
      });
    } catch (error) {
      console.error("Error enviando código:", error);
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
          <p className="auth-eyebrow">Recuperación</p>
          <h1>¿Olvidaste tu contraseña?</h1>
          <p className="auth-sub">
            Ingresa tu correo y te enviaremos un código para restablecerla.
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

            <button
              type="submit"
              className="auth-submit-button"
              disabled={cargando}
            >
              {cargando ? "Enviando..." : "Enviar código"}
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

export default ForgotPassword;