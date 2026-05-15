import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";


function CartBagIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
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


function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);

  const gallery = useMemo(() => {
    const extra = Array.isArray(product?.imagenes) ? product.imagenes : [];

    const normalizedExtra = extra.map((img) => {
      if (typeof img === "string") return img;
      if (img?.imagen_url) return img.imagen_url;
      if (img?.url) return img.url;
      return null;
    });

    const all = [product?.imagen, ...normalizedExtra].filter(Boolean);
    return [...new Set(all)].slice(0, 6);
  }, [product]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [product?.id, gallery.length]);

  const selectedImage = gallery[selectedIndex] || product?.imagen || "";

  const nextImage = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (gallery.length <= 1) return;
    setSelectedIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevImage = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (gallery.length <= 1) return;
    setSelectedIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const selectImage = (event, index) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedIndex(index);
  };

  const productForCart = {
    id: product.id,
    name: product.nombre,
    nombre: product.nombre,
    price: product.precio,
    precio: product.precio,
    image: selectedImage || product.imagen,
    imagen: selectedImage || product.imagen,
    description: product.descripcion,
    category: product.categoria,
    categoria: product.categoria,
  };

  const handleAddToCart = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    addToCart(productForCart);
  };

  return (
    <>
      <article className="product-card aska-lux-product-card">
        <Link
          to={`/producto/${product.id}`}
          className="aska-lux-product-media-link"
          aria-label={`Ver producto ${product.nombre}`}
        >
          <div className="product-card-image-wrap aska-lux-product-media">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.nombre}
                className="product-card-main-image aska-lux-product-image"
              />
            ) : (
              <div className="aska-lux-product-placeholder">Sin imagen</div>
            )}

            <div className="aska-lux-product-shade" />

            {product?.categoria && (
              <span className="aska-lux-product-category">{product.categoria}</span>
            )}

            <button
              type="button"
              className="product-overlay-cart aska-lux-overlay-cart"
              onClick={handleAddToCart}
              aria-label="Agregar al carrito"
            >
              <CartBagIcon className="aska-cart-svg" />
            </button>

            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  className="gallery-arrow gallery-arrow-left aska-lux-gallery-arrow"
                  onClick={prevImage}
                  aria-label="Imagen anterior"
                >
                  ‹
                </button>

                <button
                  type="button"
                  className="gallery-arrow gallery-arrow-right aska-lux-gallery-arrow"
                  onClick={nextImage}
                  aria-label="Imagen siguiente"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </Link>

        <div className="product-card-body aska-lux-product-body">
          <div className="aska-lux-product-copy">
            <Link to={`/producto/${product.id}`} className="aska-lux-product-title-link">
              <h3>{product.nombre}</h3>
            </Link>

            <p className="product-card-price aska-lux-product-price">
              {formatPrice(product.precio)}
            </p>
          </div>

          {product?.descripcion && (
            <p className="product-card-description aska-lux-product-description">
              {product.descripcion}
            </p>
          )}

          {gallery.length > 1 && (
            <div className="product-card-thumbnails aska-lux-product-thumbnails">
              {gallery.map((img, index) => (
                <button
                  key={`${product.id}-${index}`}
                  type="button"
                  className={`product-thumb-btn aska-lux-product-thumb ${
                    selectedIndex === index ? "active" : ""
                  }`}
                  onClick={(event) => selectImage(event, index)}
                  aria-label={`Ver imagen ${index + 1} de ${product.nombre}`}
                >
                  <img src={img} alt={`${product.nombre} ${index + 1}`} />
                </button>
              ))}
            </div>
          )}

          <div className="product-actions aska-lux-product-actions">
            <Link to={`/producto/${product.id}`} className="product-link-button aska-lux-view-link">
              Ver pieza
            </Link>

            <button
              type="button"
              className="add-to-cart-btn aska-lux-add-button"
              onClick={handleAddToCart}
              aria-label="Agregar al carrito"
            >
              <CartBagIcon className="aska-cart-svg" />
              <span>Agregar</span>
            </button>
          </div>
        </div>
      </article>

      <style>
        {`
          .aska-lux-product-card {
            position: relative;
            display: flex;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
            background: rgba(255,255,255,0.94) !important;
            border: 1px solid rgba(17,17,17,0.08) !important;
            border-radius: 18px !important;
            box-shadow: none !important;
            color: #111111 !important;
            isolation: isolate;
            transition:
              transform 0.55s cubic-bezier(0.2, 0.75, 0.18, 1),
              border-color 0.55s ease,
              box-shadow 0.55s ease,
              background 0.55s ease;
          }

          .aska-lux-product-card::before {
            content: "";
            position: absolute;
            inset: 0;
            border: 1px solid rgba(255,255,255,0.40);
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.55s ease;
            z-index: 4;
          }

          .aska-lux-product-card:hover {
            transform: translateY(-10px);
            border-color: rgba(17,17,17,0.16) !important;
            box-shadow: 0 32px 72px rgba(0,0,0,0.13) !important;
            background: rgba(255,255,255,0.98) !important;
          }

          .aska-lux-product-card:hover::before {
            opacity: 1;
          }

          .aska-lux-product-media-link {
            display: block;
            color: inherit;
            text-decoration: none;
          }

          .aska-lux-product-media {
            position: relative;
            width: 100%;
            aspect-ratio: 0.78;
            min-height: 420px;
            overflow: hidden;
            background:
              radial-gradient(circle at 50% 18%, rgba(255,255,255,0.62), transparent 34%),
              #e8e3dd;
          }

          .aska-lux-product-image {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
            transform: scale(1.01);
            filter: contrast(1.01) saturate(0.96);
            transition:
              transform 0.9s cubic-bezier(0.2, 0.75, 0.18, 1),
              filter 0.9s ease;
          }

          .aska-lux-product-card:hover .aska-lux-product-image {
            transform: scale(1.075);
            filter: contrast(1.07) saturate(1.02) brightness(1.03);
          }

          .aska-lux-product-placeholder {
            width: 100%;
            height: 100%;
            display: grid;
            place-items: center;
            color: rgba(17,17,17,0.42);
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.18em;
            text-transform: uppercase;
          }

          .aska-lux-product-shade {
            position: absolute;
            inset: 0;
            background:
              linear-gradient(180deg, rgba(0,0,0,0.18), transparent 28%),
              linear-gradient(180deg, transparent 58%, rgba(0,0,0,0.32));
            opacity: 0;
            transition: opacity 0.65s ease;
            pointer-events: none;
            z-index: 1;
          }

          .aska-lux-product-card:hover .aska-lux-product-shade {
            opacity: 1;
          }

          .aska-lux-product-category {
            position: absolute;
            left: 18px;
            top: 18px;
            z-index: 3;
            color: rgba(255,255,255,0.88);
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: 0.62rem;
            font-weight: 650;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            text-shadow: 0 10px 30px rgba(0,0,0,0.44);
            opacity: 0;
            transform: translateY(8px);
            transition: opacity 0.38s ease, transform 0.38s ease;
          }

          .aska-lux-product-card:hover .aska-lux-product-category {
            opacity: 1;
            transform: translateY(0);
          }

          .aska-lux-overlay-cart {
            position: absolute;
            top: 16px;
            right: 16px;
            z-index: 5;
            width: 42px;
            height: 42px;
            padding: 0;
            border-radius: 999px !important;
            border: 1px solid rgba(255,255,255,0.38) !important;
            background: rgba(8,8,8,0.36) !important;
            backdrop-filter: blur(14px) saturate(118%);
            -webkit-backdrop-filter: blur(14px) saturate(118%);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: none !important;
            opacity: 0;
            transform: translateY(-6px) scale(0.96);
            transition:
              opacity 0.34s ease,
              transform 0.34s ease,
              background 0.34s ease,
              border-color 0.34s ease;
          }

          .aska-lux-product-card:hover .aska-lux-overlay-cart,
          .aska-lux-overlay-cart:focus-visible {
            opacity: 1;
            transform: translateY(0) scale(1);
          }

          .aska-lux-overlay-cart:hover {
            background: rgba(255,255,255,0.94) !important;
            border-color: rgba(255,255,255,0.72) !important;
            transform: translateY(0) scale(1.04) !important;
          }

          .aska-lux-overlay-cart img {
            width: 20px;
            height: 20px;
            object-fit: contain;
            display: block;
          }

          .aska-lux-gallery-arrow {
            position: absolute;
            top: 50%;
            z-index: 5;
            width: 36px;
            height: 36px;
            border-radius: 999px !important;
            border: 1px solid rgba(255,255,255,0.28) !important;
            background: rgba(8,8,8,0.30) !important;
            color: #ffffff !important;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 1.24rem !important;
            line-height: 1;
            cursor: pointer;
            opacity: 0;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            transition:
              opacity 0.34s ease,
              transform 0.34s ease,
              background 0.34s ease,
              border-color 0.34s ease;
          }

          .aska-lux-gallery-arrow.gallery-arrow-left {
            left: 16px;
            transform: translateY(-50%) translateX(-6px);
          }

          .aska-lux-gallery-arrow.gallery-arrow-right {
            right: 16px;
            transform: translateY(-50%) translateX(6px);
          }

          .aska-lux-product-card:hover .aska-lux-gallery-arrow.gallery-arrow-left,
          .aska-lux-gallery-arrow.gallery-arrow-left:focus-visible {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
          }

          .aska-lux-product-card:hover .aska-lux-gallery-arrow.gallery-arrow-right,
          .aska-lux-gallery-arrow.gallery-arrow-right:focus-visible {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
          }

          .aska-lux-gallery-arrow:hover {
            background: rgba(255,255,255,0.94) !important;
            color: #050505 !important;
            border-color: rgba(255,255,255,0.72) !important;
            box-shadow: none !important;
          }

          .aska-lux-product-body {
            display: grid;
            gap: 16px;
            padding: 22px 20px 20px;
            color: #111111 !important;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif) !important;
          }

          .aska-lux-product-copy {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 18px;
          }

          .aska-lux-product-title-link {
            color: inherit;
            text-decoration: none;
            min-width: 0;
          }

          .aska-lux-product-title-link h3 {
            margin: 0;
            color: #111111 !important;
            font-family: var(--aska-font-family-primary, Georgia, serif) !important;
            font-size: clamp(1.1rem, 1.4vw, 1.5rem);
            font-weight: 520 !important;
            line-height: 1.08;
            letter-spacing: -0.03em !important;
            text-transform: none !important;
          }

          .aska-lux-product-price {
            flex: 0 0 auto;
            margin: 0;
            color: rgba(17,17,17,0.72) !important;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif) !important;
            font-size: 0.76rem;
            font-weight: 650 !important;
            letter-spacing: 0.08em;
            line-height: 1.4;
            white-space: nowrap;
          }

          .aska-lux-product-description {
            margin: -4px 0 0;
            color: rgba(17,17,17,0.55) !important;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif) !important;
            font-size: 0.84rem;
            font-weight: 380;
            line-height: 1.7;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .aska-lux-product-thumbnails {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 0;
            margin: 0;
            flex-wrap: wrap;
          }

          .aska-lux-product-thumb {
            width: 38px;
            height: 38px;
            padding: 0;
            border-radius: 999px !important;
            overflow: hidden;
            cursor: pointer;
            background: #e8e3dd !important;
            border: 1px solid rgba(17,17,17,0.10) !important;
            opacity: 0.56;
            transition:
              opacity 0.24s ease,
              transform 0.24s ease,
              border-color 0.24s ease;
          }

          .aska-lux-product-thumb img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }

          .aska-lux-product-thumb:hover,
          .aska-lux-product-thumb.active {
            opacity: 1;
            transform: translateY(-1px);
            border-color: rgba(17,17,17,0.46) !important;
          }

          .aska-lux-product-actions {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding-top: 4px;
          }

          .aska-lux-view-link {
            color: #111111 !important;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif) !important;
            font-size: 0.68rem;
            font-weight: 700;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            text-decoration: none;
            border-bottom: 1px solid rgba(17,17,17,0.28);
            padding-bottom: 5px;
            transition: border-color 0.28s ease, opacity 0.28s ease;
          }

          .aska-lux-view-link:hover {
            border-color: rgba(17,17,17,0.92);
            opacity: 0.72;
          }

          .aska-lux-add-button {
            min-height: 38px;
            padding: 0 14px !important;
            border-radius: 999px !important;
            border: 1px solid rgba(17,17,17,0.12) !important;
            background: #111111 !important;
            color: #ffffff !important;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
            box-shadow: none !important;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif) !important;
            font-size: 0.64rem;
            font-weight: 700;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            transition:
              background 0.28s ease,
              color 0.28s ease,
              border-color 0.28s ease,
              transform 0.28s ease;
          }

          .aska-lux-add-button img {
            width: 18px;
            height: 18px;
            object-fit: contain;
            display: block;
          }

          .aska-lux-add-button:hover {
            background: #ffffff !important;
            color: #111111 !important;
            border-color: rgba(17,17,17,0.30) !important;
            transform: translateY(-2px) !important;
            box-shadow: none !important;
            opacity: 1 !important;
          }

          

          .aska-cart-svg {
            width: 18px;
            height: 18px;
            display: block;
          }

          .aska-lux-overlay-cart .aska-cart-svg {
            width: 19px;
            height: 19px;
          }

          .aska-lux-product-card::after {
            content: "";
            position: absolute;
            inset: 0;
            background:
              linear-gradient(180deg, transparent 52%, rgba(0,0,0,0.02)),
              radial-gradient(circle at top left, rgba(255,255,255,0.42), transparent 28%);
            pointer-events: none;
            z-index: 1;
          }


          @media (max-width: 768px) {
            .aska-lux-product-media {
              min-height: 330px;
            }

            .aska-lux-overlay-cart,
            .aska-lux-gallery-arrow,
            .aska-lux-product-category {
              opacity: 1;
              transform: none !important;
            }

            .aska-lux-overlay-cart {
              width: 40px;
              height: 40px;
              top: 12px;
              right: 12px;
            }

            .aska-lux-product-body {
              padding: 18px 16px 18px;
            }

            .aska-lux-product-copy {
              display: grid;
              gap: 6px;
            }

            .aska-lux-product-price {
              white-space: normal;
            }

            .aska-lux-product-actions {
              align-items: stretch;
            }

            .aska-lux-add-button span {
              display: none;
            }
          }
        `}
      </style>
    </>
  );
}

export default ProductCard;
