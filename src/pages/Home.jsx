import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function slugifyCategory(name = "") {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+y\s+/g, "-y-")
    .replace(/\s+/g, "-");
}

function getProductImages(product) {
  const images = [];

  if (Array.isArray(product?.imagenes)) {
    product.imagenes.forEach((img) => {
      if (!img) return;

      if (typeof img === "string") {
        if (!images.includes(img)) images.push(img);
        return;
      }

      if (typeof img === "object") {
        const possibleUrl =
          img.url || img.imagen || img.src || img.image || img.ruta || "";
        if (possibleUrl && !images.includes(possibleUrl)) images.push(possibleUrl);
      }
    });
  }

  if (product?.imagen && !images.includes(product.imagen)) {
    images.unshift(product.imagen);
  }

  return images;
}

function Home() {
  const [config, setConfig] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedImages, setSelectedImages] = useState({});

  useEffect(() => {
    const cargarConfig = async () => {
      try {
        const response = await fetch("https://aska-backend-nyx8.onrender.com/api/home-config");
        const data = await response.json();
        setConfig(data || null);
      } catch (error) {
        console.error("Error cargando home:", error);
        setConfig(null);
      }
    };

    cargarConfig();
  }, []);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const response = await fetch("https://aska-backend-nyx8.onrender.com/api/productos");
        const data = await response.json();

        const detailedProducts = await Promise.all(
          (Array.isArray(data) ? data : []).map(async (product) => {
            try {
              const detailRes = await fetch(
                `https://aska-backend-nyx8.onrender.com/api/productos/${product.id}`
              );
              if (!detailRes.ok) return product;
              return await detailRes.json();
            } catch {
              return product;
            }
          })
        );

        setProducts(detailedProducts);

        const initialSelected = {};
        detailedProducts.forEach((product) => {
          const images = getProductImages(product);
          if (images.length > 0) {
            initialSelected[product.id] = 0;
          }
        });
        setSelectedImages(initialSelected);
      } catch (error) {
        console.error("Error cargando productos en home:", error);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    cargarProductos();
  }, []);

  const mediaUrl = config?.media_url || "";
  const mediaTipo = config?.media_tipo || "imagen";
  const titulo = config?.titulo || "";
  const subtitulo = config?.subtitulo || "";
  const colorTexto = config?.color_texto || "#ffffff";
  const overlayOpacidad =
    config?.overlay_opacidad !== null && config?.overlay_opacidad !== undefined
      ? Number(config.overlay_opacidad)
      : 0.2;
  const fuenteTexto = config?.fuente_texto || "Georgia, serif";

  const overlayLogoUrl = config?.overlay_logo_url || "";
  const overlayLogoWidth = Number(config?.overlay_logo_width || 520);
  const mostrarLogo = Number(config?.mostrar_logo ?? 1) === 1;
  const mostrarTexto = Number(config?.mostrar_texto ?? 1) === 1;

  const logoPosX = Number(config?.logo_pos_x ?? 50);
  const logoPosY = Number(config?.logo_pos_y ?? 42);
  const textoPosX = Number(config?.texto_pos_x ?? 50);
  const textoPosY = Number(config?.texto_pos_y ?? 72);

  const tituloFontSize = Number(config?.titulo_font_size || 74);
  const subtituloFontSize = Number(config?.subtitulo_font_size || 28);
  const textoAlign = config?.texto_align || "center";

  const categories = useMemo(() => {
    const orden = [
      "Collares",
      "Pulseras",
      "Accesorios corporales",
      "Aretes y anillos",
      "collares",
      "pulseras",
      "accesorios corporales",
      "aretes y anillos",
    ];

    const reales = [...new Set(products.map((p) => p.categoria).filter(Boolean))];

    return reales.sort((a, b) => {
      const indexA = orden.findIndex(
        (item) => item.toLowerCase() === String(a).toLowerCase()
      );
      const indexB = orden.findIndex(
        (item) => item.toLowerCase() === String(b).toLowerCase()
      );

      if (indexA === -1 && indexB === -1) return String(a).localeCompare(String(b));
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    });
  }, [products]);

  const handleThumbnailClick = (event, productId, index) => {
    event.preventDefault();
    event.stopPropagation();

    setSelectedImages((prev) => ({
      ...prev,
      [productId]: index,
    }));
  };

  const handlePrevImage = (event, product) => {
    event.preventDefault();
    event.stopPropagation();

    const images = getProductImages(product);
    if (images.length <= 1) return;

    setSelectedImages((prev) => {
      const current = prev[product.id] ?? 0;
      return {
        ...prev,
        [product.id]: (current - 1 + images.length) % images.length,
      };
    });
  };

  const handleNextImage = (event, product) => {
    event.preventDefault();
    event.stopPropagation();

    const images = getProductImages(product);
    if (images.length <= 1) return;

    setSelectedImages((prev) => {
      const current = prev[product.id] ?? 0;
      return {
        ...prev,
        [product.id]: (current + 1) % images.length,
      };
    });
  };

  const ProductCover = ({ item, large = false }) => {
    const itemImages = getProductImages(item).slice(0, 4);
    const currentIndex = selectedImages[item.id] ?? 0;
    const currentImage = itemImages[currentIndex] || itemImages[0] || item.imagen || "";

    return (
      <Link
        to={`/producto/${item.id}`}
        style={{
          position: "relative",
          display: "block",
          height: large ? "560px" : "268px",
          minHeight: large ? "520px" : "250px",
          borderRadius: large ? "30px" : "24px",
          overflow: "hidden",
          textDecoration: "none",
          color: "#fff",
          background: "#070707",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: large
            ? "0 28px 80px rgba(0,0,0,0.46)"
            : "0 18px 48px rgba(0,0,0,0.36)",
          transition:
            "transform 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-6px)";
          e.currentTarget.style.borderColor = "rgba(217,200,239,0.35)";
          e.currentTarget.style.boxShadow = large
            ? "0 34px 96px rgba(0,0,0,0.58)"
            : "0 24px 60px rgba(0,0,0,0.48)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
          e.currentTarget.style.boxShadow = large
            ? "0 28px 80px rgba(0,0,0,0.46)"
            : "0 18px 48px rgba(0,0,0,0.36)";
        }}
      >
        {currentImage ? (
          <img
            src={currentImage}
            alt={item.nombre}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transition: "transform 0.45s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.045)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              color: "rgba(255,255,255,0.38)",
              background: "#070707",
            }}
          >
            Sin imagen
          </div>
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.88) 100%)",
            pointerEvents: "none",
          }}
        />

        {itemImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(event) => handlePrevImage(event, item)}
              style={{
                position: "absolute",
                left: large ? "18px" : "12px",
                top: "50%",
                transform: "translateY(-50%)",
                width: large ? "46px" : "38px",
                height: large ? "46px" : "38px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                fontSize: large ? "1.8rem" : "1.45rem",
                cursor: "pointer",
                zIndex: 3,
                backdropFilter: "blur(8px)",
              }}
            >
              ‹
            </button>

            <button
              type="button"
              onClick={(event) => handleNextImage(event, item)}
              style={{
                position: "absolute",
                right: large ? "18px" : "12px",
                top: "50%",
                transform: "translateY(-50%)",
                width: large ? "46px" : "38px",
                height: large ? "46px" : "38px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                fontSize: large ? "1.8rem" : "1.45rem",
                cursor: "pointer",
                zIndex: 3,
                backdropFilter: "blur(8px)",
              }}
            >
              ›
            </button>
          </>
        )}

        <div
          style={{
            position: "absolute",
            left: large ? "26px" : "16px",
            right: large ? "26px" : "16px",
            bottom: large ? "24px" : "16px",
            zIndex: 4,
          }}
        >
          <p
            style={{
              margin: 0,
              marginBottom: large ? "8px" : "5px",
              color: "rgba(217,200,239,0.84)",
              fontSize: large ? "0.82rem" : "0.68rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              fontFamily: `"Helvetica Neue", Arial, sans-serif`,
              fontWeight: 700,
            }}
          >
            {item.categoria}
          </p>

          <h4
            style={{
              margin: 0,
              marginBottom: large ? "10px" : "6px",
              fontSize: large
                ? "clamp(1.65rem, 2.5vw, 2.7rem)"
                : "clamp(1rem, 1.55vw, 1.35rem)",
              lineHeight: 1.05,
              color: "#ffffff",
            }}
          >
            {item.nombre}
          </h4>

          <p
            style={{
              margin: 0,
              color: "#ffffff",
              fontWeight: 800,
              fontSize: large ? "1.18rem" : "0.98rem",
              fontFamily: `"Helvetica Neue", Arial, sans-serif`,
            }}
          >
            {formatPrice(item.precio)}
          </p>

          {itemImages.length > 1 && (
  <div
    style={{
      display: "flex",
      gap: "8px",
      marginTop: large ? "16px" : "10px",
      flexWrap: "wrap",
    }}
  >
    {itemImages.map((img, index) => {
      const active = currentIndex === index;

      return (
        <button
          key={`${img}-${index}`}
          type="button"
          onClick={(event) => handleThumbnailClick(event, item.id, index)}
          style={{
            width: large ? "64px" : "46px",
            height: large ? "52px" : "40px",
            borderRadius: "12px",
            overflow: "hidden",
            padding: 0,
            cursor: "pointer",
            background: "#111",
            border: active
              ? "1px solid rgba(217,200,239,0.95)"
              : "1px solid rgba(255,255,255,0.14)",
            opacity: active ? 1 : 0.68,
          }}
        >
          <img
            src={img}
            alt={`${item.nombre} miniatura ${index + 1}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <>
      <Navbar />

      <section
        style={{
          position: "relative",
          minHeight: "53vh",
          overflow: "hidden",
          background: mediaUrl ? "#000" : "#0b0b0b",
        }}
      >
        {mediaUrl ? (
          mediaTipo === "video" ? (
            <video
              src={mediaUrl}
              autoPlay
              muted
              loop
              playsInline
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <img
              src={mediaUrl}
              alt={titulo || "AŞKA"}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )
        ) : null}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(0,0,0,${overlayOpacidad})`,
            zIndex: 1,
          }}
        />

        {mostrarLogo && overlayLogoUrl && (
          <img
            src={overlayLogoUrl}
            alt="AŞKA"
            style={{
              position: "absolute",
              left: `${logoPosX}%`,
              top: `${logoPosY}%`,
              transform: "translate(-50%, -50%)",
              width: `${overlayLogoWidth}px`,
              maxWidth: "92vw",
              objectFit: "contain",
              display: "block",
              zIndex: 4,
            }}
          />
        )}

        {mostrarTexto && (
          <div
            style={{
              position: "absolute",
              left: `${textoPosX}%`,
              top: `${textoPosY}%`,
              transform: "translate(-50%, -50%)",
              zIndex: 5,
              textAlign: textoAlign,
              padding: "8px 12px",
              width: "min(90vw, 1100px)",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: `${tituloFontSize}px`,
                lineHeight: 0.96,
                color: colorTexto,
                fontFamily: fuenteTexto,
                letterSpacing: "0.01em",
              }}
            >
              {titulo}
            </h1>

            <p
              style={{
                margin: 0,
                marginTop: "-4px",
                fontSize: `${subtituloFontSize}px`,
                lineHeight: 1.15,
                color: colorTexto,
                fontFamily: fuenteTexto,
                whiteSpace: "nowrap",
              }}
            >
              {subtitulo}
            </p>
          </div>
        )}
      </section>

      <section
        style={{
          background: "#050505",
          color: "#ffffff",
          padding: "46px 24px 0",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            maxWidth: "1160px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div
            style={{
              maxWidth: "930px",
              margin: "0 auto",
            }}
          >
            <p
              style={{
                margin: 0,
                marginBottom: "14px",
                fontSize: "clamp(1rem, 1.22vw, 1.18rem)",
                lineHeight: 1.58,
                fontWeight: 300,
                color: "rgba(255,255,255,0.76)",
                letterSpacing: "0.003em",
                fontFamily: `"Helvetica Neue", Arial, sans-serif`,
              }}
            >
              En AŞKA el acero inoxidable se transforma en piezas únicas que cuentan tu historia.
            </p>

            <p
              style={{
                margin: 0,
                marginBottom: "14px",
                fontSize: "clamp(1rem, 1.22vw, 1.18rem)",
                lineHeight: 1.58,
                fontWeight: 300,
                color: "rgba(255,255,255,0.76)",
                letterSpacing: "0.003em",
                fontFamily: `"Helvetica Neue", Arial, sans-serif`,
              }}
            >
              Cada joya y accesorio es tejido a mano. Creamos estilos contemporáneos que te dan fuerza y actitud.
            </p>

            <p
              style={{
                margin: 0,
                marginBottom: "24px",
                fontSize: "clamp(1rem, 1.22vw, 1.18rem)",
                lineHeight: 1.58,
                fontWeight: 300,
                color: "rgba(255,255,255,0.76)",
                letterSpacing: "0.003em",
                fontFamily: `"Helvetica Neue", Arial, sans-serif`,
              }}
            >
              Somos una marca unisex que cree en el poder de los detalles para marcar la diferencia.
            </p>

            <p
              style={{
                margin: 0,
                marginBottom: "12px",
                fontSize: "clamp(1rem, 1.22vw, 1.18rem)",
                lineHeight: 1.58,
                fontWeight: 300,
                color: "rgba(255,255,255,0.76)",
                letterSpacing: "0.003em",
                fontFamily: `"Helvetica Neue", Arial, sans-serif`,
              }}
            >
              AŞKA es mucho más que diseño, somos un taller liderado por mujeres artesanas.
            </p>

            <p
              style={{
                margin: 0,
                fontSize: "clamp(1rem, 1.22vw, 1.18rem)",
                lineHeight: 1.58,
                fontWeight: 300,
                color: "rgba(255,255,255,0.76)",
                letterSpacing: "0.003em",
                fontFamily: `"Helvetica Neue", Arial, sans-serif`,
              }}
            >
              Nuestro sueño es empoderar mujeres, enseñándoles este arte como camino hacia la autonomía económica y una vida con propósito.
            </p>
          </div>

          <div
            style={{
              marginTop: "34px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          />

          <div
            style={{
              position: "relative",
              marginTop: "14px",
              minHeight: "112px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              borderRadius: "26px",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 22px 70px rgba(0,0,0,0.35)",
              background: mediaUrl
                ? `linear-gradient(rgba(0,0,0,0.86), rgba(0,0,0,0.86)), url(${mediaUrl}) center/cover no-repeat`
                : "#000000",
            }}
          >
            <a
              href="https://www.instagram.com/aska_bogota?igsh=ZXYzNnc1OHczOGMy"
              target="_blank"
              rel="noreferrer"
              style={{
                color: "#f3f0ea",
                textDecoration: "underline",
                textUnderlineOffset: "4px",
                fontSize: "clamp(1.1rem, 1.55vw, 1.58rem)",
                fontStyle: "italic",
                fontWeight: 600,
                fontFamily: `"Helvetica Neue", Arial, sans-serif`,
                position: "relative",
                zIndex: 2,
              }}
            >
              Síguenos en Instagram @aska_bogota
            </a>
          </div>
        </div>
      </section>

      <section
        style={{
          background:
            "linear-gradient(180deg, #050505 0%, #080808 48%, #050505 100%)",
          color: "#fff",
          padding: "80px 24px 100px",
        }}
      >
        <div className="aska-home-products-wrap" style={{ maxWidth: "1320px", margin: "0 auto" }}>
          {loadingProducts ? (
            <p style={{ color: "rgba(255,255,255,0.68)" }}>
              Cargando productos...
            </p>
          ) : categories.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.68)" }}>
              No hay productos disponibles.
            </p>
          ) : (
            <div className="aska-home-categories-grid" style={{ display: "grid", gap: "76px" }}>
              {categories.map((category) => {
                const preview = products
                  .filter(
                    (p) =>
                      String(p.categoria || "").toLowerCase() ===
                      String(category || "").toLowerCase()
                  )
                  .slice(0, 5);

                const mainProduct = preview[0];
                const secondaryProducts = preview.slice(1, 5);

                return (
                  <section key={category} className="aska-home-category-section">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "end",
                        gap: "16px",
                        marginBottom: "24px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: 0,
                            marginBottom: "8px",
                            color: "rgba(217,200,239,0.72)",
                            letterSpacing: "0.16em",
                            textTransform: "uppercase",
                            fontSize: "0.78rem",
                            fontFamily: `"Helvetica Neue", Arial, sans-serif`,
                          }}
                        >
                          Colección AŞKA
                        </p>

                        <h3
                          style={{
                            margin: 0,
                            fontSize: "clamp(1.8rem, 3.4vw, 3rem)",
                            lineHeight: 1,
                            letterSpacing: "0.02em",
                          }}
                        >
                          {category}
                        </h3>
                      </div>

                      <Link
                        to={`/catalogo/${slugifyCategory(category)}`}
                        style={{
                          color: "#f3e6ff",
                          textDecoration: "none",
                          fontWeight: 700,
                          border: "1px solid rgba(217,200,239,0.22)",
                          borderRadius: "999px",
                          padding: "10px 16px",
                          background: "rgba(217,200,239,0.08)",
                          fontFamily: `"Helvetica Neue", Arial, sans-serif`,
                        }}
                      >
                        Ver más
                      </Link>
                    </div>

                    {mainProduct ? (
                      <div
                        className="aska-home-product-layout"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "minmax(0, 1.25fr) minmax(0, 1fr)",
                          gap: "24px",
                          alignItems: "stretch",
                        }}
                      >
                        <ProductCover item={mainProduct} large />

                        <div
                          className="aska-home-secondary-grid"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            gap: "18px",
                          }}
                        >
                          {secondaryProducts.map((item) => (
                            <ProductCover key={item.id} item={item} />
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </div>
          )}
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

          .aska-home-products-wrap,
          .aska-home-categories-grid,
          .aska-home-category-section,
          .aska-home-product-layout,
          .aska-home-secondary-grid {
            max-width: 100%;
            min-width: 0;
          }

          @media (max-width: 768px) {
            .aska-home-product-layout {
              grid-template-columns: 1fr !important;
              gap: 18px !important;
            }

            .aska-home-secondary-grid {
              grid-template-columns: 1fr !important;
              gap: 18px !important;
            }

            .aska-home-categories-grid {
              gap: 54px !important;
            }
          }

          @media (max-width: 480px) {
            .aska-home-products-wrap {
              width: 100%;
            }

            .aska-home-product-layout,
            .aska-home-secondary-grid {
              width: 100%;
            }
          }
        `}
      </style>

    </>
  );
}

export default Home;