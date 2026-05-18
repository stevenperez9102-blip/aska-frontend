import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [error, setError] = useState("");
  const [relatedProducts, setRelatedProducts] = useState([]);

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

  useEffect(() => {
    const cargarRelacionados = async () => {
      if (!producto?.categoria) {
        setRelatedProducts([]);
        return;
      }

      try {
        const response = await fetch("https://aska-backend-nyx8.onrender.com/api/productos");
        const data = await response.json();

        const items = Array.isArray(data) ? data : [];

        const relacionados = items
          .filter((item) => {
            const sameCategory =
              String(item.categoria || "").toLowerCase() ===
              String(producto.categoria || "").toLowerCase();

            return sameCategory && String(item.id) !== String(producto.id);
          })
          .slice(0, 6);

        setRelatedProducts(relacionados);
      } catch (error) {
        console.error("Error cargando productos relacionados:", error);
        setRelatedProducts([]);
      }
    };

    cargarRelacionados();
  }, [producto]);

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
            color: "#ffffff",
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
        <div style={{ maxWidth: "1320px", margin: "0 auto 28px", display: "flex", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: "999px",
              color: "rgba(255,255,255,0.82)",
              padding: "10px 20px",
              fontSize: "0.85rem",
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "var(--aska-font-family-secondary, inherit)",
              backdropFilter: "blur(10px)",
            }}
          >
            ← Volver
          </button>
        </div>
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
              background: "rgba(10,10,10,0.96)",
              borderRadius: "34px",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "16px",
              boxShadow: "0 40px 120px rgba(0,0,0,0.42)",
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
              className="aska-product-image-frame aska-cinematic-frame"
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
                  className="aska-main-product-image"
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
              background: "rgba(10,10,10,0.96)",
              borderRadius: "34px",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "clamp(34px, 4vw, 56px)",
              boxShadow: "0 40px 120px rgba(0,0,0,0.42)",
              position: "sticky",
              top: "108px",
              color: "#ffffff",
            }}
          >
            <div className="aska-piece-badge">AŞKA ATELIER</div>

            <h1
              style={{
                margin: 0,
                marginBottom: "18px",
                fontSize: "clamp(2.4rem, 4.4vw, 4.8rem)",
                lineHeight: 0.88,
                letterSpacing: "-0.065em",
                fontFamily: "var(--aska-font-family-primary, inherit)",
                color: "#ffffff",
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
                color: "#ffffff",
                fontFamily: "var(--aska-font-family-primary, inherit)",
              }}
            >
              {"COP " + formatPrice(producto.precio).replace("COP","").trim()}
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
              {producto.descripcion || "Pieza diseñada para presencia brutalista, siluetas oscuras y expresión editorial."}
            </p>

            {producto.editorial && (
              <div
                className="aska-editorial-copy"
                style={{
                  marginBottom: "28px",
                  padding: "22px",
                  borderRadius: "22px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(14px)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#ffffff",
                    fontSize: "1.1rem",
                    lineHeight: 1.8,
                    letterSpacing: "-0.02em",
                    fontStyle: "italic",
                  }}
                >
                  {producto.editorial}
                </p>
              </div>
            )}

            {producto?.categoria?.toLowerCase().includes("corporal") ? (
              <div
                style={{
                  marginBottom: "22px",
                  padding: "14px 18px",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  fontWeight: 600,
                  fontSize: "0.92rem",
                  lineHeight: 1.5,
                  color: "rgba(255,255,255,0.82)",
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
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  fontWeight: 600,
                  fontSize: "0.92rem",
                  lineHeight: 1.5,
                  color: "rgba(255,255,255,0.82)",
                }}
              >
                El envío tarda de 2 a 4 días hábiles.
              </div>
            )}

            {Array.isArray(producto.tags) && producto.tags.length > 0 && (
              <div
                className="aska-product-tags"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginBottom: "28px",
                }}
              >
                {producto.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "999px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.82)",
                      fontSize: ".72rem",
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                    }}
                  >
                    {tag}
                  </span>
                ))}
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
              AÑADIR PIEZA
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
      {relatedProducts.length > 0 && (
        <section className="aska-related-products-section">
          <div className="aska-related-products-wrap">
            <p className="aska-related-kicker">También podría interesarte</p>

            <h2 className="aska-related-title">
              MÁS PIEZAS
              <br />
              DE ESTA LÍNEA
            </h2>

            <div className="aska-related-rail">
              {relatedProducts.map((item) => {
                const imgs = normalizeImages(item);
                const image = imgs[0] || item.imagen || "";

                return (
                  <Link
                    key={item.id}
                    to={`/producto/${item.id}`}
                    className="aska-related-card"
                  >
                    <div className="aska-related-image">
                      {image ? (
                        <img src={image} alt={item.nombre || item.name} loading="lazy" />
                      ) : (
                        <div className="aska-related-empty">Sin imagen</div>
                      )}
                    </div>

                    <div className="aska-related-info">
                      <span>{item.categoria || item.category || "AŞKA"}</span>
                      <h3>{item.nombre || item.name}</h3>
                      <p>{formatPrice(item.precio || item.price)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <style>
        {`

          
          .aska-piece-badge{
            margin-bottom:18px;
            color:rgba(255,255,255,.42);
            font-size:.7rem;
            font-weight:700;
            letter-spacing:.26em;
            text-transform:uppercase;
            font-family:var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
          }

          .aska-cinematic-frame{
            cursor: zoom-in;
          }

          .aska-main-product-image{
            animation: askaImageReveal .72s cubic-bezier(.22,.61,.36,1);
            will-change: transform;
          }

          @keyframes askaImageReveal{
            from{
              opacity:0;
              transform:scale(1.04);
              filter:blur(8px);
            }
            to{
              opacity:1;
              transform:scale(1);
              filter:blur(0);
            }
          }

          .aska-product-image-frame::after{
            content:"";
            position:absolute;
            inset:0;
            background:
              linear-gradient(to top, rgba(0,0,0,.28), transparent 36%);
            pointer-events:none;
          }

          .aska-editorial-copy{
            position:relative;
            overflow:hidden;
          }

          .aska-editorial-copy::before{
            content:"";
            position:absolute;
            inset:0;
            background:
              radial-gradient(circle at top right, rgba(255,255,255,.08), transparent 42%);
            pointer-events:none;
          }

          .aska-related-rail::-webkit-scrollbar{
            height:6px;
          }

          .aska-related-rail::-webkit-scrollbar-thumb{
            background:rgba(255,255,255,.18);
            border-radius:999px;
          }


          .aska-product-detail-page {
            position: relative;
            overflow: hidden;
          }

          .aska-product-detail-page::before {
            content: "";
            position: absolute;
            inset: -10%;
            background:
              radial-gradient(circle at 12% 8%, rgba(255,255,255,.08), transparent 28%),
              radial-gradient(circle at 82% 14%, rgba(255,255,255,.05), transparent 30%);
            pointer-events: none;
          }

          .aska-product-gallery-card,
          .aska-product-info-card {
            backdrop-filter: blur(18px);
          }

          .aska-product-gallery-card {
            overflow: hidden;
          }

          .aska-product-image-frame {
            border: 1px solid rgba(255,255,255,.08);
          }

          .aska-product-info-card h1 {
            text-transform: uppercase;
            text-wrap: balance;
          }

          .aska-product-info-card::before {
            color: rgba(255,255,255,.42) !important;
          }

          .aska-product-gallery-card > p {
            color: rgba(255,255,255,.46) !important;
          }

          .aska-product-info-card p {
            color: rgba(255,255,255,.72);
          }

          .aska-product-thumbs button {
            background: rgba(255,255,255,.04) !important;
            border: 1px solid rgba(255,255,255,.08) !important;
          }

          .aska-add-to-cart-button {
            background: #ffffff !important;
            color: #0b0b0b !important;
            font-weight: 700 !important;
            letter-spacing: .22em !important;
          }

          .aska-add-to-cart-button:hover {
            transform: translateY(-3px);
          }


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


          .aska-related-products-section {
            background: #0b0b0b;
            padding: 0 24px 92px;
          }

          .aska-related-products-wrap {
            max-width: 1320px;
            margin: 0 auto;
          }

          .aska-related-kicker {
            margin: 0 0 12px;
            color: rgba(255,255,255,.42);
            font-size: .72rem;
            letter-spacing: .24em;
            text-transform: uppercase;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
          }

          .aska-related-title {
            margin: 0 0 28px;
            color: #ffffff;
            font-size: clamp(2rem,4vw,4.2rem);
            letter-spacing: -.06em;
            line-height: .92;
            text-transform: uppercase;
          }

          .aska-related-rail {
            display: flex;
            gap: 18px;
            overflow-x: auto;
            overflow-y: hidden;
            scroll-snap-type: x mandatory;
            padding-bottom: 20px;
          }

          .aska-related-card {
            flex: 0 0 clamp(240px, 24vw, 340px);
            scroll-snap-align: start;
            display: block;
            color: #ffffff;
            text-decoration: none;
            border-radius: 24px;
            overflow: hidden;
            background: #111111;
            border: 1px solid rgba(255,255,255,.08);
            transition:
              transform .42s cubic-bezier(.22,.61,.36,1),
              border-color .42s ease,
              box-shadow .42s ease;
          }

          .aska-related-card:hover {
            transform: translateY(-6px);
            border-color: rgba(255,255,255,.18);
            box-shadow: 0 28px 78px rgba(0,0,0,.32);
          }

          .aska-related-image {
            height: 420px;
            background: #080808;
            overflow: hidden;
          }

          .aska-related-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: transform .72s cubic-bezier(.22,.61,.36,1);
          }

          .aska-related-card:hover .aska-related-image img {
            transform: scale(1.045);
          }

          .aska-related-empty {
            height: 100%;
            display: grid;
            place-items: center;
            color: rgba(255,255,255,.45);
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
          }

          .aska-related-info {
            padding: 18px;
          }

          .aska-related-info span {
            display: block;
            margin-bottom: 8px;
            color: rgba(255,255,255,.48);
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: .62rem;
            font-weight: 700;
            letter-spacing: .2em;
            text-transform: uppercase;
          }

          .aska-related-info h3 {
            margin: 0 0 8px;
            color: #ffffff;
            font-size: 1.2rem;
            line-height: 1.05;
            text-transform: uppercase;
          }

          .aska-related-info p {
            margin: 0;
            color: rgba(255,255,255,.78);
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-weight: 700;
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
              position: sticky;
              bottom: 10px;
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