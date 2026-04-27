import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import procesoVideo from "../assets/proceso.mp4";

const CATEGORY_MAP = {
  collares: "Collares",
  pulseras: "Pulseras",
  "accesorios-corporales": "Accesorios corporales",
  "aretes-y-anillos": "Aretes y anillos",
};

function slugifyCategory(name = "") {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+y\s+/g, "-y-")
    .replace(/\s+/g, "-");
}

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
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

function Catalog() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hero, setHero] = useState(null);
  const [selectedImages, setSelectedImages] = useState({});

  const categoriaActiva = slug ? CATEGORY_MAP[slug] || "" : "";
  const heroSlug = slug || "catalogo";

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);

        const res = await fetch("https://aska-backend-nyx8.onrender.com/api/productos");
        const data = await res.json();

        const productsArray = Array.isArray(data) ? data : [];

        const detailedProducts = await Promise.all(
          productsArray.map(async (product) => {
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
        console.error("Error cargando productos:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  useEffect(() => {
    const cargarHero = async () => {
      try {
        const res = await fetch(`https://aska-backend-nyx8.onrender.com/api/catalogo-hero/${heroSlug}`);
        const data = await res.json();
        setHero(data || null);
      } catch (error) {
        console.error("Error cargando hero catálogo:", error);
        setHero(null);
      }
    };

    cargarHero();
  }, [heroSlug]);

  const categories = useMemo(() => {
    return [...new Set(products.map((p) => p.categoria).filter(Boolean))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!categoriaActiva) return products;
    return products.filter((p) => p.categoria === categoriaActiva);
  }, [products, categoriaActiva]);

  const heroMediaUrl =
    hero?.media_url && hero.media_url.trim() !== "" ? hero.media_url : procesoVideo;

  const heroMediaTipo =
    hero?.media_tipo && hero?.media_url && hero.media_url.trim() !== ""
      ? hero.media_tipo
      : "video";

  const heroTitulo =
    hero?.titulo?.trim() || (categoriaActiva ? categoriaActiva : "Catálogo");

  const heroSubtitulo =
    hero?.subtitulo?.trim() ||
    (categoriaActiva
      ? `Descubre todas las piezas de ${categoriaActiva}.`
      : "Descubre algunas piezas por categoría y entra al catálogo completo de cada sección.");

  const heroColor = hero?.color_texto || "#ffffff";
  const heroOverlay =
    hero?.overlay_opacidad !== null && hero?.overlay_opacidad !== undefined
      ? Number(hero.overlay_opacidad)
      : 0.2;
  const heroFuente = hero?.fuente_texto || "Georgia, serif";

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

  const renderCard = (item) => {
    const imgs = getProductImages(item).slice(0, 4);
    const currentIndex = selectedImages[item.id] ?? 0;
    const cover = imgs[currentIndex] || imgs[0] || item.imagen || "";

    return (
      <Link
        key={item.id}
        to={`/producto/${item.id}`}
        style={{
          textDecoration: "none",
          color: "#111",
          background: "#fff",
          borderRadius: "24px",
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 16px 36px rgba(0,0,0,0.08)",
          display: "block",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "300px",
            background: "#efefef",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <img
            src={cover}
            alt={item.nombre}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />

          {imgs.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => handlePrevImage(event, item)}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "40px",
                  height: "40px",
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
                onClick={(event) => handleNextImage(event, item)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "40px",
                  height: "40px",
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

        <div style={{ padding: "16px 16px 18px" }}>
          <h3
            style={{
              margin: 0,
              marginBottom: "4px",
              fontSize: categoriaActiva ? "1.4rem" : "1.25rem",
            }}
          >
            {item.nombre}
          </h3>

          <p
            style={{
              margin: 0,
              marginBottom: imgs.length > 0 ? "12px" : "0",
              fontWeight: 700,
              color: "#222",
            }}
          >
            {formatPrice(item.precio)}
          </p>

          {categoriaActiva && (
            <p
              style={{
                margin: 0,
                marginBottom: imgs.length > 0 ? "12px" : "0",
                color: "#444",
                lineHeight: 1.6,
              }}
            >
              {item.descripcion}
            </p>
          )}

          {imgs.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${Math.min(imgs.length, 4)}, minmax(0, 1fr))`,
                gap: "8px",
              }}
            >
              {imgs.map((img, index) => {
                const active = currentIndex === index;

                return (
                  <button
                    key={`${img}-${index}`}
                    type="button"
                    onClick={(event) =>
                      handleThumbnailClick(event, item.id, index)
                    }
                    style={{
                      border: active
                        ? "1px solid rgba(111, 84, 145, 0.85)"
                        : "1px solid rgba(0,0,0,0.10)",
                      background: "#f5f5f5",
                      borderRadius: "10px",
                      height: "48px",
                      overflow: "hidden",
                      padding: 0,
                      cursor: "pointer",
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
          minHeight: "46vh",
          overflow: "hidden",
          background: "#000",
        }}
      >
        {heroMediaTipo === "video" ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            src={heroMediaUrl}
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
            src={heroMediaUrl}
            alt={heroTitulo}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(0,0,0,${heroOverlay})`,
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "44px 30px 70px",
            color: heroColor,
            fontFamily: heroFuente,
          }}
        >
          <p
            style={{
              margin: 0,
              marginBottom: "10px",
              fontSize: "1.05rem",
              opacity: 0.95,
            }}
          >
            Explora la colección
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(3rem, 8vw, 5.6rem)",
              lineHeight: 0.95,
              marginBottom: "18px",
            }}
          >
            {heroTitulo}
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: "clamp(1.15rem, 2.2vw, 1.6rem)",
              lineHeight: 1.4,
              maxWidth: "860px",
            }}
          >
            {heroSubtitulo}
          </p>
        </div>
      </section>

      <section
        style={{
          background: "#f3f3f3",
          minHeight: "60vh",
          padding: "36px 24px 70px",
        }}
      >
        <div className="aska-catalog-wrap" style={{ maxWidth: "1320px", margin: "0 auto" }}>
          {loading ? (
            <p style={{ color: "#222", fontSize: "1rem" }}>Cargando catálogo...</p>
          ) : categoriaActiva ? (
            filteredProducts.length === 0 ? (
              <p style={{ color: "#222", fontSize: "1rem" }}>
                No hay productos en esta categoría todavía.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "24px",
                }}
              >
                {filteredProducts.map((item) => renderCard(item))}
              </div>
            )
          ) : (
            <div style={{ display: "grid", gap: "36px" }}>
              {categories.length === 0 ? (
                <p style={{ color: "#222", fontSize: "1rem" }}>
                  No hay productos disponibles.
                </p>
              ) : (
                categories.map((category) => {
                  const preview = products
                    .filter((p) => p.categoria === category)
                    .slice(0, 5);

                  return (
                    <section key={category}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "18px",
                          flexWrap: "wrap",
                        }}
                      >
                        <h2
                          style={{
                            margin: 0,
                            color: "#111",
                            fontSize: "clamp(1.7rem, 3vw, 2.4rem)",
                          }}
                        >
                          {category}
                        </h2>

                        <Link
                          to={`/catalogo/${slugifyCategory(category)}`}
                          style={{
                            textDecoration: "none",
                            color: "#6f5491",
                            fontWeight: 700,
                          }}
                        >
                          Ver más
                        </Link>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                          gap: "20px",
                        }}
                      >
                        {preview.map((item) => renderCard(item))}
                      </div>
                    </section>
                  );
                })
              )}
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

          .aska-catalog-wrap {
            max-width: 100%;
            min-width: 0;
          }

          @media (max-width: 480px) {
            .aska-catalog-wrap {
              width: 100%;
            }
          }
        `}
      </style>

    </>
  );
}

export default Catalog;