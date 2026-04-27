import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function slugifyCategory(name = "") {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+y\s+/g, "-y-")
    .replace(/\s+/g, "-");
}

function CatalogGeneral() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("https://aska-backend-nyx8.onrender.com/api/productos")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error cargando productos:", error));
  }, []);

  const categorias = useMemo(() => {
    return [...new Set(products.map((item) => item.categoria))];
  }, [products]);

  return (
    <>
      <Navbar />

      <section className="catalog-general-page">
        <div className="catalog-general-hero">
          <h1>Catálogo</h1>
        </div>

        {categorias.map((categoria) => {
          const lista = products
            .filter((item) => item.categoria === categoria)
            .slice(0, 6);

          return (
            <section key={categoria} className="catalog-general-block">
              <div className="section-header-row">
                <h2>{categoria}</h2>
                <Link to={`/catalogo/${slugifyCategory(categoria)}`} className="see-more-link">
                  Ver más
                </Link>
              </div>

              <div className="catalog-preview-grid">
                {lista.map((item) => (
                  <Link
                    to={`/producto/${item.id}`}
                    key={item.id}
                    className="catalog-preview-card"
                  >
                    <img src={item.imagen} alt={item.nombre} />
                    <p>{item.nombre}</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </section>
    </>
  );
}

export default CatalogGeneral;