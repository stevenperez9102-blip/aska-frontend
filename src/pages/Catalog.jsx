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
        const res = await fetch(
          `https://aska-backend-nyx8.onrender.com/api/catalogo-hero/${heroSlug}`
        );
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
    const orden = [
      "Collares",
      "Pulseras",
      "Accesorios corporales",
      "Aretes y anillos",
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

  const filteredProducts = useMemo(() => {
    if (!categoriaActiva) return products;
    return products.filter(
      (p) =>
        String(p.categoria || "").toLowerCase() ===
        String(categoriaActiva || "").toLowerCase()
    );
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
      : "Piezas artesanales con actitud, presencia y fuerza visual.");

  const heroColor = hero?.color_texto || "#ffffff";
  const heroOverlay =
    hero?.overlay_opacidad !== null && hero?.overlay_opacidad !== undefined
      ? Number(hero.overlay_opacidad)
      : 0.28;
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

  const renderCard = (item, featured = false) => {
    const imgs = getProductImages(item).slice(0, 4);
    const currentIndex = selectedImages[item.id] ?? 0;
    const cover = imgs[currentIndex] || imgs[0] || item.imagen || "";

    return (
      <Link
        key={item.id}
        to={`/producto/${item.id}`}
        className={`aska-editorial-card ${featured ? "is-featured" : ""}`}
      >
        <div className="aska-editorial-card-media">
          {cover ? (
            <img src={cover} alt={item.nombre} />
          ) : (
            <div className="aska-editorial-card-empty">Sin imagen</div>
          )}

          <div className="aska-editorial-card-gradient" />

          {imgs.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => handlePrevImage(event, item)}
                className="aska-editorial-arrow aska-editorial-arrow-left"
                aria-label="Imagen anterior"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={(event) => handleNextImage(event, item)}
                className="aska-editorial-arrow aska-editorial-arrow-right"
                aria-label="Imagen siguiente"
              >
                ›
              </button>
            </>
          )}

          <div className="aska-editorial-card-info">
            <p className="aska-editorial-category">{item.categoria}</p>
            <h3>{item.nombre}</h3>
            <p className="aska-editorial-price">{formatPrice(item.precio)}</p>

            {categoriaActiva && item.descripcion && (
              <p className="aska-editorial-description">{item.descripcion}</p>
            )}

            {imgs.length > 1 && (
              <div className="aska-editorial-thumbs">
                {imgs.map((img, index) => {
                  const active = currentIndex === index;

                  return (
                    <button
                      key={`${img}-${index}`}
                      type="button"
                      onClick={(event) =>
                        handleThumbnailClick(event, item.id, index)
                      }
                      className={`aska-editorial-thumb ${active ? "active" : ""}`}
                      aria-label={`Ver imagen ${index + 1} de ${item.nombre}`}
                    >
                      <img src={img} alt={`${item.nombre} miniatura ${index + 1}`} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <>
      <Navbar />

      <section className="aska-catalog-hero">
        {heroMediaTipo === "video" ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            src={heroMediaUrl}
            className="aska-catalog-hero-media"
          />
        ) : (
          <img
            src={heroMediaUrl}
            alt={heroTitulo}
            className="aska-catalog-hero-media"
          />
        )}

        <div
          className="aska-catalog-hero-overlay"
          style={{
            background: `linear-gradient(90deg, rgba(0,0,0,${
              heroOverlay + 0.18
            }), rgba(0,0,0,${heroOverlay}) 45%, rgba(0,0,0,${
              heroOverlay + 0.16
            })), linear-gradient(180deg, rgba(0,0,0,0.10), rgba(0,0,0,0.48))`,
          }}
        />

        <div
          className="aska-catalog-hero-content"
          style={{
            color: heroColor,
            fontFamily: `var(--aska-font-family-primary, ${heroFuente})`,
          }}
        >
          <p>Explora la colección</p>

          <h1>{heroTitulo}</h1>

          <span>{heroSubtitulo}</span>
        </div>
      </section>

      <section className="aska-catalog-editorial-section">
        <div className="aska-catalog-wrap">
          {loading ? (
            <p className="aska-catalog-status">Cargando catálogo...</p>
          ) : categoriaActiva ? (
            filteredProducts.length === 0 ? (
              <p className="aska-catalog-status">
                No hay productos en esta categoría todavía.
              </p>
            ) : (
              <>
                <div className="aska-category-editorial-intro">
                  <p>Colección AŞKA</p>
                  <h2>{categoriaActiva}</h2>
                  <span>
                    Una selección de piezas creadas para destacar presencia,
                    textura y carácter.
                  </span>
                </div>

                <div className="aska-category-products-grid">
                  {filteredProducts.map((item, index) => (
                    <div
                      key={item.id}
                      className={index % 5 === 0 ? "is-wide" : ""}
                    >
                      {renderCard(item, index % 5 === 0)}
                    </div>
                  ))}
                </div>
              </>
            )
          ) : (
            <div className="aska-home-catalog-sections">
              {categories.length === 0 ? (
                <p className="aska-catalog-status">No hay productos disponibles.</p>
              ) : (
                categories.map((category) => {
                  const preview = products
                    .filter(
                      (p) =>
                        String(p.categoria || "").toLowerCase() ===
                        String(category || "").toLowerCase()
                    )
                    .slice(0, 5);

                  return (
                    <section key={category} className="aska-editorial-category-block">
                      <div className="aska-editorial-category-header">
                        <div>
                          <p>Colección AŞKA</p>
                          <h2>{category}</h2>
                        </div>

                        <Link
                          to={`/catalogo/${slugifyCategory(category)}`}
                          className="aska-editorial-see-more"
                        >
                          Ver más
                        </Link>
                      </div>

                      <div className="aska-editorial-feature-grid">
                        {preview.map((item, index) => (
                          <div
                            key={item.id}
                            className={index === 0 ? "is-main" : "is-secondary"}
                          >
                            {renderCard(item, index === 0)}
                          </div>
                        ))}
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

          .aska-catalog-hero {
            position: relative;
            min-height: 58vh;
            overflow: hidden;
            background: #050505;
            display: flex;
            align-items: flex-end;
          }

          .aska-catalog-hero-media {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center center;
            display: block;
          }

          .aska-catalog-hero-overlay {
            position: absolute;
            inset: 0;
            z-index: 1;
          }

          .aska-catalog-hero-content {
            position: relative;
            z-index: 2;
            width: min(1440px, 100%);
            margin: 0 auto;
            padding: clamp(120px, 16vw, 190px) clamp(24px, 5vw, 76px) clamp(54px, 7vw, 92px);
          }

          .aska-catalog-hero-content p {
            margin: 0 0 18px;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: 0.72rem;
            font-weight: 600;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.78);
          }

          .aska-catalog-hero-content h1 {
            margin: 0;
            max-width: 980px;
            font-size: clamp(3.8rem, 10vw, 9.4rem);
            line-height: 0.82;
            letter-spacing: -0.075em;
            font-weight: 500 !important;
            text-transform: uppercase;
            color: #ffffff;
            text-shadow: 0 18px 60px rgba(0,0,0,0.36);
          }

          .aska-catalog-hero-content span {
            display: block;
            margin-top: 28px;
            max-width: 720px;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: clamp(1rem, 1.4vw, 1.28rem);
            line-height: 1.72;
            color: rgba(255,255,255,0.84);
            font-weight: 300;
          }

          .aska-catalog-editorial-section {
            position: relative;
            background:
              radial-gradient(circle at 8% 2%, rgba(255,255,255,0.85), transparent 32%),
              radial-gradient(circle at 88% 12%, rgba(17,17,17,0.08), transparent 34%),
              var(--aska-bg-secondary, #f8f3f0);
            min-height: 60vh;
            padding: clamp(72px, 7vw, 118px) clamp(20px, 3.5vw, 58px) clamp(92px, 9vw, 150px);
            color: #111111;
          }

          .aska-catalog-wrap {
            max-width: 1480px;
            margin: 0 auto;
            min-width: 0;
          }

          .aska-catalog-status {
            color: #111111;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: 1rem;
            font-weight: 500;
          }

          .aska-home-catalog-sections {
            display: grid;
            gap: clamp(92px, 10vw, 154px);
          }

          .aska-editorial-category-block {
            position: relative;
          }

          .aska-editorial-category-block::before {
            content: "";
            display: block;
            width: 82px;
            height: 1px;
            margin-bottom: 28px;
            background: linear-gradient(90deg, rgba(17,17,17,0.58), rgba(17,17,17,0));
          }

          .aska-editorial-category-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            gap: 28px;
            margin-bottom: clamp(24px, 3vw, 46px);
          }

          .aska-editorial-category-header p,
          .aska-category-editorial-intro p {
            margin: 0 0 10px;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            color: rgba(17,17,17,0.48);
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.24em;
            text-transform: uppercase;
          }

          .aska-editorial-category-header h2,
          .aska-category-editorial-intro h2 {
            margin: 0;
            color: #111111;
            font-size: clamp(2.7rem, 6.2vw, 7.6rem);
            line-height: 0.82;
            letter-spacing: -0.075em;
            font-weight: 500 !important;
            text-transform: uppercase;
          }

          .aska-editorial-see-more {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 46px;
            padding: 0 22px;
            border: 1px solid rgba(17,17,17,0.14);
            border-radius: 999px;
            background: rgba(255,255,255,0.72);
            color: #111111;
            text-decoration: none;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: 0.72rem;
            font-weight: 600;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            box-shadow: 0 14px 34px rgba(0,0,0,0.08);
            transition:
              transform .32s ease,
              box-shadow .32s ease,
              border-color .32s ease,
              background .32s ease;
          }

          .aska-editorial-see-more:hover {
            transform: translateY(-2px);
            background: #ffffff;
            border-color: rgba(17,17,17,0.28);
            box-shadow: 0 22px 48px rgba(0,0,0,0.12);
          }

          .aska-editorial-feature-grid {
            display: grid;
            grid-template-columns: minmax(0, 1.58fr) minmax(0, 0.86fr) minmax(0, 0.86fr);
            gap: clamp(20px, 2.4vw, 38px);
            align-items: start;
          }

          .aska-editorial-feature-grid .is-main {
            grid-row: span 2;
          }

          .aska-editorial-feature-grid .is-secondary {
            transform: translateY(34px);
          }

          .aska-editorial-feature-grid .is-secondary:nth-child(3) {
            transform: translateY(0);
          }

          .aska-editorial-feature-grid .is-secondary:nth-child(4),
          .aska-editorial-feature-grid .is-secondary:nth-child(5) {
            transform: translateY(58px);
          }

          .aska-editorial-card {
            display: block;
            position: relative;
            width: 100%;
            text-decoration: none;
            color: #ffffff;
            border-radius: 30px;
            overflow: hidden;
            background: #050505;
            border: 1px solid rgba(17,17,17,0.10);
            box-shadow: 0 28px 80px rgba(0,0,0,0.12);
            transform: translateY(0);
            transition:
              transform .54s cubic-bezier(.22,.61,.36,1),
              box-shadow .54s cubic-bezier(.22,.61,.36,1),
              border-color .54s ease;
          }

          .aska-editorial-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 42px 100px rgba(0,0,0,0.18);
            border-color: rgba(17,17,17,0.24);
          }

          .aska-editorial-card-media {
            position: relative;
            width: 100%;
            height: 430px;
            overflow: hidden;
            background: #050505;
          }

          .aska-editorial-card.is-featured .aska-editorial-card-media {
            height: 720px;
          }

          .aska-editorial-card-media img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transform: scale(1);
            filter: contrast(1.02) saturate(0.96);
            transition:
              transform .86s cubic-bezier(.22,.61,.36,1),
              filter .86s ease;
          }

          .aska-editorial-card:hover .aska-editorial-card-media > img {
            transform: scale(1.055);
            filter: contrast(1.06) saturate(1.02) brightness(1.02);
          }

          .aska-editorial-card-empty {
            height: 100%;
            display: grid;
            place-items: center;
            color: rgba(255,255,255,0.56);
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
          }

          .aska-editorial-card-gradient {
            position: absolute;
            inset: 0;
            background:
              linear-gradient(180deg, rgba(0,0,0,0.00) 38%, rgba(0,0,0,0.35) 66%, rgba(0,0,0,0.76) 100%),
              linear-gradient(90deg, rgba(0,0,0,0.16), transparent 36%, rgba(0,0,0,0.12));
            z-index: 1;
            pointer-events: none;
          }

          .aska-editorial-card-info {
            position: absolute;
            left: clamp(18px, 2vw, 34px);
            right: clamp(18px, 2vw, 34px);
            bottom: clamp(18px, 2vw, 30px);
            z-index: 4;
            color: #ffffff;
          }

          .aska-editorial-category {
            margin: 0 0 9px;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            color: rgba(255,255,255,0.74);
            font-size: 0.62rem;
            font-weight: 700;
            letter-spacing: 0.24em;
            text-transform: uppercase;
          }

          .aska-editorial-card-info h3 {
            margin: 0 0 9px;
            max-width: 92%;
            color: #ffffff;
            font-size: clamp(1rem, 1.45vw, 1.7rem);
            line-height: 1;
            letter-spacing: 0.01em;
            font-weight: 600 !important;
            text-transform: uppercase;
            text-shadow: 0 12px 32px rgba(0,0,0,0.42);
          }

          .aska-editorial-card.is-featured .aska-editorial-card-info h3 {
            font-size: clamp(1.75rem, 3.4vw, 4.2rem);
            letter-spacing: -0.04em;
            line-height: 0.92;
            max-width: 760px;
          }

          .aska-editorial-price {
            margin: 0;
            color: rgba(255,255,255,0.92);
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: 0.92rem;
            font-weight: 600;
            letter-spacing: 0.04em;
          }

          .aska-editorial-description {
            margin: 12px 0 0;
            max-width: 520px;
            color: rgba(255,255,255,0.72);
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: 0.9rem;
            line-height: 1.58;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .aska-editorial-thumbs {
            display: flex;
            gap: 9px;
            margin-top: 18px;
            flex-wrap: wrap;
          }

          .aska-editorial-thumb {
            width: 42px;
            height: 42px;
            border-radius: 999px;
            overflow: hidden;
            padding: 0;
            cursor: pointer;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.18);
            opacity: 0.58;
            transition:
              opacity .24s ease,
              transform .24s ease,
              border-color .24s ease;
          }

          .aska-editorial-card.is-featured .aska-editorial-thumb {
            width: 50px;
            height: 50px;
          }

          .aska-editorial-thumb.active,
          .aska-editorial-thumb:hover {
            opacity: 1;
            transform: translateY(-2px);
            border-color: rgba(255,255,255,0.78);
          }

          .aska-editorial-thumb img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }

          .aska-editorial-arrow {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            z-index: 5;
            width: 40px;
            height: 40px;
            border-radius: 999px;
            border: 1px solid rgba(255,255,255,0.18);
            background: rgba(0,0,0,0.42);
            color: #ffffff;
            font-size: 1.4rem;
            line-height: 1;
            cursor: pointer;
            opacity: 0;
            transition:
              opacity .28s ease,
              background .28s ease,
              transform .28s ease;
          }

          .aska-editorial-card:hover .aska-editorial-arrow {
            opacity: 1;
          }

          .aska-editorial-arrow:hover {
            background: rgba(0,0,0,0.68);
            transform: translateY(-50%) scale(1.05);
          }

          .aska-editorial-arrow-left {
            left: 18px;
          }

          .aska-editorial-arrow-right {
            right: 18px;
          }

          .aska-category-editorial-intro {
            max-width: 980px;
            margin: 0 0 clamp(34px, 5vw, 72px);
          }

          .aska-category-editorial-intro span {
            display: block;
            margin-top: 20px;
            max-width: 620px;
            color: rgba(17,17,17,0.62);
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: clamp(1rem, 1.28vw, 1.22rem);
            line-height: 1.72;
            font-weight: 300;
          }

          .aska-category-products-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: clamp(20px, 2.4vw, 34px);
            align-items: start;
          }

          .aska-category-products-grid > .is-wide {
            grid-column: span 2;
          }

          .aska-category-products-grid > .is-wide .aska-editorial-card-media {
            height: 640px;
          }

          .aska-category-products-grid .aska-editorial-card-media {
            height: 520px;
          }

          @media (max-width: 1100px) {
            .aska-editorial-feature-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .aska-editorial-feature-grid .is-main {
              grid-column: span 2;
            }

            .aska-editorial-feature-grid .is-secondary {
              transform: none !important;
            }

            .aska-editorial-card.is-featured .aska-editorial-card-media {
              height: 620px;
            }

            .aska-category-products-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 768px) {
            .aska-catalog-hero {
              min-height: 52vh;
            }

            .aska-catalog-hero-content {
              padding: 118px 20px 44px;
            }

            .aska-catalog-hero-content h1 {
              font-size: clamp(3.2rem, 18vw, 5.4rem);
              letter-spacing: -0.06em;
            }

            .aska-catalog-editorial-section {
              padding: 56px 16px 86px;
            }

            .aska-editorial-category-header {
              align-items: flex-start;
              flex-direction: column;
              gap: 18px;
            }

            .aska-editorial-category-header h2,
            .aska-category-editorial-intro h2 {
              font-size: clamp(2.8rem, 15vw, 5.2rem);
            }

            .aska-editorial-feature-grid,
            .aska-category-products-grid {
              grid-template-columns: 1fr;
              gap: 22px;
            }

            .aska-editorial-feature-grid .is-main,
            .aska-category-products-grid > .is-wide {
              grid-column: auto;
              grid-row: auto;
            }

            .aska-editorial-feature-grid .is-secondary {
              transform: none !important;
            }

            .aska-editorial-card-media,
            .aska-editorial-card.is-featured .aska-editorial-card-media,
            .aska-category-products-grid .aska-editorial-card-media,
            .aska-category-products-grid > .is-wide .aska-editorial-card-media {
              height: 430px;
            }

            .aska-editorial-card-info h3,
            .aska-editorial-card.is-featured .aska-editorial-card-info h3 {
              font-size: clamp(1.35rem, 8vw, 2.7rem);
            }

            .aska-editorial-arrow {
              opacity: 1;
              width: 36px;
              height: 36px;
            }
          }

          @media (max-width: 480px) {
            .aska-editorial-card {
              border-radius: 24px;
            }

            .aska-editorial-card-media,
            .aska-editorial-card.is-featured .aska-editorial-card-media,
            .aska-category-products-grid .aska-editorial-card-media,
            .aska-category-products-grid > .is-wide .aska-editorial-card-media {
              height: 390px;
            }

            .aska-editorial-thumbs {
              gap: 7px;
            }

            .aska-editorial-thumb,
            .aska-editorial-card.is-featured .aska-editorial-thumb {
              width: 38px;
              height: 38px;
            }
          }
        `}
      </style>
    </>
  );
}

export default Catalog;