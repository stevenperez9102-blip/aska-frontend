import { useContext, useMemo, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import cartLogo from "../assets/casado.png";
import { Link } from "react-router-dom";

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

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (gallery.length <= 1) return;
    setSelectedIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (gallery.length <= 1) return;
    setSelectedIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const selectImage = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleAddToCart = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    addToCart(productForCart);
  };

  return (
    <>
      <div className="product-card">
      <div className="product-card-image-wrap">
        <img
          src={selectedImage}
          alt={product.nombre}
          className="product-card-main-image"
        />

        <button
          className="product-overlay-cart"
          onClick={handleAddToCart}
          aria-label="Agregar al carrito"
        >
          <img src={cartLogo} alt="Agregar" />
        </button>

        {gallery.length > 1 && (
          <>
            <button
              type="button"
              className="gallery-arrow gallery-arrow-left"
              onClick={prevImage}
              aria-label="Imagen anterior"
            >
              ‹
            </button>

            <button
              type="button"
              className="gallery-arrow gallery-arrow-right"
              onClick={nextImage}
              aria-label="Imagen siguiente"
            >
              ›
            </button>
          </>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="product-card-thumbnails">
          {gallery.map((img, index) => (
            <button
              key={`${product.id}-${index}`}
              type="button"
              className={`product-thumb-btn ${
                selectedIndex === index ? "active" : ""
              }`}
              onClick={(e) => selectImage(e, index)}
              aria-label={`Ver imagen ${index + 1} de ${product.nombre}`}
            >
              <img src={img} alt={`${product.nombre} ${index + 1}`} />
            </button>
          ))}
        </div>
      )}

      <div
        className="product-card-body"
        style={{
          fontFamily: "var(--aska-font-family-secondary, inherit)",
          color: "var(--aska-text-primary, inherit)"
        }}
      >
        <h3>{product.nombre}</h3>
        <p className="product-card-price">{formatPrice(product.precio)}</p>
        <p className="product-card-description">{product.descripcion}</p>

        <div className="product-actions">
          <Link to={`/producto/${product.id}`} className="product-link-button">
            <button className="product-main-button" style={{ fontFamily: "var(--aska-font-family-secondary, inherit)" }}>Ver producto</button>
          </Link>

          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            aria-label="Agregar al carrito"
          >
            <img src={cartLogo} alt="Agregar al carrito" />
          </button>
        </div>
      </div>
      </div>

      <style>
        {`
          .product-card {
            background: var(--aska-card-bg, rgba(255,255,255,0.02));
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 26px;
            overflow: hidden;
            transition:
              transform .28s ease,
              box-shadow .28s ease,
              border-color .28s ease;
            position: relative;
          }

          .product-card-image-wrap {
            overflow:hidden;
            position: relative;
          }

          .product-overlay-cart {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            border: none;
            background: color-mix(in srgb, var(--aska-card-bg, #ffffff) 88%, transparent);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
            transition: transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
            z-index: 2;
          }

          .product-overlay-cart img {
            width: 20px;
            height: 20px;
          }

          .product-overlay-cart:hover {
            transform: scale(1.12);
            background: var(--aska-card-bg, #ffffff);
            box-shadow: 0 10px 26px rgba(0, 0, 0, 0.24);
          }

          .add-to-cart-btn {
            background: var(--aska-accent-primary, #111);
            color: var(--aska-text-secondary, #fff);
            border-radius: 999px;
            box-shadow: 0 10px 28px rgba(0,0,0,.18);
            transition: transform 0.22s ease, opacity 0.22s ease;
          }

          .add-to-cart-btn:hover {
            transform: translateY(-2px) scale(1.04);
          }


          .product-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 30px 70px rgba(0,0,0,.20);
            border-color: rgba(255,255,255,.12);
          }

          .product-card-main-image {
            transition: transform .45s ease;
          }

          .product-card:hover .product-card-main-image {
            transform: scale(1.04);
          }

          .product-main-button,
          .add-to-cart-btn {
            transition:
              transform .22s ease,
              opacity .22s ease,
              box-shadow .22s ease;
          }

          .product-main-button:hover,
          .add-to-cart-btn:hover {
            transform: translateY(-2px);
            opacity: .97;
          }

          .product-card h3{
            font-family: var(--aska-font-family-primary, inherit);
          }

          .product-card-price{
            color: var(--aska-accent-primary, #6f5491);
            font-weight: 800;
          }


          @media (max-width: 768px) {
            .product-overlay-cart {
              width: 40px;
              height: 40px;
              top: 8px;
              right: 8px;
            }
          }
        `}
      </style>
    </>
  );
}


export default ProductCard;