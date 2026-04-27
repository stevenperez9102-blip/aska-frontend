import ProductCard from "./ProductCard";

function CategorySection({ title, products }) {
  return (
    <section className="category-section">
      <h2>{title}</h2>

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default CategorySection;