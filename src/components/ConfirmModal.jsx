import React from "react";

function ConfirmModal({
  open,
  title = "Confirmar acción",
  message = "¿Deseas continuar?",
  onConfirm,
  onCancel,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  danger = false,
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#f3eff5",
          color: "#1f1f1f",
          border: "2px solid #d7c7e8",
          borderRadius: "22px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          padding: "28px 26px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "1.45rem",
            fontWeight: 700,
            color: "#2b2230",
          }}
        >
          {title}
        </h3>

        <p
          style={{
            marginTop: "14px",
            marginBottom: "24px",
            fontSize: "1rem",
            lineHeight: 1.6,
            color: "#4b4152",
          }}
        >
          {message}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={onCancel}
            style={{
              border: "none",
              borderRadius: "999px",
              padding: "12px 22px",
              background: "#d9c8ef",
              color: "#4d3565",
              fontWeight: 600,
              cursor: "pointer",
              transition: "0.2s ease",
            }}
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            style={{
              border: "2px solid #8a63b8",
              borderRadius: "999px",
              padding: "12px 22px",
              background: danger ? "#7a2f43" : "#6f5491",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.25)",
              transition: "0.2s ease",
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;