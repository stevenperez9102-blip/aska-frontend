import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";

function deslugifyCategory(slug = "") {
  const map = {
    "collares": "Collares",
    "pulseras": "Pulseras",
    "accesorios-corporales": "Accesorios corporales",
    "aretes-y-anillos": "Aretes y anillos",
  };

  return map[slug] || slug;
}

function CategoryCatalog() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);

  const categoriaNombre = deslugifyCategory(slug);

  useEffect(() => {
    fetch("https://aska-backend-nyx8.onrender.com/api/productos")
      .then((res) => res.json())
      .then(async (data) => {
        const detailedProducts = await Promise.all(
          data.map(async (product) => {
            try {
              const res = await fetch(`https://aska-backend-nyx8.onrender.com/api/productos/${product.id}`);
              if (!res.ok) return product;
              return await res.json();
            } catch {
              return product;
            }
          })
        );

        setProducts(detailedProducts);
      })
      .catch((error) => console.error("Error cargando productos:", error));
  }, []);

  const filtrados = useMemo(() => {
    return products.filter((item) => item.categoria === categoriaNombre);
  }, [products, categoriaNombre]);

  return (
    <>
      <Navbar />

      <section className="category-page">
        <div className="category-hero">
          <h1>{categoriaNombre}</h1>
        </div>

        <div className="category-products-grid">
          {filtrados.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}

export default CategoryCatalog;