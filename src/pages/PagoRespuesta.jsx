import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function PagoRespuesta() {
  const [searchParams] = useSearchParams();
  const [mensaje, setMensaje] = useState("Consultando estado del pago...");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const transactionId = searchParams.get("id");

    if (!transactionId) {
      setMensaje("No recibimos el identificador de la transacción.");
      return;
    }

    fetch(`https://aska-backend-nyx8.onrender.com/api/wompi/transaction/${transactionId}`)
      .then((res) => res.json())
      .then((data) => {
        const trx = data?.data;
        const trxStatus = trx?.status || "";
        setStatus(trxStatus);

        if (trxStatus === "APPROVED") {
          setMensaje("Tu pago fue aprobado correctamente.");
          localStorage.removeItem("cart");
        } else if (trxStatus === "DECLINED") {
          setMensaje("Tu pago fue rechazado.");
        } else if (trxStatus === "VOIDED") {
          setMensaje("Tu pago fue anulado.");
        } else if (trxStatus === "ERROR") {
          setMensaje("Tu pago presentó un error.");
        } else {
          setMensaje("Tu pago sigue en proceso. Te confirmaremos cuando cambie.");
        }
      })
      .catch((error) => {
        console.error(error);
        setMensaje("No fue posible consultar el estado de la transacción.");
      });
  }, [searchParams]);

  return (
    <>
      <Navbar />

      <div style={{ padding: "40px", color: "#fff", display: "grid", gap: "18px" }}>
        <h1>Resultado del pago</h1>
        <p>{mensaje}</p>
        {status && <p>Estado Wompi: {status}</p>}

        <div style={{ display: "flex", gap: "12px" }}>
          <Link to="/">
            <button>Volver al inicio</button>
          </Link>

          <Link to="/admin/pedidos">
            <button>Ver pedidos</button>
          </Link>
        </div>
      </div>
    </>
  );
}

export default PagoRespuesta;