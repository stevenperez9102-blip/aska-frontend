import { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL;

const STICKERS = ["✨", "🔥", "💜", "😍", "🖤", "🌙", "💎", "🥀", "⚡", "🫶"];

function formatDate(dateString) {
  try {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

function Stars({ value, size = 22 }) {
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            fontSize: `${size}px`,
            lineHeight: 1,
            color: star <= value ? "#f5c451" : "rgba(255,255,255,0.22)",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function ProductReviews({ productoId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [form, setForm] = useState({
    nombre_cliente: "",
    calificacion: 5,
    comentario: "",
    sticker: "✨",
    fotos: [],
  });

  const usuario = JSON.parse(localStorage.getItem("user") || localStorage.getItem("usuario") || "null");

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://aska-backend-nyx8.onrender.com/api/productos/${productoId}/resenas`
      );
      const data = await response.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando reseñas:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productoId) loadReviews();
  }, [productoId]);

  const average = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce(
      (acc, item) => acc + Number(item.calificacion || 0),
      0
    );
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 4);

    setForm((prev) => ({
      ...prev,
      fotos: files,
    }));

    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!usuario?.id) {
      alert("Debes iniciar sesión para dejar una reseña");
      return;
    }

    if (!form.nombre_cliente.trim() || !form.comentario.trim()) {
      alert("Completa nombre y comentario");
      return;
    }

    try {
      setSending(true);

      const payload = new FormData();
      payload.append("usuario_id", usuario.id);
      payload.append("nombre_cliente", form.nombre_cliente);
      payload.append("calificacion", form.calificacion);
      payload.append("comentario", form.comentario);
      payload.append("sticker", form.sticker);

      form.fotos.forEach((file) => {
        payload.append("fotos", file);
      });

      const response = await fetch(
        `https://aska-backend-nyx8.onrender.com/api/productos/${productoId}/resenas`,
        {
          method: "POST",
          body: payload,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.mensaje || "No se pudo guardar la reseña");
      }

      setForm({
        nombre_cliente: "",
        calificacion: 5,
        comentario: "",
        sticker: "✨",
        fotos: [],
      });
      setPreviewImages([]);
      await loadReviews();
      alert("Reseña publicada con éxito");
    } catch (error) {
      console.error(error);
      alert(error.message || "Error guardando reseña");
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      style={{
        marginTop: "50px",
        display: "grid",
        gap: "28px",
      }}
    >
      <div
        style={{
          background: "#0d0d0d",
          color: "#fff",
          borderRadius: "28px",
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "30px",
          boxShadow: "0 16px 42px rgba(0,0,0,0.18)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "18px",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,0.56)",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: "0.78rem",
                marginBottom: "8px",
              }}
            >
              Comunidad AŞKA
            </p>

            <h2
              style={{
                margin: 0,
                fontSize: "clamp(1.8rem, 4vw, 2.7rem)",
                lineHeight: 1.05,
              }}
            >
              Muro de reseñas
            </h2>
          </div>

          <div
            style={{
              background: "#151515",
              borderRadius: "20px",
              padding: "14px 18px",
              minWidth: "190px",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,0.62)",
                fontSize: "0.9rem",
              }}
            >
              Promedio
            </p>
            <p style={{ margin: "4px 0 8px", fontSize: "2rem", fontWeight: 700 }}>
              {average}
            </p>
            <Stars value={Math.round(Number(average || 0))} size={18} />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
            }}
          >
            <input
              type="text"
              name="nombre_cliente"
              placeholder="Tu nombre"
              value={form.nombre_cliente}
              onChange={handleChange}
              style={{
                background: "#151515",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#fff",
                borderRadius: "16px",
                padding: "14px 16px",
                outline: "none",
              }}
            />

            <select
              name="calificacion"
              value={form.calificacion}
              onChange={handleChange}
              style={{
                background: "#151515",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#fff",
                borderRadius: "16px",
                padding: "14px 16px",
                outline: "none",
              }}
            >
              <option value={5}>5 estrellas</option>
              <option value={4}>4 estrellas</option>
              <option value={3}>3 estrellas</option>
              <option value={2}>2 estrellas</option>
              <option value={1}>1 estrella</option>
            </select>
          </div>

          <div>
            <p style={{ margin: "0 0 10px", color: "rgba(255,255,255,0.72)" }}>
              Elige tu sticker
            </p>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {STICKERS.map((emoji) => {
                const active = form.sticker === emoji;
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        sticker: emoji,
                      }))
                    }
                    style={{
                      width: "46px",
                      height: "46px",
                      borderRadius: "14px",
                      border: active
                        ? "1px solid rgba(206, 176, 255, 0.8)"
                        : "1px solid rgba(255,255,255,0.08)",
                      background: active ? "#23162d" : "#151515",
                      cursor: "pointer",
                      fontSize: "1.25rem",
                    }}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          </div>

          <textarea
            name="comentario"
            placeholder="Cuéntanos cómo te fue con el producto..."
            value={form.comentario}
            onChange={handleChange}
            rows={5}
            style={{
              background: "#151515",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#fff",
              borderRadius: "18px",
              padding: "16px",
              outline: "none",
              resize: "vertical",
            }}
          />

          <div>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                background: "#151515",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#fff",
                borderRadius: "16px",
                padding: "14px 18px",
                cursor: "pointer",
              }}
            >
              <span>📸 Subir fotos</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFiles}
                style={{ display: "none" }}
              />
            </label>
          </div>

          {previewImages.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                gap: "12px",
              }}
            >
              {previewImages.map((img, index) => (
                <div
                  key={index}
                  style={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    height: "110px",
                    background: "#151515",
                  }}
                >
                  <img
                    src={img}
                    alt={`preview-${index}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            style={{
              border: "none",
              background: "linear-gradient(135deg, #8e63c9, #5f3f91)",
              color: "#fff",
              borderRadius: "18px",
              padding: "16px 22px",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: "pointer",
              opacity: sending ? 0.7 : 1,
            }}
          >
            {sending ? "Publicando..." : "Publicar reseña"}
          </button>
        </form>
      </div>

      <div
        style={{
          display: "grid",
          gap: "18px",
        }}
      >
        {loading ? (
          <div
            style={{
              background: "#0d0d0d",
              color: "#fff",
              borderRadius: "24px",
              padding: "24px",
            }}
          >
            Cargando reseñas...
          </div>
        ) : reviews.length === 0 ? (
          <div
            style={{
              background: "#0d0d0d",
              color: "#fff",
              borderRadius: "24px",
              padding: "28px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
              Aún no hay reseñas
            </p>
            <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.68)" }}>
              Sé la primera persona en contar cómo te quedó esta pieza. ✨
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <article
              key={review.id}
              style={{
                background: "#0d0d0d",
                color: "#fff",
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "24px",
                boxShadow: "0 14px 36px rgba(0,0,0,0.16)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "14px",
                  flexWrap: "wrap",
                  marginBottom: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <p style={{ margin: 0, fontSize: "1.08rem", fontWeight: 700 }}>
                    {review.sticker || "✨"} {review.nombre_cliente}
                  </p>

                  {Number(review.compra_verificada) === 1 && (
                    <span
                      style={{
                        background: "linear-gradient(135deg, #4caf50, #2e7d32)",
                        color: "#fff",
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      ✔ Compra verificada
                    </span>
                  )}
                </div>

                <Stars value={Number(review.calificacion || 0)} />
              </div>

              <p
                style={{
                  margin: 0,
                  lineHeight: 1.8,
                  color: "rgba(255,255,255,0.84)",
                  whiteSpace: "pre-line",
                }}
              >
                {review.comentario}
              </p>

              {Array.isArray(review.fotos) && review.fotos.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "12px",
                    marginTop: "18px",
                  }}
                >
                  {review.fotos.map((foto, idx) => (
                    <div
                      key={idx}
                      style={{
                        height: "170px",
                        borderRadius: "18px",
                        overflow: "hidden",
                        background: "#151515",
                      }}
                    >
                      <img
                        src={foto}
                        alt={`reseña-${review.id}-${idx}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default ProductReviews;