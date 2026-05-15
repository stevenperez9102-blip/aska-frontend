import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { CartContext } from "../context/CartContext";

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

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
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

function Home() {
  const { addToCart } = useContext(CartContext);

  const [config, setConfig] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedImages, setSelectedImages] = useState({});
  const [addedProduct, setAddedProduct] = useState(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState("add");

  const railRefs = useRef({});
  const dragRef = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    key: "",
  });

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
  const mediaMobileUrl = config?.media_mobile_url || "";
  const mediaDesktopUrl = config?.media_desktop_url || "";
  const mediaTipo = config?.media_tipo || "imagen";

  const isMobileViewport =
    typeof window !== "undefined" && window.innerWidth <= 768;

  const responsiveMediaUrl = isMobileViewport
    ? mediaMobileUrl || mediaUrl
    : mediaDesktopUrl || mediaUrl;

  const titulo = config?.titulo || "";
  const subtitulo = config?.subtitulo || "";
  const colorTexto = "#ffffff";
  const fuenteTexto = config?.fuente_texto || "Georgia, serif";

  const overlayLogoUrl = config?.overlay_logo_url || "";
  const overlayLogoWidth = Number(config?.overlay_logo_width || 520);
  const mostrarLogo = Number(config?.mostrar_logo ?? 1) === 1;
  const mostrarTexto = Number(config?.mostrar_texto ?? 1) === 1;

  const logoPosX = Number(config?.logo_pos_x ?? 50);
  const logoPosY = 32;
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

  const featuredProducts = useMemo(() => products.slice(0, 8), [products]);

  const campaignProducts = useMemo(() => {
    const withImages = products.filter((item) => getProductImages(item).length > 0);
    return {
      first: withImages[0] || products[0] || null,
      second: withImages[1] || products[1] || null,
      third: withImages[2] || products[2] || null,
    };
  }, [products]);

  const cartCount = useMemo(() => {
    try {
      const carritoGuardado = JSON.parse(
        localStorage.getItem("carrito") ||
          localStorage.getItem("cart") ||
          localStorage.getItem("cartItems") ||
          "[]"
      );

      if (!Array.isArray(carritoGuardado)) return 0;

      return carritoGuardado.reduce(
        (total, item) =>
          total + Number(item?.cantidad || item?.quantity || item?.qty || 1),
        0
      );
    } catch {
      return 0;
    }
  }, [addedProduct, cartDrawerOpen]);

  const productToCartPayload = (item) => {
    const images = getProductImages(item);
    const selected = selectedImages[item.id] ?? 0;
    const image = images[selected] || images[0] || item.imagen || "";

    return {
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
    };
  };

  const handleAddProduct = (event, item) => {
    event.preventDefault();
    event.stopPropagation();

    if (!item) return;

    const payload = productToCartPayload(item);
    addToCart(payload);
    setAddedProduct(payload);
    setCartDrawerOpen(true);
    setDrawerTab("add");

    window.dispatchEvent(new Event("cart-updated"));
  };

  const selectImage = (event, productId, index) => {
    event.preventDefault();
    event.stopPropagation();

    setSelectedImages((prev) => ({
      ...prev,
      [productId]: index,
    }));
  };

  const scrollRail = (key, direction) => {
    const rail = railRefs.current[key];
    if (!rail) return;

    rail.scrollBy({
      left: direction * Math.min(rail.clientWidth * 0.86, 760),
      behavior: "smooth",
    });
  };

  const handleRailMouseDown = (event, key) => {
    const rail = railRefs.current[key];
    if (!rail) return;

    dragRef.current = {
      isDown: true,
      startX: event.pageX - rail.offsetLeft,
      scrollLeft: rail.scrollLeft,
      key,
    };

    rail.classList.add("is-dragging");
  };

  const handleRailMouseLeave = (key) => {
    const rail = railRefs.current[key];
    if (rail) rail.classList.remove("is-dragging");
    dragRef.current.isDown = false;
  };

  const handleRailMouseUp = (key) => {
    const rail = railRefs.current[key];
    if (rail) rail.classList.remove("is-dragging");
    dragRef.current.isDown = false;
  };

  const handleRailMouseMove = (event, key) => {
    const rail = railRefs.current[key];
    if (!rail || !dragRef.current.isDown || dragRef.current.key !== key) return;

    event.preventDefault();

    const x = event.pageX - rail.offsetLeft;
    const walk = (x - dragRef.current.startX) * 1.15;
    rail.scrollLeft = dragRef.current.scrollLeft - walk;
  };

  const CampaignTile = ({ product, title, label, wide = false }) => {
    const image = product ? getProductImages(product)[0] || product.imagen : "";

    return (
      <Link
        to={product ? `/producto/${product.id}` : "/catalogo"}
        className={`aska-campaign-tile ${wide ? "is-wide" : ""}`}
      >
        {image ? (
          <img src={image} alt={product?.nombre || title} />
        ) : (
          <div className="aska-campaign-placeholder">AŞKA</div>
        )}

        <div className="aska-campaign-gradient" />

        <div className="aska-campaign-content">
          <p>{label}</p>
          <h2>{title}</h2>
          <span>
            <BagIcon />
            Shop the look
          </span>
        </div>
      </Link>
    );
  };

  const ProductRailCard = ({ item }) => {
    const images = getProductImages(item).slice(0, 4);
    const currentIndex = selectedImages[item.id] ?? 0;
    const currentImage = images[currentIndex] || images[0] || item.imagen || "";

    return (
      <article className="aska-rail-card">
        <Link to={`/producto/${item.id}`} className="aska-rail-media">
          {currentImage ? (
            <img src={currentImage} alt={item.nombre} />
          ) : (
            <div className="aska-rail-empty">Sin imagen</div>
          )}

          <button
            type="button"
            className="aska-rail-add"
            onClick={(event) => handleAddProduct(event, item)}
          >
            Add +
          </button>
        </Link>

        <div className="aska-rail-info">
          <Link to={`/producto/${item.id}`}>
            <h3>{item.nombre}</h3>
          </Link>

          <p>{formatPrice(item.precio)}</p>

          {item.categoria && <span>{item.categoria}</span>}

          {images.length > 1 && (
            <div className="aska-rail-swatches">
              {images.map((img, index) => (
                <button
                  key={`${item.id}-${index}`}
                  type="button"
                  className={currentIndex === index ? "active" : ""}
                  onClick={(event) => selectImage(event, item.id, index)}
                  aria-label={`Ver imagen ${index + 1} de ${item.nombre}`}
                >
                  <img src={img} alt="" aria-hidden="true" />
                </button>
              ))}
            </div>
          )}
        </div>
      </article>
    );
  };

  const ProductRail = ({ category, items }) => {
    const key = slugifyCategory(category);

    return (
      <section className="aska-product-rail-section">
        <div className="aska-rail-header">
          <div>
            <p>Picked just for you</p>
            <h2>{category}</h2>
          </div>

          <div className="aska-rail-controls">
            <Link to={`/catalogo/${slugifyCategory(category)}`}>Ver más</Link>

            <button type="button" onClick={() => scrollRail(key, -1)} aria-label="Anterior">
              ‹
            </button>

            <button type="button" onClick={() => scrollRail(key, 1)} aria-label="Siguiente">
              ›
            </button>
          </div>
        </div>

        <div
          ref={(node) => {
            railRefs.current[key] = node;
          }}
          className="aska-product-rail"
          onMouseDown={(event) => handleRailMouseDown(event, key)}
          onMouseLeave={() => handleRailMouseLeave(key)}
          onMouseUp={() => handleRailMouseUp(key)}
          onMouseMove={(event) => handleRailMouseMove(event, key)}
        >
          {items.map((item) => (
            <ProductRailCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    );
  };

  return (
    <>
      <Navbar />

      <section
        className="aska-hero-section aska-lux-hero"
        style={{
          position: "relative",
          minHeight: "100svh",
          overflow: "hidden",
          background: mediaUrl ? "#000" : "#0b0b0b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {responsiveMediaUrl ? (
          mediaTipo === "video" ? (
            <video
              className="aska-hero-media"
              src={responsiveMediaUrl}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              className="aska-hero-media"
              src={responsiveMediaUrl}
              alt={titulo || "AŞKA"}
            />
          )
        ) : null}

        <div className="aska-hero-overlay" />

        {mostrarLogo && overlayLogoUrl && (
          <img
            src={overlayLogoUrl}
            alt="AŞKA"
            className="aska-hero-logo"
            style={{
              left: `${logoPosX}%`,
              top: `${logoPosY}%`,
              width: `${overlayLogoWidth}px`,
            }}
          />
        )}

        {mostrarTexto && (
          <div
            className="aska-hero-copy"
            style={{
              left: `${textoPosX}%`,
              top: `${textoPosY}%`,
              textAlign: textoAlign,
            }}
          >
            <h1
              style={{
                fontSize: `clamp(3.6rem, ${tituloFontSize / 10}vw, ${tituloFontSize}px)`,
                color: colorTexto,
                fontFamily: fuenteTexto,
              }}
            >
              {titulo}
            </h1>

            <p
              style={{
                fontSize: `clamp(1.2rem, ${subtituloFontSize / 14}vw, ${subtituloFontSize}px)`,
                color: colorTexto,
                fontFamily: fuenteTexto,
              }}
            >
              {subtitulo}
            </p>
          </div>
        )}
      </section>

      <section className="aska-editorial-intro">
        <div>
          <p>Joyería artesanal contemporánea</p>
          <h2>Piezas con fuerza, historia y presencia.</h2>
          <span>
            En AŞKA el acero inoxidable se transforma en piezas únicas que cuentan tu historia.
            Cada joya y accesorio es tejido a mano para acompañar una forma de vestir con carácter.
          </span>
        </div>
      </section>

      <section className="aska-campaign-grid">
        <CampaignTile
          product={campaignProducts.first}
          title="Just add presence"
          label="AŞKA campaign"
          wide
        />

        <CampaignTile
          product={campaignProducts.second}
          title="Signs of power"
          label="New statement pieces"
        />

        <CampaignTile
          product={campaignProducts.third}
          title="Body jewelry"
          label="Shop the look"
        />
      </section>

      <section className="aska-home-products-editorial">
        {loadingProducts ? (
          <p className="aska-home-loading">Cargando productos...</p>
        ) : categories.length === 0 ? (
          <p className="aska-home-loading">No hay productos disponibles.</p>
        ) : (
          <>
            {categories.map((category) => {
              const items = products
                .filter(
                  (p) =>
                    String(p.categoria || "").toLowerCase() ===
                    String(category || "").toLowerCase()
                )
                .slice(0, 10);

              if (!items.length) return null;

              return <ProductRail key={category} category={category} items={items} />;
            })}
          </>
        )}
      </section>

      <section className="aska-home-footer-editorial">
        <div>
          <h2>AŞKA</h2>
          <p>
            Taller liderado por mujeres artesanas. Piezas unisex hechas para destacar textura,
            presencia y actitud.
          </p>
        </div>

        <a
          href="https://www.instagram.com/aska_bogota?igsh=ZXYzNnc1OHczOGMy"
          target="_blank"
          rel="noreferrer"
        >
          @aska_bogota
        </a>
      </section>

      <a
        href="https://wa.me/573001234567"
        target="_blank"
        rel="noreferrer"
        className="aska-whatsapp-button"
        aria-label="Escribir a AŞKA por WhatsApp"
      >
        WhatsApp
      </a>

      {cartDrawerOpen && (
        <div className="aska-cart-drawer-backdrop" onClick={() => setCartDrawerOpen(false)}>
          <aside className="aska-cart-drawer" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="aska-cart-drawer-close"
              onClick={() => setCartDrawerOpen(false)}
              aria-label="Cerrar"
            >
              ×
            </button>

            <h2>Added to your cart</h2>

            {addedProduct && (
              <div className="aska-cart-drawer-product">
                {addedProduct.image ? (
                  <img src={addedProduct.image} alt={addedProduct.name} />
                ) : (
                  <div />
                )}

                <div>
                  <h3>{addedProduct.name}</h3>
                  <p>{formatPrice(addedProduct.price)}</p>
                  {addedProduct.category && <span>{addedProduct.category}</span>}
                </div>
              </div>
            )}

            <Link to="/cart" className="aska-cart-drawer-main">
              View all items in cart ({cartCount || 1})
            </Link>

            <div className="aska-cart-drawer-tabs">
              <button
                type="button"
                className={drawerTab === "add" ? "active" : ""}
                onClick={() => setDrawerTab("add")}
              >
                Add on
              </button>
              <button
                type="button"
                className={drawerTab === "style" ? "active" : ""}
                onClick={() => setDrawerTab("style")}
              >
                Style with
              </button>
            </div>

            <div className="aska-cart-drawer-suggestions">
              {featuredProducts.slice(0, 4).map((item) => {
                const image = getProductImages(item)[0] || item.imagen || "";

                return (
                  <div key={item.id} className="aska-cart-drawer-suggestion">
                    <img src={image} alt={item.nombre} />
                    <div>
                      <h3>{item.nombre}</h3>
                      <p>{formatPrice(item.precio)}</p>
                      <button type="button" onClick={(event) => handleAddProduct(event, item)}>
                        Add +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      <style>
        {`
          :root {
            --aska-card-bg: #ffffff;
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

          .aska-hero-section {
            width: 100%;
          }

          .aska-hero-media {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            object-position: center center !important;
            display: block !important;
            background: #000 !important;
            filter: contrast(1.04) saturate(.96);
          }

          .aska-hero-overlay {
            position: absolute;
            inset: 0;
            z-index: 1;
            background:
              linear-gradient(90deg, rgba(0,0,0,0.22), rgba(0,0,0,0.08) 42%, rgba(0,0,0,0.22)),
              linear-gradient(180deg, rgba(0,0,0,0.10), rgba(0,0,0,0.42));
          }

          .aska-hero-logo {
            position: absolute;
            transform: translate(-50%, -50%);
            max-width: min(72vw, 620px);
            object-fit: contain;
            display: block;
            z-index: 4;
          }

          .aska-hero-copy {
            position: absolute;
            transform: translate(-50%, -50%);
            z-index: 5;
            padding: 8px 12px;
            width: min(90vw, 1100px);
          }

          .aska-hero-copy h1 {
            margin: 0;
            line-height: .96;
            letter-spacing: .01em;
          }

          .aska-hero-copy p {
            margin: -4px 0 0;
            line-height: 1.15;
            white-space: nowrap;
          }

          .aska-lux-hero::after {
            content: "";
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 22%;
            background: linear-gradient(180deg, transparent, rgba(0,0,0,0.32));
            pointer-events: none;
            z-index: 2;
          }

          .aska-editorial-intro {
            background: #ffffff;
            color: #111111;
            padding: clamp(82px, 8vw, 136px) clamp(20px, 5vw, 72px);
          }

          .aska-editorial-intro > div {
            max-width: 1180px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: minmax(0, .82fr) minmax(0, 1.18fr);
            gap: clamp(32px, 6vw, 100px);
            align-items: end;
          }

          .aska-editorial-intro p,
          .aska-rail-header p {
            margin: 0;
            color: rgba(17,17,17,.54);
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: .74rem;
            font-weight: 700;
            letter-spacing: .22em;
            text-transform: uppercase;
          }

          .aska-editorial-intro h2 {
            margin: 0;
            font-size: clamp(3.4rem, 8vw, 8rem);
            line-height: .82;
            letter-spacing: -.078em;
            font-weight: 500 !important;
            text-transform: uppercase;
          }

          .aska-editorial-intro span {
            display: block;
            max-width: 720px;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: clamp(1rem, 1.42vw, 1.28rem);
            line-height: 1.82;
            font-weight: 300;
            color: rgba(17,17,17,.68);
          }

          .aska-campaign-grid {
            background: #ffffff;
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 0;
            padding: 0 clamp(18px, 4vw, 52px) clamp(78px, 8vw, 128px);
          }

          .aska-campaign-tile {
            position: relative;
            min-height: 650px;
            overflow: hidden;
            display: flex;
            align-items: flex-end;
            color: #ffffff;
            text-decoration: none;
            background: #080808;
          }

          .aska-campaign-tile.is-wide {
            min-height: 720px;
          }

          .aska-campaign-tile img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            filter: contrast(1.03) saturate(.94);
            transform: scale(1.01);
            transition: transform .9s cubic-bezier(.22,.61,.36,1), filter .9s ease;
          }

          .aska-campaign-tile:hover img {
            transform: scale(1.06);
            filter: contrast(1.08) saturate(1.02);
          }

          .aska-campaign-placeholder {
            position: absolute;
            inset: 0;
            display: grid;
            place-items: center;
            font-size: clamp(5rem, 10vw, 12rem);
            letter-spacing: -.08em;
            color: rgba(255,255,255,.24);
          }

          .aska-campaign-gradient {
            position: absolute;
            inset: 0;
            z-index: 1;
            background: linear-gradient(180deg, transparent 42%, rgba(0,0,0,.62));
          }

          .aska-campaign-content {
            position: relative;
            z-index: 2;
            padding: clamp(24px, 4vw, 50px);
          }

          .aska-campaign-content p {
            margin: 0 0 12px;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: .68rem;
            font-weight: 700;
            letter-spacing: .22em;
            text-transform: uppercase;
            color: rgba(255,255,255,.72);
          }

          .aska-campaign-content h2 {
            margin: 0 0 22px;
            max-width: 640px;
            font-size: clamp(2.6rem, 5.4vw, 6.8rem);
            line-height: .86;
            letter-spacing: -.065em;
            text-transform: uppercase;
            font-weight: 500 !important;
          }

          .aska-campaign-content span {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            min-height: 34px;
            padding: 0 12px;
            background: rgba(255,255,255,.92);
            color: #111111;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: .78rem;
            font-weight: 700;
            letter-spacing: .04em;
            text-transform: uppercase;
          }

          .aska-campaign-content svg {
            width: 15px;
            height: 15px;
          }

          .aska-home-products-editorial {
            background: #ffffff;
            color: #111111;
            padding: clamp(68px, 7vw, 110px) 0 clamp(84px, 8vw, 130px);
          }

          .aska-home-loading {
            max-width: 1320px;
            margin: 0 auto;
            padding: 0 24px;
            color: rgba(17,17,17,.62);
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
          }

          .aska-product-rail-section {
            margin-bottom: clamp(74px, 8vw, 132px);
          }

          .aska-product-rail-section:last-child {
            margin-bottom: 0;
          }

          .aska-rail-header {
            display: flex;
            align-items: end;
            justify-content: space-between;
            gap: 24px;
            padding: 0 clamp(22px, 5vw, 84px) 30px;
          }

          .aska-rail-header h2 {
            margin: 8px 0 0;
            font-size: clamp(2.4rem, 5.2vw, 6.4rem);
            line-height: .82;
            letter-spacing: -.07em;
            font-weight: 500 !important;
            text-transform: uppercase;
          }

          .aska-rail-controls {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .aska-rail-controls a,
          .aska-rail-controls button {
            height: 38px;
            min-width: 38px;
            padding: 0 14px;
            border: 1px solid rgba(17,17,17,.18);
            background: transparent;
            color: #111111;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: .72rem;
            font-weight: 700;
            letter-spacing: .16em;
            text-transform: uppercase;
            cursor: pointer;
          }

          .aska-product-rail {
            display: flex;
            gap: 22px;
            overflow-x: auto;
            overscroll-behavior-x: contain;
            scroll-snap-type: x mandatory;
            padding: 0 clamp(22px, 5vw, 84px) 18px;
            cursor: grab;
            scrollbar-width: thin;
          }

          .aska-product-rail.is-dragging {
            cursor: grabbing;
            user-select: none;
          }

          .aska-rail-card {
            flex: 0 0 clamp(220px, 20vw, 330px);
            scroll-snap-align: start;
            color: #111111;
          }

          .aska-rail-media {
            position: relative;
            display: block;
            aspect-ratio: 4 / 5;
            background: #f3f0ed;
            overflow: hidden;
            color: inherit;
            text-decoration: none;
          }

          .aska-rail-media img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: transform .72s cubic-bezier(.22,.61,.36,1), filter .72s ease;
            filter: contrast(1.01) saturate(.96);
          }

          .aska-rail-card:hover .aska-rail-media img {
            transform: scale(1.045);
            filter: contrast(1.05) saturate(1.02);
          }

          .aska-rail-empty {
            width: 100%;
            height: 100%;
            display: grid;
            place-items: center;
            color: rgba(17,17,17,.42);
          }

          .aska-rail-add {
            position: absolute;
            left: 50%;
            bottom: 22px;
            transform: translateX(-50%);
            border: none;
            background: rgba(255,255,255,.90);
            color: #111111;
            padding: 8px 14px;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: .78rem;
            font-weight: 700;
            letter-spacing: .04em;
            text-transform: uppercase;
            cursor: pointer;
            transition: background .24s ease, transform .24s ease;
          }

          .aska-rail-add:hover {
            background: #ffffff;
            transform: translateX(-50%) translateY(-2px);
          }

          .aska-rail-info {
            padding: 16px 0 0;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
          }

          .aska-rail-info h3 {
            margin: 0 0 8px;
            color: #4f4f4f;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: .92rem;
            font-weight: 600;
            letter-spacing: .02em;
            line-height: 1.24;
            text-transform: uppercase;
          }

          .aska-rail-info p {
            margin: 0 0 12px;
            color: #111111;
            font-size: .95rem;
            font-weight: 500;
          }

          .aska-rail-info span {
            display: block;
            margin-bottom: 12px;
            color: rgba(17,17,17,.54);
            font-size: .82rem;
            line-height: 1.42;
          }

          .aska-rail-swatches {
            display: flex;
            gap: 8px;
          }

          .aska-rail-swatches button {
            width: 16px;
            height: 16px;
            padding: 0;
            border: 1px solid rgba(17,17,17,.14);
            background: transparent;
            cursor: pointer;
            opacity: .62;
          }

          .aska-rail-swatches button.active {
            opacity: 1;
            border-color: rgba(17,17,17,.68);
          }

          .aska-rail-swatches img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }

          .aska-home-footer-editorial {
            background: #c9c0bd;
            color: #111111;
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 32px;
            padding: clamp(42px, 5vw, 74px) clamp(24px, 5vw, 84px);
            border-top: 1px solid rgba(17,17,17,.18);
          }

          .aska-home-footer-editorial h2 {
            margin: 0 0 14px;
            font-size: clamp(2.2rem, 5vw, 5rem);
            line-height: .86;
            letter-spacing: -.07em;
          }

          .aska-home-footer-editorial p {
            margin: 0;
            max-width: 720px;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: 1rem;
            line-height: 1.7;
            color: rgba(17,17,17,.70);
          }

          .aska-home-footer-editorial a {
            align-self: end;
            color: #111111;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: .82rem;
            font-weight: 700;
            letter-spacing: .16em;
            text-transform: uppercase;
            text-decoration: none;
            border-bottom: 1px solid rgba(17,17,17,.42);
            padding-bottom: 5px;
          }

          .aska-whatsapp-button {
            position: fixed;
            right: 26px;
            bottom: 26px;
            z-index: 9998;
            width: 62px;
            height: 62px;
            border-radius: 50%;
            background: #050505;
            color: #ffffff;
            display: grid;
            place-items: center;
            text-decoration: none;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: .62rem;
            font-weight: 700;
            letter-spacing: .08em;
            text-transform: uppercase;
            box-shadow: 0 20px 54px rgba(0,0,0,.28);
          }

          .aska-cart-drawer-backdrop {
            position: fixed;
            inset: 0;
            z-index: 100000;
            background: rgba(0,0,0,.54);
            display: flex;
            justify-content: flex-end;
          }

          .aska-cart-drawer {
            position: relative;
            width: min(760px, 94vw);
            height: 100vh;
            overflow-y: auto;
            background: #ffffff;
            color: #111111;
            padding: clamp(28px, 5vw, 58px);
            box-shadow: -28px 0 80px rgba(0,0,0,.22);
          }

          .aska-cart-drawer-close {
            position: absolute;
            right: 28px;
            top: 24px;
            border: none;
            background: transparent;
            color: #111111;
            font-size: 2.4rem;
            line-height: 1;
            cursor: pointer;
          }

          .aska-cart-drawer h2 {
            margin: 0 0 70px;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: clamp(2rem, 4vw, 3.2rem);
            letter-spacing: .04em;
            text-transform: uppercase;
            font-weight: 600;
          }

          .aska-cart-drawer-product {
            display: grid;
            grid-template-columns: 190px 1fr;
            gap: 28px;
            align-items: start;
            margin-bottom: 46px;
          }

          .aska-cart-drawer-product img,
          .aska-cart-drawer-product > div:first-child {
            width: 190px;
            height: 230px;
            background: #f4f4f4;
            object-fit: cover;
          }

          .aska-cart-drawer-product h3 {
            margin: 0 0 14px;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            color: #5a5a5a;
            font-size: 1.32rem;
            line-height: 1.25;
            text-transform: uppercase;
            font-weight: 500;
          }

          .aska-cart-drawer-product p {
            margin: 0 0 24px;
            font-size: 1.08rem;
          }

          .aska-cart-drawer-product span {
            color: rgba(17,17,17,.62);
            font-size: 1rem;
            line-height: 1.5;
          }

          .aska-cart-drawer-main {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 70px;
            margin-bottom: 54px;
            background: #050505;
            color: #ffffff;
            text-decoration: none;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: .94rem;
            font-weight: 700;
            letter-spacing: .14em;
            text-transform: uppercase;
          }

          .aska-cart-drawer-tabs {
            display: flex;
            gap: 24px;
            border-bottom: 1px solid rgba(17,17,17,.24);
            margin-bottom: 28px;
          }

          .aska-cart-drawer-tabs button {
            border: none;
            background: transparent;
            color: rgba(17,17,17,.62);
            padding: 0 0 16px;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: 1.08rem;
            letter-spacing: .08em;
            text-transform: uppercase;
            cursor: pointer;
            border-bottom: 1px solid transparent;
          }

          .aska-cart-drawer-tabs button.active {
            color: #111111;
            border-bottom-color: #111111;
          }

          .aska-cart-drawer-suggestions {
            display: grid;
            gap: 22px;
          }

          .aska-cart-drawer-suggestion {
            display: grid;
            grid-template-columns: 150px 1fr;
            gap: 24px;
            align-items: start;
          }

          .aska-cart-drawer-suggestion img {
            width: 150px;
            height: 180px;
            object-fit: cover;
            background: #f4f4f4;
          }

          .aska-cart-drawer-suggestion h3 {
            margin: 0 0 8px;
            color: #5a5a5a;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: 1.05rem;
            text-transform: uppercase;
            font-weight: 500;
          }

          .aska-cart-drawer-suggestion p {
            margin: 0 0 18px;
          }

          .aska-cart-drawer-suggestion button {
            border: none;
            background: #f3f0ed;
            color: #111111;
            padding: 8px 14px;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: .84rem;
            text-transform: uppercase;
            cursor: pointer;
          }

          @media (max-width: 920px) {
            .aska-editorial-intro > div,
            .aska-home-footer-editorial {
              grid-template-columns: 1fr;
            }

            .aska-campaign-grid {
              grid-template-columns: 1fr;
            }

            .aska-campaign-tile,
            .aska-campaign-tile.is-wide {
              min-height: 560px;
            }
          }

          @media (max-width: 768px) {
            .aska-lux-hero {
              min-height: 72svh !important;
            }

            .aska-hero-media {
              object-position: center center !important;
            }

            .aska-hero-copy p {
              white-space: normal;
            }

            .aska-editorial-intro {
              padding: 68px 18px;
            }

            .aska-editorial-intro h2 {
              font-size: clamp(3rem, 16vw, 5.4rem);
            }

            .aska-campaign-grid {
              padding: 0 0 58px;
            }

            .aska-campaign-tile,
            .aska-campaign-tile.is-wide {
              min-height: 520px;
            }

            .aska-rail-header {
              align-items: flex-start;
              flex-direction: column;
            }

            .aska-rail-controls {
              width: 100%;
              justify-content: space-between;
            }

            .aska-rail-card {
              flex-basis: 72vw;
            }

            .aska-cart-drawer {
              width: 100vw;
              padding: 34px 22px;
            }

            .aska-cart-drawer h2 {
              margin-bottom: 42px;
            }

            .aska-cart-drawer-product,
            .aska-cart-drawer-suggestion {
              grid-template-columns: 112px 1fr;
              gap: 18px;
            }

            .aska-cart-drawer-product img,
            .aska-cart-drawer-product > div:first-child {
              width: 112px;
              height: 142px;
            }

            .aska-cart-drawer-suggestion img {
              width: 112px;
              height: 142px;
            }

            .aska-whatsapp-button {
              right: 18px;
              bottom: 18px;
              width: 58px;
              height: 58px;
            }
          }
        `}
      </style>
    </>
  );
}

export default Home;
