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
            background: "#f5f5f5",
            padding: "120px 24px 60px",
            color: "#111",
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
            background: "#f5f5f5",
            padding: "120px 24px 60px",
            color: "#111",
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
          background: "#f3f3f3",
          padding: "42px 24px 60px",
        }}
      >
        <div
          className="aska-product-detail-grid"
          style={{
            maxWidth: "1320px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 0.9fr)",
            gap: "32px",
            alignItems: "start",
          }}
        >
          <div
            className="aska-product-gallery-card"
            style={{
              background: "#ffffff",
              borderRadius: "26px",
              border: "1px solid rgba(0,0,0,0.08)",
              padding: "18px",
              boxShadow: "0 18px 45px rgba(0,0,0,0.08)",
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
                height: "520px",
                minHeight: "380px",
                background: "#f8f8f8",
                borderRadius: "22px",
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
                      background: "rgba(0,0,0,0.55)",
                      color: "#fff",
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
                      background: "rgba(0,0,0,0.55)",
                      color: "#fff",
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
                          ? "2px solid #6f5491"
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
              background: "#ffffff",
              borderRadius: "26px",
              border: "1px solid rgba(0,0,0,0.08)",
              padding: "40px",
              boxShadow: "0 18px 45px rgba(0,0,0,0.08)",
              position: "sticky",
              top: "108px",
              color: "#111",
            }}
          >
            <h1
              style={{
                margin: 0,
                marginBottom: "18px",
                fontSize: "clamp(2.2rem, 4vw, 3.8rem)",
                lineHeight: 1.02,
                color: "#111",
              }}
            >
              {producto.nombre}
            </h1>

            <p
              style={{
                margin: 0,
                marginBottom: "22px",
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                fontWeight: 700,
                color: "#111",
              }}
            >
              {formatPrice(producto.precio)}
            </p>

            <p
              style={{
                margin: 0,
                marginBottom: "28px",
                color: "#2b2b2b",
                lineHeight: 1.8,
                fontSize: "1.05rem",
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
                background: "#0b0b0b",
                color: "#fff",
                borderRadius: "0",
                padding: "18px 28px",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
                minWidth: "240px",
                transition: "transform .22s ease, opacity .22s ease, background .22s ease",
              }}
            >
              Agregar al carrito
            </button>
          </aside>
        </div>
      </section>

      <style>
        {`
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