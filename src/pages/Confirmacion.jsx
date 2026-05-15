import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Confirmacion() {
  return (
    <>
      <Navbar />

      <section
        style={{
          minHeight: "100vh",
          background: "#050505",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at center, rgba(255,255,255,.08), transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <div
          className="aska-confirm-card"
          style={{
            background: "rgba(12,12,12,0.92)",
            borderRadius: "30px",
            padding: "40px 30px",
            maxWidth: "600px",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 30px 90px rgba(0,0,0,0.42)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(18px)",
          }}
        >
          <div
            style={{
              fontSize: "4rem",
              marginBottom: "20px",
            }}
          >
            ✦
          </div>

          <h1
            style={{
              fontSize: "clamp(2rem,5vw,3rem)",
              marginBottom: "10px",
              fontWeight: "900",
              letterSpacing: "-0.06em",
              lineHeight: ".92",
              fontFamily: "var(--aska-font-family-primary, inherit)",
            }}
          >
            PEDIDO CONFIRMADO
          </h1>

          <p
            style={{
              color: "rgba(255,255,255,0.68)",
              lineHeight: "1.6",
              marginBottom: "25px",
              fontWeight: "500",
              fontFamily: "var(--aska-font-family-secondary, inherit)",
            }}
          >
            Tu pieza está siendo preparada por AŞKA.
            Pronto recibirás la confirmación y seguimiento de tu pedido.
          </p>

          <div
            style={{
              background: "var(--aska-card-soft, #f7f7f7)",
              padding: "18px",
              borderRadius: "18px",
              marginBottom: "25px",
              fontSize: "0.95rem",
              color: "rgba(255,255,255,0.68)",
            }}
          >
            ✨ Cada pieza es preparada con dedicación y detalle para ti.
          </div>

          <Link to="/catalogo">
            <button
              style={{
                border: "none",
                background: "var(--aska-bg-primary, #111)",
                color: "var(--aska-text-secondary, #fff)",
                padding: "14px 24px",
                borderRadius: "999px",
                fontWeight: "700",
                cursor: "pointer",
                marginBottom: "12px",
                fontFamily: "var(--aska-font-family-secondary, inherit)",
                boxShadow: "0 14px 34px rgba(0,0,0,.18)",
                transition: "transform .22s ease, opacity .22s ease",
                width: "100%",
              }}
            >
              VOLVER AL CATÁLOGO
            </button>
          </Link>

          <Link to="/mis-pedidos">
            <button
              style={{
                border: "1px solid var(--aska-bg-primary, #111)",
                background: "rgba(12,12,12,0.92)",
                color: "var(--aska-text-primary, #111)",
                padding: "14px 24px",
                borderRadius: "999px",
                fontWeight: "700",
                cursor: "pointer",
                width: "100%",
                fontFamily: "var(--aska-font-family-secondary, inherit)",
                transition: "transform .22s ease, opacity .22s ease",
              }}
            >
              SEGUIR MI PEDIDO
            </button>
          </Link>

          <a
            href={`https://wa.me/573125183100?text=${encodeURIComponent(
              "Hola ASKA, necesito ayuda con mi pedido."
            )}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "block",
              marginTop: "18px",
              color: "rgba(255,255,255,0.62)",
              textDecoration: "none",
              letterSpacing: ".08em",
              fontSize: ".88rem",
              fontFamily: "var(--aska-font-family-secondary, inherit)",
            }}
          >
            Hablar con ASKA
          </a>
        </div>
      </section>

      <style>
        {`
          :root{
            --aska-card-soft:#f7f7f7;
          }

          .aska-confirm-card{
            transition:
              transform .42s cubic-bezier(.22,.61,.36,1),
              box-shadow .42s ease;
          }

          .aska-confirm-card:hover{
            transform:translateY(-4px);
            box-shadow:0 30px 70px rgba(0,0,0,.14) !important;
          }

          button:hover{
            transform:translateY(-3px);
            opacity:.97;
          }
        `}
      </style>

    </>
  );
}

export default Confirmacion;
