import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import procesoVideo from "../assets/proceso.mp4";
import catalogHero from "../assets/editorial/catalogo-hero.jpg";
import collaresHero from "../assets/editorial/collares-hero.jpg";
import pulserasHero from "../assets/editorial/pulseras-hero.jpg";
import corporalHero from "../assets/editorial/corporal-hero.jpg";
import detallesHero from "../assets/editorial/detalles-hero.jpg";
import editorialShadow from "../assets/editorial/choker-ethereal.jpg";
import editorialPortrait from "../assets/editorial/galata-editorial.png";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";


const ASKA_EDITORIAL_QUOTES = [
  "No diseñamos accesorios. Diseñamos presencia.",
  "Metal convertido en identidad.",
  "Piezas para quienes nunca pasan desapercibidos.",
  "La belleza también puede intimidar.",
];

const ASKA_CATEGORY_COPY = {
  Collares: "Cadenas, texturas y metal para transformar el cuello en declaración.",
  Pulseras: "Piezas que acompañan el gesto, la piel y el movimiento.",
  "Accesorios corporales": "Diseños para cuerpos que convierten presencia en lenguaje.",
  "Aretes y anillos": "Detalles filosos, íntimos y precisos para cerrar el look.",
};

const ASKA_CATEGORY_EDITORIAL = {
  catalogo: {
    image: catalogHero,
    kicker: "ASKA COLLECTION",
    title: "CATÁLOGO",
    subtitle: "Piezas artesanales con actitud, presencia y fuerza visual.",
    quote: "No diseñamos accesorios. Diseñamos presencia.",
  },
  collares: {
    image: collaresHero,
    kicker: "COLLARES ASKA",
    title: "COLLARES",
    subtitle: "Cadenas, texturas y metal para transformar el cuello en declaración.",
    quote: "Metal sobre piel. Presencia antes que permiso.",
  },
  pulseras: {
    image: pulserasHero,
    kicker: "PULSERAS ASKA",
    title: "PULSERAS",
    subtitle: "Piezas que acompañan el gesto, la piel y el movimiento.",
    quote: "El gesto también lleva metal.",
  },
  "accesorios-corporales": {
    image: corporalHero,
    kicker: "BODY PIECES",
    title: "CUERPO",
    subtitle: "Diseños para cuerpos que convierten actitud en lenguaje visual.",
    quote: "La belleza también puede intimidar.",
  },
  "aretes-y-anillos": {
    image: detallesHero,
    kicker: "DETALLES ASKA",
    title: "DETALLES",
    subtitle: "Aretes y anillos filosos, íntimos y precisos para cerrar el look.",
    quote: "Pequeñas piezas. Presencia absoluta.",
  },
};

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


function BagIcon() {
  return (
    <svg className="aska-catalog-bag-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7.2 8.4V7.2C7.2 4.6 9.3 2.5 12 2.5C14.7 2.5 16.8 4.6 16.8 7.2V8.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M5.5 8.4H18.5L19.4 21.5H4.6L5.5 8.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Catalog() {
  const { addToCart } = useContext(CartContext);
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hero, setHero] = useState(null);
  const [selectedImages, setSelectedImages] = useState({});
  const [quickAdded, setQuickAdded] = useState(null);
  const railRefs = useRef({});

  const categoriaActiva = slug ? CATEGORY_MAP[slug] || "" : "";
  const heroSlug = slug || "catalogo";
  const searchTerm = (searchParams.get("buscar") || "").trim();

  const editorialMessage = useMemo(() => {
    const source = categoriaActiva || searchTerm || "catalogo";
    const index = source.length % ASKA_EDITORIAL_QUOTES.length;
    return ASKA_EDITORIAL_QUOTES[index];
  }, [categoriaActiva, searchTerm]);

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
    const normalizedSearch = searchTerm.toLowerCase();

    return products.filter((p) => {
      const matchesCategory = !categoriaActiva
        ? true
        : String(p.categoria || "").toLowerCase() ===
          String(categoriaActiva || "").toLowerCase();

      if (!matchesCategory) return false;

      if (!normalizedSearch) return true;

      const nombre = String(p.nombre || "").toLowerCase();
      const categoria = String(p.categoria || "").toLowerCase();
      const descripcion = String(p.descripcion || "").toLowerCase();

      return (
        nombre.includes(normalizedSearch) ||
        categoria.includes(normalizedSearch) ||
        descripcion.includes(normalizedSearch)
      );
    });
  }, [products, categoriaActiva, searchTerm]);

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
      ? ASKA_CATEGORY_COPY[categoriaActiva] || `Descubre todas las piezas de ${categoriaActiva}.`
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


  const handleQuickAdd = (event, item) => {
    event.preventDefault();
    event.stopPropagation();

    const imgs = getProductImages(item);
    const currentIndex = selectedImages[item.id] ?? 0;
    const image = imgs[currentIndex] || imgs[0] || item.imagen || "";

    addToCart({
      id: item.id,
      name: item.nombre,
      nombre: item.nombre,
      price: Number(item.precio || 0),
      precio: Number(item.precio || 0),
      image,
      imagen: image,
      description: item.descripcion || "",
      category: item.categoria || "",
      categoria: item.categoria || "",
    });

    setQuickAdded(item);
    window.dispatchEvent(new Event("cart-updated"));

    window.setTimeout(() => {
      setQuickAdded(null);
    }, 2600);
  };

  const scrollRail = (key, direction) => {
    const rail = railRefs.current[key];
    if (!rail) return;

    rail.scrollBy({
      left: direction * Math.min(rail.clientWidth * 0.88, 760),
      behavior: "smooth",
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

          <button
            type="button"
            className="aska-editorial-quick-add"
            onClick={(event) => handleQuickAdd(event, item)}
            aria-label={`Agregar ${item.nombre} al carrito`}
          >
            <BagIcon />
            <span>Add +</span>
          </button>

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
      <section className="aska-catalog-maison-hero">
        <div className="aska-catalog-maison-media">
          <img src={catalogHero} alt="AŞKA editorial campaign" />
        </div>

        <div className="aska-catalog-maison-copy">
          <p>Explora la colección</p>
          <h1>{heroTitulo}</h1>
          <span>{heroSubtitulo}</span>

          <div className="aska-catalog-maison-line" />

          <strong>{editorialMessage}</strong>
        </div>
      </section>

      <section className="aska-catalog-manifesto-row">
        <div className="aska-catalog-manifesto-copy">
          <p>AŞKA MANIFESTO</p>
          <h2>
            No es accesorio.
            <br />
            Es identidad.
          </h2>
          <span>
            Diseños oscuros, contemporáneos y artesanales para personas que
            convierten presencia en lenguaje visual.
          </span>
        </div>

        <div className="aska-catalog-manifesto-image">
          <img src={editorialPortrait} alt="AŞKA portrait editorial" />
        </div>
      </section>

      <section className="aska-catalog-editorial-section">
        <div className="aska-catalog-wrap">
          {searchTerm && (
            <div className="aska-catalog-search-banner">
              <div>
                <p>Resultados de búsqueda</p>
                <h2>{searchTerm}</h2>
              </div>

              <button type="button" onClick={() => setSearchParams({})}>
                Limpiar búsqueda
              </button>
            </div>
          )}

          {quickAdded && (
            <div className="aska-catalog-added-toast">
              <BagIcon />
              <div>
                <p>Agregado al carrito</p>
                <span>{quickAdded.nombre}</span>
              </div>
            </div>
          )}

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
                  <h2>{searchTerm ? "Búsqueda" : categoriaActiva}</h2>
                  <span>
                    {searchTerm
                      ? `Piezas encontradas para "${searchTerm}".`
                      : "Una selección de piezas creadas para destacar presencia, textura y carácter."}
                  </span>
                </div>

                <div className="aska-catalog-rail-shell">
                  <div className="aska-catalog-rail-top">
                    <p>Desliza la colección</p>

                    <div>
                      <button
                        type="button"
                        onClick={() => scrollRail(slugifyCategory(categoriaActiva), -1)}
                        aria-label="Anterior"
                      >
                        ‹
                      </button>

                      <button
                        type="button"
                        onClick={() => scrollRail(slugifyCategory(categoriaActiva), 1)}
                        aria-label="Siguiente"
                      >
                        ›
                      </button>
                    </div>
                  </div>

                  <div
                    className="aska-catalog-product-rail"
                    ref={(node) => {
                      railRefs.current[slugifyCategory(categoriaActiva)] = node;
                    }}
                  >
                    {filteredProducts.map((item) => (
                      <div key={item.id} className="aska-catalog-rail-item">
                        {renderCard(item, false)}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )
          ) : searchTerm ? (
            filteredProducts.length === 0 ? (
              <p className="aska-catalog-status">
                No encontramos piezas para esa búsqueda.
              </p>
            ) : (
              <div className="aska-catalog-rail-shell">
                <div className="aska-catalog-rail-top">
                  <p>Resultados en carrusel</p>

                  <div>
                    <button
                      type="button"
                      onClick={() => scrollRail("search-results", -1)}
                      aria-label="Anterior"
                    >
                      ‹
                    </button>

                    <button
                      type="button"
                      onClick={() => scrollRail("search-results", 1)}
                      aria-label="Siguiente"
                    >
                      ›
                    </button>
                  </div>
                </div>

                <div
                  className="aska-catalog-product-rail"
                  ref={(node) => {
                    railRefs.current["search-results"] = node;
                  }}
                >
                  {filteredProducts.map((item) => (
                    <div key={item.id} className="aska-catalog-rail-item">
                      {renderCard(item, false)}
                    </div>
                  ))}
                </div>
              </div>
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

                      <div className="aska-catalog-rail-shell">
                        <div className="aska-catalog-rail-top">
                          <p>Desliza la colección</p>

                          <div>
                            <button
                              type="button"
                              onClick={() => scrollRail(slugifyCategory(category), -1)}
                              aria-label="Anterior"
                            >
                              ‹
                            </button>

                            <button
                              type="button"
                              onClick={() => scrollRail(slugifyCategory(category), 1)}
                              aria-label="Siguiente"
                            >
                              ›
                            </button>
                          </div>
                        </div>

                        <div
                          className="aska-catalog-product-rail"
                          ref={(node) => {
                            railRefs.current[slugifyCategory(category)] = node;
                          }}
                        >
                          {preview.map((item) => (
                            <div key={item.id} className="aska-catalog-rail-item">
                              {renderCard(item, false)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  );
                })
              )}
            </div>
          )}

          {!searchTerm && (
            <section className="aska-catalog-cinematic-quote">
              <img src={editorialShadow} alt="AŞKA shadow editorial" />

              <div>
                <p>EDITORIAL</p>
                <h2>
                  No seguimos tendencias.
                  <br />
                  Creamos tensión visual.
                </h2>
                <span>
                  Una joya AŞKA no completa el look: lo domina.
                </span>
              </div>
            </section>
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
            min-height: 68vh;
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
            gap: clamp(110px, 12vw, 180px);
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
            border-radius: 2px;
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
            border-radius: 22px;
            overflow: hidden;
            background: #050505;
            border: 1px solid rgba(17,17,17,0.10);
            box-shadow: 0 24px 70px rgba(0,0,0,0.10);
            transform: translateY(0);
            transition:
              transform .54s cubic-bezier(.22,.61,.36,1),
              box-shadow .54s cubic-bezier(.22,.61,.36,1),
              border-color .54s ease;
          }

          .aska-editorial-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 38px 92px rgba(0,0,0,0.16);
            border-color: rgba(17,17,17,0.24);
          }

          .aska-editorial-card-media {
            position: relative;
            width: 100%;
            height: 460px;
            overflow: hidden;
            background: #050505;
          }

          .aska-editorial-card.is-featured .aska-editorial-card-media {
            height: 760px;
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
            border-radius: 2px;
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
            border-radius: 2px;
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
            height: 680px;
          }

          .aska-category-products-grid .aska-editorial-card-media {
            height: 540px;
          }



          .aska-editorial-arrow {
            border-radius: 999px !important;
          }

          .aska-editorial-thumb {
            border-radius: 999px !important;
          }

          .aska-editorial-see-more {
            border-radius: 999px !important;
          }

          .aska-editorial-card-info h3 {
            text-wrap: balance;
          }

          .aska-catalog-hero::after {
            content: "";
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 28%;
            background: linear-gradient(180deg, transparent, rgba(0,0,0,0.42));
            z-index: 2;
            pointer-events: none;
          }

          .aska-catalog-hero-content {
            z-index: 3;
          }



          .aska-catalog-search-banner {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            gap: 24px;
            margin-bottom: clamp(34px, 5vw, 72px);
            padding-bottom: 26px;
            border-bottom: 1px solid rgba(17,17,17,0.12);
          }

          .aska-catalog-search-banner p {
            margin: 0 0 10px;
            color: rgba(17,17,17,0.48);
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.24em;
            text-transform: uppercase;
          }

          .aska-catalog-search-banner h2 {
            margin: 0;
            color: #111111;
            font-size: clamp(2.7rem, 6vw, 7rem);
            line-height: 0.82;
            letter-spacing: -0.075em;
            font-weight: 500 !important;
            text-transform: uppercase;
          }

          .aska-catalog-search-banner button {
            min-height: 42px;
            padding: 0 18px;
            border-radius: 999px;
            border: 1px solid rgba(17,17,17,0.14);
            background: rgba(255,255,255,0.72);
            color: #111111;
            cursor: pointer;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
          }

          .aska-editorial-quick-add {
            position: absolute;
            right: 18px;
            top: 18px;
            z-index: 7;
            min-height: 38px;
            padding: 0 13px;
            border: 1px solid rgba(255,255,255,0.38);
            border-radius: 999px;
            background: rgba(255,255,255,0.90);
            color: #111111;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            opacity: 0;
            transform: translateY(-6px);
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            transition:
              opacity .28s ease,
              transform .28s ease,
              background .28s ease;
          }

          .aska-editorial-card:hover .aska-editorial-quick-add,
          .aska-editorial-quick-add:focus-visible {
            opacity: 1;
            transform: translateY(0);
          }

          .aska-editorial-quick-add:hover {
            background: #ffffff;
            transform: translateY(-2px);
          }

          .aska-catalog-bag-icon {
            width: 16px;
            height: 16px;
            display: block;
          }

          .aska-catalog-added-toast {
            position: fixed;
            right: 24px;
            bottom: 24px;
            z-index: 100000;
            min-width: min(340px, calc(100vw - 48px));
            padding: 16px 18px;
            background: rgba(10,10,10,0.92);
            color: #ffffff;
            border: 1px solid rgba(255,255,255,0.12);
            box-shadow: 0 24px 70px rgba(0,0,0,0.28);
            backdrop-filter: blur(20px);
            display: flex;
            align-items: center;
            gap: 14px;
            animation: askaToastReveal .28s ease both;
          }

          .aska-catalog-added-toast p {
            margin: 0 0 3px;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            color: rgba(255,255,255,0.58);
            font-size: 0.62rem;
            font-weight: 700;
            letter-spacing: 0.2em;
            text-transform: uppercase;
          }

          .aska-catalog-added-toast span {
            display: block;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: 0.94rem;
            color: #ffffff;
          }

          @keyframes askaToastReveal {
            from {
              opacity: 0;
              transform: translateY(14px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }


          .aska-catalog-maison-hero {
            min-height: 100svh;
            display: grid;
            grid-template-columns: minmax(0, 1.02fr) minmax(420px, .98fr);
            background: #050505;
            color: #ffffff;
            overflow: hidden;
          }

          .aska-catalog-maison-media {
            position: relative;
            min-height: 100svh;
            overflow: hidden;
            background: #0a0a0a;
          }

          .aska-catalog-maison-media::after {
            content: "";
            position: absolute;
            inset: 0;
            background:
              linear-gradient(90deg, rgba(0,0,0,0.12), rgba(0,0,0,0.54)),
              linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.36));
            pointer-events: none;
          }

          .aska-catalog-maison-media img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center center;
            display: block;
            filter: contrast(1.04) saturate(.88);
            transform: scale(1.02);
            animation: askaCatalogSlowZoom 12s ease-in-out infinite alternate;
          }

          .aska-catalog-maison-copy {
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: clamp(110px, 12vw, 178px) clamp(26px, 5vw, 86px) clamp(70px, 7vw, 112px);
            position: relative;
            z-index: 2;
          }

          .aska-catalog-maison-copy p,
          .aska-catalog-manifesto-copy p,
          .aska-catalog-cinematic-quote p {
            margin: 0 0 18px;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: .68rem;
            font-weight: 700;
            letter-spacing: .28em;
            text-transform: uppercase;
            color: rgba(255,255,255,.54);
          }

          .aska-catalog-maison-copy h1 {
            margin: 0;
            font-size: clamp(4.8rem, 11vw, 11rem);
            line-height: .78;
            letter-spacing: -.088em;
            font-weight: 500 !important;
            text-transform: uppercase;
            color: #ffffff;
            text-wrap: balance;
          }

          .aska-catalog-maison-copy span {
            display: block;
            margin-top: 30px;
            max-width: 620px;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: clamp(1rem, 1.28vw, 1.24rem);
            line-height: 1.78;
            color: rgba(255,255,255,.72);
            font-weight: 300;
          }

          .aska-catalog-maison-line {
            width: 86px;
            height: 1px;
            margin: 38px 0 26px;
            background: linear-gradient(90deg, rgba(255,255,255,.68), transparent);
          }

          .aska-catalog-maison-copy strong {
            max-width: 540px;
            font-size: clamp(1.8rem, 3.4vw, 4rem);
            line-height: .96;
            letter-spacing: -.06em;
            font-weight: 500;
            color: #ffffff;
          }

          .aska-catalog-manifesto-row {
            display: grid;
            grid-template-columns: minmax(0, .98fr) minmax(360px, .72fr);
            gap: clamp(36px, 7vw, 104px);
            align-items: center;
            padding: clamp(92px, 10vw, 170px) clamp(22px, 5vw, 86px);
            background:
              radial-gradient(circle at 10% 6%, rgba(255,255,255,.78), transparent 26%),
              #f3f0ec;
            color: #111111;
          }

          .aska-catalog-manifesto-copy p {
            color: rgba(17,17,17,.48);
          }

          .aska-catalog-manifesto-copy h2 {
            margin: 0;
            max-width: 980px;
            font-size: clamp(3.4rem, 8vw, 8.8rem);
            line-height: .82;
            letter-spacing: -.082em;
            font-weight: 500 !important;
            text-transform: uppercase;
          }

          .aska-catalog-manifesto-copy span {
            display: block;
            margin-top: 28px;
            max-width: 660px;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            color: rgba(17,17,17,.62);
            font-size: clamp(1rem, 1.34vw, 1.22rem);
            line-height: 1.78;
            font-weight: 300;
          }

          .aska-catalog-manifesto-image {
            min-height: 640px;
            overflow: hidden;
            background: #080808;
            border-radius: 34px;
            box-shadow: 0 32px 90px rgba(0,0,0,.18);
          }

          .aska-catalog-manifesto-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center top;
            display: block;
            filter: contrast(1.04) saturate(.88);
            transition: transform .9s cubic-bezier(.22,.61,.36,1), filter .9s ease;
          }

          .aska-catalog-manifesto-image:hover img {
            transform: scale(1.045);
            filter: contrast(1.08) saturate(.98);
          }

          .aska-editorial-category-block:nth-child(even) .aska-editorial-category-header {
            flex-direction: row-reverse;
            text-align: right;
          }

          .aska-editorial-category-block:nth-child(even)::before {
            margin-left: auto;
            background: linear-gradient(270deg, rgba(17,17,17,0.58), rgba(17,17,17,0));
          }

          .aska-editorial-category-block::after {
            content: "Metal · textura · presencia";
            display: block;
            margin-top: clamp(28px, 4vw, 52px);
            color: rgba(17,17,17,.36);
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: .68rem;
            font-weight: 700;
            letter-spacing: .26em;
            text-transform: uppercase;
          }

          .aska-catalog-cinematic-quote {
            position: relative;
            min-height: 86vh;
            margin-top: clamp(100px, 12vw, 180px);
            overflow: hidden;
            border-radius: 34px;
            background: #050505;
            color: #ffffff;
            box-shadow: 0 36px 110px rgba(0,0,0,.18);
          }

          .aska-catalog-cinematic-quote img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center center;
            display: block;
            filter: contrast(1.06) saturate(.84);
          }

          .aska-catalog-cinematic-quote::after {
            content: "";
            position: absolute;
            inset: 0;
            background:
              linear-gradient(90deg, rgba(0,0,0,.86), rgba(0,0,0,.34), rgba(0,0,0,.58)),
              linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.44));
            z-index: 1;
          }

          .aska-catalog-cinematic-quote div {
            position: relative;
            z-index: 2;
            max-width: 960px;
            padding: clamp(68px, 9vw, 138px) clamp(24px, 6vw, 92px);
          }

          .aska-catalog-cinematic-quote h2 {
            margin: 0;
            font-size: clamp(3.2rem, 7vw, 8rem);
            line-height: .84;
            letter-spacing: -.08em;
            font-weight: 500 !important;
            text-transform: uppercase;
          }

          .aska-catalog-cinematic-quote span {
            display: block;
            margin-top: 30px;
            max-width: 540px;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            color: rgba(255,255,255,.72);
            font-size: clamp(1rem, 1.3vw, 1.22rem);
            line-height: 1.72;
          }

          @keyframes askaCatalogSlowZoom {
            from {
              transform: scale(1.02);
            }
            to {
              transform: scale(1.07);
            }
          }



          /* ===== ASKA FIX: catálogo en carrusel, sin cortes ===== */

          .aska-catalog-maison-hero {
            min-height: 82svh !important;
            grid-template-columns: minmax(0, .92fr) minmax(0, 1.08fr) !important;
          }

          .aska-catalog-maison-media {
            min-height: 82svh !important;
          }

          .aska-catalog-maison-copy {
            min-width: 0 !important;
            overflow: hidden !important;
            padding: clamp(112px, 12vw, 168px) clamp(28px, 5vw, 76px) clamp(60px, 7vw, 92px) !important;
          }

          .aska-catalog-maison-copy h1 {
            max-width: 100% !important;
            overflow-wrap: break-word !important;
            word-break: normal !important;
            text-wrap: balance !important;
            font-size: clamp(3.8rem, 7.4vw, 7.8rem) !important;
            line-height: .84 !important;
            letter-spacing: -.072em !important;
          }

          .aska-catalog-maison-copy strong {
            display: block !important;
            max-width: 620px !important;
            overflow-wrap: break-word !important;
            font-size: clamp(1.7rem, 2.75vw, 3.2rem) !important;
            line-height: 1 !important;
          }

          .aska-catalog-manifesto-row {
            padding: clamp(70px, 8vw, 126px) clamp(22px, 5vw, 76px) !important;
          }

          .aska-catalog-manifesto-copy h2 {
            overflow-wrap: break-word !important;
            font-size: clamp(3rem, 6.4vw, 7rem) !important;
          }

          .aska-editorial-feature-grid,
          .aska-category-products-grid {
            display: block !important;
          }

          .aska-editorial-feature-grid .is-main,
          .aska-editorial-feature-grid .is-secondary,
          .aska-category-products-grid > .is-wide {
            transform: none !important;
            grid-column: auto !important;
            grid-row: auto !important;
          }

          .aska-catalog-rail-shell {
            position: relative;
            width: 100%;
            min-width: 0;
          }

          .aska-catalog-rail-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 18px;
            margin-bottom: 18px;
          }

          .aska-catalog-rail-top p {
            margin: 0;
            color: rgba(17,17,17,.42);
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: .66rem;
            font-weight: 700;
            letter-spacing: .22em;
            text-transform: uppercase;
          }

          .aska-catalog-rail-top div {
            display: inline-flex;
            gap: 8px;
          }

          .aska-catalog-rail-top button {
            width: 38px;
            height: 38px;
            border-radius: 999px;
            border: 1px solid rgba(17,17,17,.14);
            background: rgba(255,255,255,.76);
            color: #111111;
            cursor: pointer;
            font-size: 1.24rem;
            line-height: 1;
            box-shadow: 0 12px 28px rgba(0,0,0,.08);
          }

          .aska-catalog-product-rail {
            display: flex !important;
            gap: clamp(18px, 2vw, 28px);
            overflow-x: auto;
            overflow-y: hidden;
            scroll-snap-type: x mandatory;
            overscroll-behavior-x: contain;
            padding: 0 0 18px;
            scrollbar-width: thin;
          }

          .aska-catalog-rail-item {
            flex: 0 0 clamp(260px, 24vw, 380px);
            scroll-snap-align: start;
          }

          .aska-catalog-product-rail .aska-editorial-card {
            transform: none !important;
            box-shadow: 0 24px 70px rgba(0,0,0,.10);
          }

          .aska-catalog-product-rail .aska-editorial-card:hover {
            transform: translateY(-4px) !important;
          }

          .aska-catalog-product-rail .aska-editorial-card-media,
          .aska-catalog-product-rail .aska-editorial-card.is-featured .aska-editorial-card-media,
          .aska-catalog-product-rail .aska-category-products-grid .aska-editorial-card-media,
          .aska-catalog-product-rail .aska-category-products-grid > .is-wide .aska-editorial-card-media {
            height: clamp(390px, 39vw, 540px) !important;
          }

          .aska-catalog-product-rail .aska-editorial-card-info h3,
          .aska-catalog-product-rail .aska-editorial-card.is-featured .aska-editorial-card-info h3 {
            font-size: clamp(1.3rem, 2.1vw, 2.35rem) !important;
            line-height: .98 !important;
          }

          @media (max-width: 768px) {
            .aska-catalog-maison-hero {
              display: block !important;
              min-height: auto !important;
            }

            .aska-catalog-maison-media {
              min-height: 48svh !important;
              height: 48svh !important;
            }

            .aska-catalog-maison-copy {
              padding: 36px 20px 56px !important;
              background: #050505 !important;
            }

            .aska-catalog-maison-copy h1 {
              font-size: clamp(3.05rem, 14vw, 5.15rem) !important;
              line-height: .88 !important;
              letter-spacing: -.058em !important;
            }

            .aska-catalog-maison-copy span {
              margin-top: 20px !important;
              font-size: .98rem !important;
            }

            .aska-catalog-maison-copy strong {
              font-size: clamp(1.72rem, 8vw, 3rem) !important;
              line-height: 1.02 !important;
            }

            .aska-catalog-manifesto-row {
              grid-template-columns: 1fr !important;
              padding: 56px 18px !important;
            }

            .aska-catalog-manifesto-image {
              min-height: 420px !important;
            }

            .aska-catalog-manifesto-copy h2 {
              font-size: clamp(2.7rem, 12vw, 4.8rem) !important;
            }

            .aska-catalog-rail-top {
              align-items: flex-start;
              flex-direction: column;
            }

            .aska-catalog-rail-item {
              flex-basis: 78vw;
            }

            .aska-catalog-product-rail .aska-editorial-card-media,
            .aska-catalog-product-rail .aska-editorial-card.is-featured .aska-editorial-card-media {
              height: 420px !important;
            }

            .aska-catalog-cinematic-quote {
              min-height: 58vh !important;
            }
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
            .aska-catalog-maison-hero,
            .aska-catalog-manifesto-row {
              grid-template-columns: 1fr;
            }

            .aska-catalog-maison-hero {
              min-height: auto;
            }

            .aska-catalog-maison-media {
              min-height: 70svh;
            }

            .aska-catalog-maison-copy {
              padding: 44px 20px 64px;
            }

            .aska-catalog-maison-copy h1 {
              font-size: clamp(3.6rem, 18vw, 6.4rem);
            }

            .aska-catalog-maison-copy strong {
              font-size: clamp(2rem, 10vw, 4rem);
            }

            .aska-catalog-manifesto-row {
              padding: 72px 18px;
            }

            .aska-catalog-manifesto-copy h2,
            .aska-catalog-cinematic-quote h2 {
              font-size: clamp(3rem, 14vw, 5.4rem);
            }

            .aska-catalog-manifesto-image {
              min-height: 520px;
              border-radius: 26px;
            }

            .aska-editorial-category-block:nth-child(even) .aska-editorial-category-header {
              flex-direction: column;
              text-align: left;
            }

            .aska-catalog-cinematic-quote {
              min-height: 72vh;
              border-radius: 26px;
            }

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
              height: 460px;
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

            .aska-editorial-quick-add {
              opacity: 1;
              transform: none;
              right: 14px;
              top: 14px;
            }

            .aska-catalog-search-banner {
              align-items: flex-start;
              flex-direction: column;
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