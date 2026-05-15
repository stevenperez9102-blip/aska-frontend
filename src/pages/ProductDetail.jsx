import { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { CartContext } from "../context/CartContext";

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function normalizeImages(producto) {
  const imgs = [];

  if (Array.isArray(producto?.imagenes)) {
    producto.imagenes.forEach((img) => {
      if (!img) return;

      if (typeof img === "string") {
        if (!imgs.includes(img)) imgs.push(img);
        return;
      }

      if (typeof img === "object") {
        const possibleUrl =
          img.url || img.imagen || img.src || img.image || img.ruta || "";
        if (possibleUrl && !imgs.includes(possibleUrl)) imgs.push(possibleUrl);
      }
    });
  }

  if (producto?.imagen && !imgs.includes(producto.imagen)) {
    imgs.unshift(producto.imagen);
  }

  return imgs;
}

function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`https://aska-backend-nyx8.onrender.com/api/productos/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.mensaje || "No se pudo cargar el producto");
        }

        setProducto(data);
        setSelectedIndex(0);
      } catch (err) {
        console.error("Error cargando producto:", err);
        setError(err.message || "Error cargando producto");
      } finally {
        setLoading(false);
      }
    };

    cargarProducto();
  }, [id]);

  const imagenesProducto = useMemo(() => {
    if (!producto) return [];
    return normalizeImages(producto);
  }, [producto]);

  const selectedImage =
    imagenesProducto[selectedIndex] || producto?.imagen || "";

  const nextImage = () => {
    if (imagenesProducto.length <= 1) return;
    setSelectedIndex((prev) => (prev + 1) % imagenesProducto.length);
  };

  const prevImage = () => {
    if (imagenesProducto.length <= 1) return;
    setSelectedIndex(
      (prev) => (prev - 1 + imagenesProducto.length) % imagenesProducto.length
    );
  };

  const handleAddToCart = () => {
    if (!producto) return;

    addToCart({
      id: producto.id,
      name: producto.nombre,
      nombre: producto.nombre,
      price: Number(producto.precio || 0),
      precio: Number(producto.precio || 0),
      image: selectedImage || producto.imagen || "",
      imagen: selectedImage || producto.imagen || "",
      description: producto.descripcion || "",
      category: producto.categoria || "",
      categoria: producto.categoria || "",
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <section
          style={{
            minHeight: "100vh",
            background: "var(--aska-bg-secondary, #f5f5f5)",
            padding: "120px 24px 60px",
            color: "#fff",
          }}
        >
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <p>Cargando producto...</p>
          </div>
        </section>
      </>
    );
  }

  if (error || !producto) {
    return (
      <>
        <Navbar />
        <section
          style={{
            minHeight: "100vh",
            background: "var(--aska-bg-secondary, #f5f5f5)",
            padding: "120px 24px 60px",
            color: "var(--aska-text-primary, #111)",
          }}
        >
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <p>{error || "No se encontró el producto."}</p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <section
        className="aska-product-detail-page"
        style={{
          minHeight: "100vh",
          background: "#0b0b0b",
          padding: "clamp(96px, 9vw, 132px) 24px clamp(72px, 8vw, 118px)",
        }}
      >
        <div
          className="aska-product-detail-grid"
          style={{
            maxWidth: "1320px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.18fr) minmax(340px, 0.82fr)",
            gap: "clamp(28px, 4vw, 64px)",
            alignItems: "start",
          }}
        >
          <div
            className="aska-product-gallery-card"
            style={{
              background: "var(--aska-card-bg, #ffffff)",
              borderRadius: "34px",
              border: "1px solid rgba(17,17,17,0.08)",
              padding: "16px",
              boxShadow: "0 30px 90px rgba(0,0,0,0.10)",
            }}
          >
            <p
              style={{
                margin: 0,
                marginBottom: "14px",
                color: "#6f6f6f",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                fontSize: "0.78rem",
              }}
            >
              {producto.categoria || "Producto"}
            </p>

            <div
              className="aska-product-image-frame"
              style={{
                position: "relative",
                width: "100%",
                height: "clamp(520px, 62vw, 740px)",
                minHeight: "420px",
                background: "#0f0f0f",
                borderRadius: "28px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "18px",
              }}
            >
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={producto.nombre}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  style={{
                    color: "#777",
                    fontSize: "0.95rem",
                  }}
                >
                  Sin imagen
                </div>
              )}

              {imagenesProducto.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    style={{
                      position: "absolute",
                      left: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "42px",
                      height: "42px",
                      borderRadius: "999px",
                      border: "none",
                      background: "rgba(255,255,255,0.14)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "var(--aska-text-secondary, #fff)",
                      fontSize: "1.6rem",
                      cursor: "pointer",
                      zIndex: 3,
                    }}
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    onClick={nextImage}
                    style={{
                      position: "absolute",
                      right: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "42px",
                      height: "42px",
                      borderRadius: "999px",
                      border: "none",
                      background: "rgba(255,255,255,0.14)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "var(--aska-text-secondary, #fff)",
                      fontSize: "1.6rem",
                      cursor: "pointer",
                      zIndex: 3,
                    }}
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {imagenesProducto.length > 1 && (
              <div
                className="aska-product-thumbs"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(88px, 1fr))",
                  gap: "12px",
                  marginTop: "16px",
                }}
              >
                {imagenesProducto.map((img, index) => (
                  <button
                    key={`${img}-${index}`}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    style={{
                      border:
                        selectedIndex === index
                          ? "2px solid var(--aska-accent-primary, #6f5491)"
                          : "1px solid rgba(0,0,0,0.10)",
                      borderRadius: "16px",
                      background: "#f8f8f8",
                      padding: "6px",
                      cursor: "pointer",
                      overflow: "hidden",
                      height: "92px",
                    }}
                  >
                    <img
                      src={img}
                      alt={`${producto.nombre} ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        borderRadius: "10px",
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <aside
            className="aska-product-info-card"
            style={{
              background: "var(--aska-card-bg, #ffffff)",
              borderRadius: "34px",
              border: "1px solid rgba(17,17,17,0.08)",
              padding: "clamp(34px, 4vw, 56px)",
              boxShadow: "0 30px 90px rgba(0,0,0,0.10)",
              position: "sticky",
              top: "108px",
              color: "var(--aska-text-primary, #111)",
            }}
          >
            <h1
              style={{
                margin: 0,
                marginBottom: "18px",
                fontSize: "clamp(2.8rem, 5.2vw, 5.8rem)",
                lineHeight: 0.88,
                letterSpacing: "-0.065em",
                fontFamily: "var(--aska-font-family-primary, inherit)",
                color: "var(--aska-text-primary, #111)",
              }}
            >
              {producto.nombre}
            </h1>

            <p
              style={{
                margin: 0,
                marginBottom: "22px",
                fontSize: "clamp(1.1rem, 1.8vw, 1.45rem)",
                fontWeight: 500,
                letterSpacing: "0.04em",
                color: "var(--aska-text-primary, #111)",
                fontFamily: "var(--aska-font-family-primary, inherit)",
              }}
            >
              {formatPrice(producto.precio)}
            </p>

            <p
              style={{
                margin: 0,
                marginBottom: "28px",
                color: "rgba(255,255,255,0.72)",
                lineHeight: 1.8,
                fontSize: "1.02rem",
              }}
            >
              {producto.descripcion}
            </p>

            {producto?.categoria?.toLowerCase().includes("corporal") ? (
              <div
                style={{
                  marginBottom: "22px",
                  padding: "14px 18px",
                  borderRadius: "16px",
                  background: "#fff4f4",
                  border: "1px solid rgba(200,0,0,0.15)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  lineHeight: 1.5,
                }}
              >
                Este producto tarda 7 días hábiles en ser diseñado, armado y enviado.
              </div>
            ) : (
              <div
                style={{
                  marginBottom: "22px",
                  padding: "14px 18px",
                  borderRadius: "16px",
                  background: "#f4f4ff",
                  border: "1px solid rgba(120,120,255,0.15)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  lineHeight: 1.5,
                }}
              >
                El envío tarda de 2 a 4 días hábiles.
              </div>
            )}

            <button
              className="aska-add-to-cart-button"
              type="button"
              onClick={handleAddToCart}
              style={{
                border: "none",
                background: "var(--aska-bg-primary, #0b0b0b)",
                color: "var(--aska-text-secondary, #fff)",
                borderRadius: "0",
                padding: "17px 30px",
                fontSize: "0.78rem",
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: "pointer",
                minWidth: "240px",
                transition: "transform .22s ease, opacity .22s ease, background .22s ease",
                fontFamily: "var(--aska-font-family-secondary, inherit)",
                borderRadius: "999px",
                boxShadow: "0 14px 36px rgba(0,0,0,0.18)",
              }}
            >
              Agregar al carrito
            </button>

            <a
              href={`https://wa.me/573125183100?text=${encodeURIComponent(
                `Hola ASKA, quiero comprar ${producto.nombre}`
              )}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "block",
                marginTop: "16px",
                color: "rgba(255,255,255,0.7)",
                textDecoration: "none",
                fontSize: ".9rem",
                letterSpacing: ".08em",
                textAlign: "center",
                fontFamily: "var(--aska-font-family-secondary, inherit)",
              }}
            >
              Comprar por WhatsApp
            </a>
          </aside>
        </div>
      </section>

      <style>
        {`
          :root {
            --aska-card-bg: #111111;
          }

          .aska-add-to-cart-button:hover {
            transform: translateY(-3px);
            opacity: 0.96;
          }

          .aska-product-gallery-card,
          .aska-product-info-card {
            transition:
              transform 0.28s ease,
              box-shadow 0.28s ease;
          }

          .aska-product-gallery-card:hover,
          .aska-product-info-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 24px 60px rgba(0,0,0,0.12) !important;
          }


          html,
          body,
          #root {
            max-width: 100%;
            overflow-x: hidden;
          }

          * {
            box-sizing: border-box;
          }

          .aska-product-detail-page,
          .aska-product-detail-grid,
          .aska-product-gallery-card,
          .aska-product-info-card,
          .aska-product-image-frame,
          .aska-product-thumbs {
            max-width: 100%;
            min-width: 0;
          }



          

          .aska-product-detail-grid {
            position: relative;
            z-index: 1;
          }

          .aska-product-gallery-card > p {
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-weight: 600;
            color: rgba(17,17,17,0.46) !important;
          }

          .aska-product-image-frame img {
            filter: contrast(1.02) saturate(0.96);
            transition:
              transform .72s cubic-bezier(.22,.61,.36,1),
              filter .72s ease;
          }

          .aska-product-image-frame:hover img {
            transform: scale(1.035);
            filter: contrast(1.05) saturate(1.02);
          }

          .aska-product-info-card::before {
            content: "AŞKA PIECE";
            display: block;
            margin-bottom: 18px;
            color: rgba(17,17,17,0.42);
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: 0.68rem;
            font-weight: 600;
            letter-spacing: 0.24em;
            text-transform: uppercase;
          }

          .aska-product-info-card p {
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
          }

          .aska-add-to-cart-button {
            width: 100%;
            margin-top: 8px;
            box-shadow: none !important;
          }

          .aska-add-to-cart-button:hover {
            background: #1a1a1a !important;
            box-shadow: 0 20px 46px rgba(0,0,0,0.18) !important;
          }

          .aska-product-thumbs button {
            transition:
              transform .24s ease,
              opacity .24s ease,
              border-color .24s ease;
          }

          .aska-product-thumbs button:hover {
            transform: translateY(-2px);
            opacity: .92;
          }

          @media (max-width: 768px) {
            .aska-product-detail-page {
              padding: 24px 14px 48px !important;
            }

            .aska-product-detail-grid {
              grid-template-columns: 1fr !important;
              gap: 18px !important;
            }

            .aska-product-gallery-card {
              padding: 12px !important;
              border-radius: 22px !important;
            }

            .aska-product-image-frame {
              height: min(78vw, 340px) !important;
              min-height: 260px !important;
              padding: 10px !important;
              border-radius: 18px !important;
            }

            .aska-product-thumbs {
              grid-template-columns: repeat(auto-fit, minmax(72px, 1fr)) !important;
              gap: 10px !important;
            }

            .aska-product-thumbs button {
              height: 78px !important;
              border-radius: 14px !important;
            }

            .aska-product-info-card {
              position: static !important;
              top: auto !important;
              padding: 26px 22px !important;
              border-radius: 22px !important;
            }

            .aska-add-to-cart-button {
              width: 100% !important;
              min-width: 0 !important;
            }

            .aska-add-to-cart-button:hover {
              transform: translateY(-2px);
              opacity: 0.96;
            }
          }

          @media (max-width: 420px) {
            .aska-product-detail-page {
              padding-left: 10px !important;
              padding-right: 10px !important;
            }

            .aska-product-image-frame {
              min-height: 240px !important;
            }

            .aska-product-info-card h1 {
              font-size: 2rem !important;
            }
          }
        `}
      </style>

    </>
  );
}

export default ProductDetail;