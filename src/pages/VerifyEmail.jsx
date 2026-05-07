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

      <style>
        {`
          .auth-page{
            position:relative;
            min-height:100vh;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:40px 16px;
            background:
              linear-gradient(
                to bottom,
                rgba(0,0,0,0.86) 40%,
                var(--aska-bg-secondary, #f5f5f5) 100%
              );
          }

          .auth-container{
            width:100%;
            max-width:430px;
            background:
              color-mix(in srgb, var(--aska-card-bg, #ffffff) 10%, transparent);
            backdrop-filter:blur(16px);
            border-radius:24px;
            padding:30px 24px;
            border:1px solid rgba(255,255,255,0.14);
            box-shadow:0 20px 60px rgba(0,0,0,0.4);
            color:var(--aska-text-secondary, #fff);
          }

          .auth-eyebrow{
            margin:0 0 10px;
            letter-spacing:.16em;
            text-transform:uppercase;
            font-size:.78rem;
            font-weight:800;
            color:rgba(255,255,255,0.74);
          }

          .auth-container h1{
            margin:0 0 10px;
            font-size:2.2rem;
            font-family:var(--aska-font-family-primary, inherit);
          }

          .auth-sub{
            margin:0 0 22px;
            line-height:1.7;
            color:rgba(255,255,255,0.74);
            font-family:var(--aska-font-family-secondary, inherit);
          }

          .auth-form{
            display:grid;
            gap:14px;
          }

          .auth-group label{
            display:block;
            margin-bottom:7px;
            font-size:.84rem;
            font-weight:700;
            color:rgba(255,255,255,0.82);
          }

          .auth-group input{
            width:100%;
            padding:14px 15px;
            border:none;
            border-radius:14px;
            background:var(--aska-card-bg, #fff);
            color:var(--aska-text-primary, #000);
            font-size:.95rem;
            font-family:var(--aska-font-family-secondary, inherit);
            box-sizing:border-box;
          }

          .auth-form button{
            border:none;
            border-radius:999px;
            padding:14px 20px;
            background:var(--aska-accent-primary, #fff);
            color:var(--aska-text-primary, #000);
            font-weight:700;
            cursor:pointer;
            margin-top:6px;
            font-family:var(--aska-font-family-secondary, inherit);
            box-shadow:0 14px 34px rgba(0,0,0,0.18);
            transition:
              transform .22s ease,
              opacity .22s ease;
          }

          .auth-form button:hover{
            transform:translateY(-2px);
            opacity:.97;
          }

          .auth-message{
            margin:4px 0 0;
            font-weight:700;
          }

          .auth-extra{
            margin-top:16px;
            text-align:center;
            font-size:.85rem;
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

export default VerifyEmail;