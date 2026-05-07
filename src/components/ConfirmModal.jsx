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
    <>

<style>
{`
  :root{
    --aska-modal-bg:#f3eff5;
    --aska-modal-border:#d7c7e8;
    --aska-accent-soft:#d9c8ef;
    --aska-accent-text:#4d3565;
    --aska-danger-color:#7a2f43;
  }

  .aska-confirm-button:hover{
    transform:translateY(-2px);
    opacity:.97;
  }

  .aska-confirm-modal{
    animation:askaModalFade .22s ease;
  }

  @keyframes askaModalFade{
    from{
      opacity:0;
      transform:translateY(8px) scale(.98);
    }
    to{
      opacity:1;
      transform:translateY(0) scale(1);
    }
  }
`}
</style>

    <div
      className="aska-confirm-modal"
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
          background: "var(--aska-modal-bg, #f3eff5)",
          color: "var(--aska-text-primary, #1f1f1f)",
          border: "2px solid var(--aska-modal-border, #d7c7e8)",
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
            color: "var(--aska-text-primary, #2b2230)",
            fontFamily: "var(--aska-font-family-primary, inherit)",
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
            color: "var(--aska-text-muted, #4b4152)",
            fontFamily: "var(--aska-font-family-secondary, inherit)",
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
            className="aska-confirm-button"
            onClick={onCancel}
            style={{
              border: "none",
              borderRadius: "999px",
              padding: "12px 22px",
              background: "var(--aska-accent-soft, #d9c8ef)",
              color: "var(--aska-accent-text, #4d3565)",
              fontWeight: 600,
              cursor: "pointer",
              transition: "transform .22s ease, opacity .22s ease",
              fontFamily: "var(--aska-font-family-secondary, inherit)",
            }}
          >
            {cancelText}
          </button>

          <button
            className="aska-confirm-button"
            onClick={onConfirm}
            style={{
              border: "2px solid var(--aska-accent-primary, #8a63b8)",
              borderRadius: "999px",
              padding: "12px 22px",
              background: danger ? "var(--aska-danger-color, #7a2f43)" : "var(--aska-accent-primary, #6f5491)",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.25)",
              transition: "transform .22s ease, opacity .22s ease",
              fontFamily: "var(--aska-font-family-secondary, inherit)",
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

export default ConfirmModal;