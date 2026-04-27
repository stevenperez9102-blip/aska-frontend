import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function cardButtonStyle() {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    borderRadius: "999px",
    padding: "12px 18px",
    fontWeight: 700,
    cursor: "pointer",
    textDecoration: "none",
  };
}

function Admin() {
  return (
    <>
      <Navbar />

      <section
        style={{
          minHeight: "100vh",
          background: "#050505",
          color: "#fff",
          padding: "42px 24px 70px",
        }}
      >
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
          <div style={{ marginBottom: "32px" }}>
            <p
              style={{
                color: "rgba(255,255,255,0.56)",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: "0.82rem",
                marginBottom: "8px",
              }}
            >
              Administración AŞKA
            </p>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(2.3rem, 5vw, 4rem)",
                lineHeight: 1.04,
              }}
            >
              Panel principal
            </h1>

            <p
              style={{
                marginTop: "14px",
                color: "rgba(255,255,255,0.68)",
                maxWidth: "780px",
                lineHeight: 1.7,
              }}
            >
              Aquí cada módulo está separado para mantener una estética limpia y
              premium: página, productos y pedidos.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "18px",
            }}
          >
            <div
              style={{
                background: "#0d0d0d",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "28px",
                padding: "24px",
                boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: "8px",
                }}
              >
                Módulo 01
              </p>
              <h3 style={{ margin: 0, fontSize: "1.6rem" }}>
                Gestión de la página
              </h3>
              <p
                style={{
                  marginTop: "12px",
                  marginBottom: "20px",
                  color: "rgba(255,255,255,0.68)",
                  lineHeight: 1.6,
                }}
              >
                Edita portada, hero, títulos, subtítulos y recursos visuales del
                inicio sin mezclarlo con productos.
              </p>

              <Link to="/admin/pagina" style={cardButtonStyle()}>
                Ir a gestión de la página
              </Link>
            </div>

            <div
              style={{
                background: "#0d0d0d",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "28px",
                padding: "24px",
                boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: "8px",
                }}
              >
                Módulo 02
              </p>
              <h3 style={{ margin: 0, fontSize: "1.6rem" }}>
                Gestión de productos
              </h3>
              <p
                style={{
                  marginTop: "12px",
                  marginBottom: "20px",
                  color: "rgba(255,255,255,0.68)",
                  lineHeight: 1.6,
                }}
              >
                Crea, edita, envía a papelera, restaura y administra imágenes de
                productos en un espacio separado.
              </p>

              <Link to="/admin/productos" style={cardButtonStyle()}>
                Ir a gestión de productos
              </Link>
            </div>

            <div
              style={{
                background: "#0d0d0d",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "28px",
                padding: "24px",
                boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: "8px",
                }}
              >
                Módulo 03
              </p>
              <h3 style={{ margin: 0, fontSize: "1.6rem" }}>
                Pedidos y seguimiento
              </h3>
              <p
                style={{
                  marginTop: "12px",
                  marginBottom: "20px",
                  color: "rgba(255,255,255,0.68)",
                  lineHeight: 1.6,
                }}
              >
                Revisa pedidos recibidos, cambia estados, abre WhatsApp y consulta
                el historial de entregados.
              </p>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link to="/admin/pedidos" style={cardButtonStyle()}>
                  Pedidos recibidos
                </Link>

                <Link to="/admin/pedidos-entregados" style={cardButtonStyle()}>
                  Entregados
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Admin;