import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const correoInicial = location.state?.correo || "";

  const [correo, setCorreo] = useState(correoInicial);
  const [codigo, setCodigo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cargando) return;

    setMensaje("");
    setCargando(true);

    try {
      const response = await fetch("https://aska-backend-nyx8.onrender.com/api/verificar-correo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo, codigo }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setMensaje(data.mensaje || "No se pudo verificar el correo");
        return;
      }

      navigate("/login");
    } catch (error) {
      console.error("Error verificando correo:", error);
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
          <p className="auth-eyebrow">Último paso</p>
          <h1>Verificar correo</h1>
          <p className="auth-sub">
            Ingresa el código que enviamos a tu correo para activar tu cuenta.
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
              <label>Código de verificación</label>
              <input
                type="text"
                placeholder="Ingresa el código"
                value={codigo}
                onChange={(e) => {
                  setMensaje("");
                  setCodigo(e.target.value);
                }}
                required
              />
            </div>

            <button type="submit" disabled={cargando}>
              {cargando ? "Verificando..." : "Verificar cuenta"}
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

export default VerifyEmail;