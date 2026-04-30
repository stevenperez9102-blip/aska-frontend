import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Confirmacion() {
  return (
    <>
      <Navbar />

      <section
        style={{
          minHeight: "100vh",
          background: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            background: "#fff",
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
            }}
          >
            Pedido confirmado
          </h1>

          <p
            style={{
              color: "#555",
              lineHeight: "1.6",
              marginBottom: "25px",
              fontWeight: "500",
            }}
          >
            Tu pedido ha sido registrado correctamente.
            En cuanto el pago sea confirmado, comenzaremos a preparar tu pieza AŞKA.
          </p>

          <div
            style={{
              background: "#f7f7f7",
              padding: "18px",
              borderRadius: "18px",
              marginBottom: "25px",
              fontSize: "0.95rem",
              color: "#555",
            }}
          >
            ✨ Cada pieza es preparada con dedicación y detalle para ti.
          </div>

          <Link to="/catalogo">
            <button
              style={{
                border: "none",
                background: "#111",
                color: "#fff",
                padding: "14px 24px",
                borderRadius: "999px",
                fontWeight: "700",
                cursor: "pointer",
                marginBottom: "12px",
                width: "100%",
              }}
            >
              Seguir comprando
            </button>
          </Link>

          <Link to="/mis-pedidos">
            <button
              style={{
                border: "1px solid #111",
                background: "#fff",
                color: "#111",
                padding: "14px 24px",
                borderRadius: "999px",
                fontWeight: "700",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Ver mis pedidos
            </button>
          </Link>
        </div>
      </section>
    </>
  );
}

export default Confirmacion;
