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
    price: product.precio,
    image: selectedImage || product.imagen,
    description: product.descripcion,
    category: product.categoria,
  };

  return (
    <div className="product-card">
      <div className="product-card-image-wrap">
        <img
          src={selectedImage}
          alt={product.nombre}
          className="product-card-main-image"
        />

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

      <div className="product-card-body">
        <h3>{product.nombre}</h3>
        <p className="product-card-price">{formatPrice(product.precio)}</p>
        <p className="product-card-description">{product.descripcion}</p>

        <div className="product-actions">
          <Link to={`/producto/${product.id}`} className="product-link-button">
            <button className="product-main-button">Ver producto</button>
          </Link>

          <button
            className="add-to-cart-btn"
            onClick={() => addToCart(productForCart)}
            aria-label="Agregar al carrito"
          >
            <img src={cartLogo} alt="Agregar al carrito" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;