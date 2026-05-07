import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Confirmacion() {
  return (
    <>
      <Navbar />

      <section
        style={{
          minHeight: "100vh",
          background: "var(--aska-bg-secondary, #f5f5f5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
        }}
      >
        <div
          className="aska-confirm-card"
          style={{
            background: "var(--aska-card-bg, #fff)",
            borderRadius: "30px",
            padding: "40px 30px",
            maxWidth: "600px",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              fontSize: "4rem",
              marginBottom: "20px",
            }}
          >
            💎
          </div>

          <h1
            style={{
              fontSize: "clamp(2rem,5vw,3rem)",
              marginBottom: "10px",
              fontWeight: "900",
              fontFamily: "var(--aska-font-family-primary, inherit)",
            }}
          >
            Pedido confirmado
          </h1>

          <p
            style={{
              color: "var(--aska-text-muted, #555)",
              lineHeight: "1.6",
              marginBottom: "25px",
              fontWeight: "500",
              fontFamily: "var(--aska-font-family-secondary, inherit)",
            }}
          >
            Tu pedido ha sido registrado correctamente.
            En cuanto el pago sea confirmado, comenzaremos a preparar tu pieza AŞKA.
          </p>

          <div
            style={{
              background: "var(--aska-card-soft, #f7f7f7)",
              padding: "18px",
              borderRadius: "18px",
              marginBottom: "25px",
              fontSize: "0.95rem",
              color: "var(--aska-text-muted, #555)",
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
              Seguir comprando
            </button>
          </Link>

          <Link to="/mis-pedidos">
            <button
              style={{
                border: "1px solid var(--aska-bg-primary, #111)",
                background: "var(--aska-card-bg, #fff)",
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
              Ver mis pedidos
            </button>
          </Link>
        </div>
      </section>

      <style>
        {`
          :root{
            --aska-card-soft:#f7f7f7;
          }

          .aska-confirm-card{
            transition:
              transform .28s ease,
              box-shadow .28s ease;
          }

          .aska-confirm-card:hover{
            transform:translateY(-4px);
            box-shadow:0 30px 70px rgba(0,0,0,.14) !important;
          }

          button:hover{
            transform:translateY(-2px);
            opacity:.97;
          }
        `}
      </style>

    </>
  );
}

export default Confirmacion;
