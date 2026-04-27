import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import ConfirmModal from "../components/ConfirmModal";

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function topLinkButton(active = false) {
  return {
    border: active
      ? "1px solid rgba(217, 200, 239, 0.45)"
      : "1px solid rgba(255,255,255,0.10)",
    background: active
      ? "rgba(217, 200, 239, 0.12)"
      : "rgba(255,255,255,0.04)",
    color: active ? "#f1e6ff" : "#f5f5f5",
    borderRadius: "999px",
    padding: "12px 18px",
    fontWeight: 600,
    cursor: "pointer",
  };
}

const fieldStyle = {
  width: "100%",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "14px",
  padding: "14px 16px",
  fontSize: "1rem",
  outline: "none",
  background: "#111",
  color: "#fff",
};

const categoryOptions = [
  "Collares",
  "Pulseras",
  "Accesorios corporales",
  "Aretes y anillos",
];

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function AdminProductos() {
  const initialForm = {
    id: null,
    nombre: "",
    descripcion: "",
    precio: "",
    imagen: "",
    categoria: "",
    imagenes: [],
    destacado_inicio: false,
  };

  const [productos, setProductos] = useState([]);
  const [papelera, setPapelera] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [mensaje, setMensaje] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [categoriaModo, setCategoriaModo] = useState("lista");
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "Aceptar",
    cancelText: "Cancelar",
    danger: false,
  });

  const esEdicion = useMemo(() => !!form.id, [form.id]);

  const cargarProductos = async () => {
    try {
      const response = await fetch("https://aska-backend-nyx8.onrender.com/api/productos");
      const data = await safeJson(response);

      if (!response.ok) {
        setMensaje(data?.mensaje || "No fue posible cargar los productos.");
        setProductos([]);
        return;
      }

      const detallados = await Promise.all(
        (Array.isArray(data) ? data : []).map(async (item) => {
          try {
            const detailRes = await fetch(
              `https://aska-backend-nyx8.onrender.com/api/productos/${item.id}`
            );
            if (!detailRes.ok) return item;

            const detailData = await safeJson(detailRes);
            return detailData || item;
          } catch {
            return item;
          }
        })
      );

      setProductos(detallados);
    } catch (error) {
      console.error("Error cargando productos:", error);
      setMensaje("No fue posible cargar los productos.");
    }
  };

  const cargarPapelera = async () => {
    try {
      const response = await fetch(
        "https://aska-backend-nyx8.onrender.com/api/admin/productos-papelera"
      );
      const data = await safeJson(response);

      if (!response.ok) {
        return;
      }

      setPapelera(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando papelera:", error);
    }
  };

  useEffect(() => {
    cargarProductos();
    cargarPapelera();
  }, []);

  useEffect(() => {
    if (!mensaje) return;
    const timer = setTimeout(() => setMensaje(""), 2600);
    return () => clearTimeout(timer);
  }, [mensaje]);

  const abrirModal = ({
    title,
    message,
    onConfirm,
    confirmText = "Aceptar",
    cancelText = "Cancelar",
    danger = false,
  }) => {
    setModalConfig({
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
      danger,
    });
    setModalOpen(true);
  };

  const cerrarModal = () => setModalOpen(false);

  const confirmarModal = async () => {
    if (typeof modalConfig.onConfirm === "function") {
      await modalConfig.onConfirm();
    }
    setModalOpen(false);
  };

  const resetForm = () => {
    setForm(initialForm);
    setCategoriaModo("lista");
    setNuevaCategoria("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCategoriaChange = (e) => {
    const value = e.target.value;

    if (value === "__nueva__") {
      setCategoriaModo("nueva");
      setForm((prev) => ({
        ...prev,
        categoria: "__nueva__",
      }));
      return;
    }

    setCategoriaModo("lista");
    setNuevaCategoria("");
    setForm((prev) => ({
      ...prev,
      categoria: value,
    }));
  };

  const subirImagenPrincipal = async (file) => {
    const body = new FormData();
    body.append("archivo", file);

    const response = await fetch("https://aska-backend-nyx8.onrender.com/api/upload", {
      method: "POST",
      body,
    });

    const data = await safeJson(response);

    if (!response.ok) {
      throw new Error(data?.mensaje || "No se pudo subir la imagen principal.");
    }

    return data;
  };

  const subirImagenesMultiples = async (files) => {
    const body = new FormData();

    Array.from(files).forEach((file) => {
      body.append("archivos", file);
    });

    const response = await fetch("https://aska-backend-nyx8.onrender.com/api/upload-multiple", {
      method: "POST",
      body,
    });

    const data = await safeJson(response);

    if (!response.ok) {
      throw new Error(data?.mensaje || "No se pudieron subir las imágenes.");
    }

    return data;
  };

  const handleMainImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSubiendo(true);
      const data = await subirImagenPrincipal(file);

      if (!data?.url) {
        setMensaje("No se pudo subir la imagen principal.");
        return;
      }

      setForm((prev) => ({
        ...prev,
        imagen: data.url,
      }));

      setMensaje("Imagen principal subida correctamente.");
    } catch (error) {
      console.error("Error subiendo imagen principal:", error);
      setMensaje(error.message || "Error subiendo imagen principal.");
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  };

  const handleMultipleImagesUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;

    try {
      setSubiendo(true);
      const data = await subirImagenesMultiples(files);

      if (!data?.urls?.length) {
        setMensaje("No se pudieron subir las imágenes.");
        return;
      }

      setForm((prev) => ({
        ...prev,
        imagenes: [...prev.imagenes, ...data.urls],
      }));

      setMensaje("Imágenes adicionales subidas correctamente.");
    } catch (error) {
      console.error("Error subiendo imágenes múltiples:", error);
      setMensaje(error.message || "Error subiendo imágenes adicionales.");
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  };

  const eliminarImagenExtra = (url) => {
    setForm((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((img) => img !== url),
    }));
  };

  const editarProducto = (producto) => {
    const categoriaProducto = producto.categoria || "";
    const categoriaExiste = categoryOptions.includes(categoriaProducto);

    setForm({
      id: producto.id,
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      precio: producto.precio || "",
      imagen: producto.imagen || "",
      categoria: categoriaExiste ? categoriaProducto : "__nueva__",
      imagenes: Array.isArray(producto.imagenes) ? producto.imagenes : [],
      destacado_inicio: !!producto.destacado_inicio,
    });

    setCategoriaModo(categoriaExiste ? "lista" : "nueva");
    setNuevaCategoria(categoriaExiste ? "" : categoriaProducto);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const guardarProducto = async (e) => {
    e.preventDefault();

    const categoriaFinal =
      categoriaModo === "nueva" || form.categoria === "__nueva__"
        ? nuevaCategoria.trim()
        : form.categoria.trim();

    if (!form.nombre.trim() || !categoriaFinal || form.precio === "") {
      setMensaje("Nombre, precio y categoría son obligatorios.");
      return;
    }

    try {
      setGuardando(true);

      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        precio: Number(form.precio || 0),
        imagen: form.imagen || "",
        categoria: categoriaFinal,
        imagenes: Array.isArray(form.imagenes) ? form.imagenes : [],
        destacado_inicio: !!form.destacado_inicio,
      };

      const url = esEdicion
        ? `https://aska-backend-nyx8.onrender.com/api/productos/${form.id}`
        : "https://aska-backend-nyx8.onrender.com/api/productos";

      const method = esEdicion ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await safeJson(response);

      if (!response.ok) {
        setMensaje(data?.mensaje || "No se pudo guardar el producto.");
        return;
      }

      setMensaje(data?.mensaje || "Producto guardado correctamente.");
      resetForm();
      await cargarProductos();
      await cargarPapelera();
    } catch (error) {
      console.error("Error guardando producto:", error);
      setMensaje("Ocurrió un error guardando el producto.");
    } finally {
      setGuardando(false);
    }
  };

  const enviarAPapelera = async (id) => {
    try {
      const response = await fetch(`https://aska-backend-nyx8.onrender.com/api/productos/${id}`, {
        method: "DELETE",
      });

      const data = await safeJson(response);

      if (!response.ok) {
        setMensaje(data?.mensaje || "No se pudo enviar a papelera.");
        return;
      }

      setMensaje(data?.mensaje || "Producto enviado a papelera.");
      await cargarProductos();
      await cargarPapelera();
    } catch (error) {
      console.error("Error enviando a papelera:", error);
      setMensaje("Error enviando producto a papelera.");
    }
  };

  const restaurarProducto = async (id) => {
    try {
      const response = await fetch(
        `https://aska-backend-nyx8.onrender.com/api/productos/${id}/restaurar`,
        {
          method: "PUT",
        }
      );

      const data = await safeJson(response);

      if (!response.ok) {
        setMensaje(data?.mensaje || "No se pudo restaurar el producto.");
        return;
      }

      setMensaje(data?.mensaje || "Producto restaurado correctamente.");
      await cargarProductos();
      await cargarPapelera();
    } catch (error) {
      console.error("Error restaurando producto:", error);
      setMensaje("Error restaurando producto.");
    }
  };

  const eliminarDefinitivo = async (id) => {
    try {
      const response = await fetch(
        `https://aska-backend-nyx8.onrender.com/api/productos/${id}/definitivo`,
        {
          method: "DELETE",
        }
      );

      const data = await safeJson(response);

      if (!response.ok) {
        setMensaje(data?.mensaje || "No se pudo eliminar definitivamente.");
        return;
      }

      setMensaje(data?.mensaje || "Producto eliminado definitivamente.");
      await cargarProductos();
      await cargarPapelera();
    } catch (error) {
      console.error("Error eliminando definitivamente:", error);
      setMensaje("Error eliminando definitivamente.");
    }
  };

  return (
    <>
      <Navbar />

      <ConfirmModal
        open={modalOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        danger={modalConfig.danger}
        onConfirm={confirmarModal}
        onCancel={cerrarModal}
      />

      {mensaje && (
        <div
          style={{
            position: "fixed",
            top: "92px",
            right: "24px",
            zIndex: 9998,
            background: "rgba(111, 84, 145, 0.96)",
            color: "#fff",
            padding: "14px 18px",
            borderRadius: "16px",
            boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
            fontWeight: 600,
            maxWidth: "360px",
          }}
        >
          {mensaje}
        </div>
      )}

      <section
        style={{
          minHeight: "100vh",
          background: "#050505",
          color: "#fff",
          padding: "38px 24px 60px",
        }}
      >
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
          <div style={{ marginBottom: "26px" }}>
            <p
              style={{
                color: "rgba(255,255,255,0.58)",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: "0.82rem",
                marginBottom: "8px",
              }}
            >
              Administración AŞKA
            </p>

            <h1
              style={{
                fontSize: "clamp(2rem, 5vw, 3.6rem)",
                lineHeight: 1.05,
                margin: 0,
              }}
            >
              Gestión de productos
            </h1>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "28px",
            }}
          >
            <Link to="/admin">
              <button style={topLinkButton(false)}>Panel principal</button>
            </Link>

            <Link to="/admin/pagina">
              <button style={topLinkButton(false)}>Gestión de la página</button>
            </Link>

            <Link to="/admin/productos">
              <button style={topLinkButton(true)}>Gestión de productos</button>
            </Link>

            <Link to="/admin/pedidos">
              <button style={topLinkButton(false)}>Pedidos recibidos</button>
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "22px",
            }}
          >
            <div
              style={{
                background: "#0d0d0d",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "28px",
                padding: "28px",
              }}
            >
              <h2 style={{ marginTop: 0, marginBottom: "18px" }}>
                {esEdicion ? "Editar producto" : "Crear producto"}
              </h2>

              <form
                onSubmit={guardarProducto}
                style={{ display: "grid", gap: "16px" }}
              >
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  style={fieldStyle}
                />

                <textarea
                  name="descripcion"
                  placeholder="Descripción"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows={4}
                  style={{ ...fieldStyle, resize: "vertical" }}
                />

                <input
                  type="number"
                  name="precio"
                  placeholder="Precio"
                  value={form.precio}
                  onChange={handleChange}
                  required
                  style={fieldStyle}
                />

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.9)",
                    }}
                  >
                    Categoría
                  </label>

                  <select
                    name="categoria"
                    value={form.categoria}
                    onChange={handleCategoriaChange}
                    required
                    style={fieldStyle}
                  >
                    <option value="">Selecciona una categoría</option>
                    {categoryOptions.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                    <option value="__nueva__">Agregar nueva categoría</option>
                  </select>

                  {form.categoria === "__nueva__" && (
                    <input
                      type="text"
                      placeholder="Nombre de la nueva categoría"
                      value={nuevaCategoria}
                      onChange={(e) => {
                        setNuevaCategoria(e.target.value);
                        setMensaje("");
                      }}
                      required
                      style={{
                        ...fieldStyle,
                        marginTop: "12px",
                      }}
                    />
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: 600,
                    }}
                  >
                    Imagen principal
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    style={fieldStyle}
                  />

                  {form.imagen && (
                    <div style={{ marginTop: "12px" }}>
                      <img
                        src={form.imagen}
                        alt="Principal"
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "16px",
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: 600,
                    }}
                  >
                    Imágenes adicionales
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleMultipleImagesUpload}
                    style={fieldStyle}
                  />

                  {form.imagenes.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                        marginTop: "14px",
                      }}
                    >
                      {form.imagenes.map((img) => (
                        <div key={img} style={{ position: "relative" }}>
                          <img
                            src={img}
                            alt="Extra"
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "cover",
                              borderRadius: "14px",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => eliminarImagenExtra(img)}
                            style={{
                              position: "absolute",
                              top: "-8px",
                              right: "-8px",
                              border: "none",
                              background: "#7a2f43",
                              color: "#fff",
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              cursor: "pointer",
                              fontWeight: 700,
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontWeight: 600,
                  }}
                >
                  <input
                    type="checkbox"
                    name="destacado_inicio"
                    checked={form.destacado_inicio}
                    onChange={handleChange}
                  />
                  Mostrar en inicio
                </label>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    type="submit"
                    disabled={guardando || subiendo}
                    style={{
                      border: "none",
                      borderRadius: "999px",
                      padding: "14px 22px",
                      background: "#6f5491",
                      color: "#fff",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {guardando
                      ? "Guardando..."
                      : esEdicion
                      ? "Guardar cambios"
                      : "Crear producto"}
                  </button>

                  {esEdicion && (
                    <button
                      type="button"
                      onClick={resetForm}
                      style={{
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "999px",
                        padding: "14px 22px",
                        background: "transparent",
                        color: "#fff",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Cancelar edición
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div
              style={{
                background: "#0d0d0d",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "28px",
                padding: "28px",
              }}
            >
              <h2 style={{ marginTop: 0, marginBottom: "18px" }}>
                Productos activos
              </h2>

              <div style={{ display: "grid", gap: "16px" }}>
                {productos.length === 0 ? (
                  <p style={{ color: "rgba(255,255,255,0.64)" }}>
                    No hay productos activos.
                  </p>
                ) : (
                  productos.map((producto) => (
                    <article
                      key={producto.id}
                      style={{
                        background: "#111",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "22px",
                        padding: "18px",
                        display: "grid",
                        gridTemplateColumns: "110px 1fr",
                        gap: "16px",
                      }}
                    >
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        style={{
                          width: "110px",
                          height: "110px",
                          objectFit: "cover",
                          borderRadius: "16px",
                          background: "#050505",
                        }}
                      />

                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "10px",
                            alignItems: "start",
                            flexWrap: "wrap",
                          }}
                        >
                          <div>
                            <h3 style={{ margin: 0 }}>{producto.nombre}</h3>
                            <p
                              style={{
                                marginTop: "6px",
                                marginBottom: "10px",
                                color: "rgba(255,255,255,0.62)",
                              }}
                            >
                              {producto.categoria}
                            </p>
                          </div>

                          <strong>{formatPrice(producto.precio)}</strong>
                        </div>

                        <p
                          style={{
                            color: "rgba(255,255,255,0.72)",
                            lineHeight: 1.6,
                          }}
                        >
                          {producto.descripcion}
                        </p>

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                            marginTop: "12px",
                          }}
                        >
                          <button
                            onClick={() => editarProducto(producto)}
                            style={productAction("#a9c7ff", "rgba(96,130,193,0.18)")}
                          >
                            Editar
                          </button>

                          <button
                            onClick={() =>
                              abrirModal({
                                title: "¿Estás segura de enviar este producto a la papelera?",
                                message: `El producto "${producto.nombre}" dejará de mostrarse en la tienda.`,
                                confirmText: "Sí, enviar",
                                onConfirm: () => enviarAPapelera(producto.id),
                              })
                            }
                            style={productAction("#e8c97a", "rgba(197,167,90,0.18)")}
                          >
                            Enviar a papelera
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>

            <div
              style={{
                background: "#0d0d0d",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "28px",
                padding: "28px",
              }}
            >
              <h2 style={{ marginTop: 0, marginBottom: "18px" }}>
                Papelera de productos
              </h2>

              <div style={{ display: "grid", gap: "16px" }}>
                {papelera.length === 0 ? (
                  <p style={{ color: "rgba(255,255,255,0.64)" }}>
                    No hay productos en papelera.
                  </p>
                ) : (
                  papelera.map((producto) => (
                    <article
                      key={producto.id}
                      style={{
                        background: "#111",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "22px",
                        padding: "18px",
                        display: "grid",
                        gridTemplateColumns: "110px 1fr",
                        gap: "16px",
                      }}
                    >
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        style={{
                          width: "110px",
                          height: "110px",
                          objectFit: "cover",
                          borderRadius: "16px",
                          background: "#050505",
                        }}
                      />

                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "10px",
                            alignItems: "start",
                            flexWrap: "wrap",
                          }}
                        >
                          <div>
                            <h3 style={{ margin: 0 }}>{producto.nombre}</h3>
                            <p
                              style={{
                                marginTop: "6px",
                                marginBottom: "10px",
                                color: "rgba(255,255,255,0.62)",
                              }}
                            >
                              {producto.categoria}
                            </p>
                          </div>

                          <strong>{formatPrice(producto.precio)}</strong>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                            marginTop: "12px",
                          }}
                        >
                          <button
                            onClick={() =>
                              abrirModal({
                                title: "¿Restaurar producto?",
                                message: `El producto "${producto.nombre}" volverá a mostrarse en la tienda.`,
                                confirmText: "Sí, restaurar",
                                onConfirm: () => restaurarProducto(producto.id),
                              })
                            }
                            style={productAction("#9ce0ad", "rgba(93,170,117,0.18)")}
                          >
                            Restaurar
                          </button>

                          <button
                            onClick={() =>
                              abrirModal({
                                title: "¿Eliminar definitivamente este producto?",
                                message: `Esta acción no se puede deshacer para "${producto.nombre}".`,
                                confirmText: "Sí, eliminar",
                                danger: true,
                                onConfirm: () => eliminarDefinitivo(producto.id),
                              })
                            }
                            style={productAction("#ffb8c4", "rgba(122,47,67,0.34)")}
                          >
                            Eliminar definitivo
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function productAction(color, background) {
  return {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "999px",
    padding: "10px 16px",
    background,
    color,
    fontWeight: 700,
    cursor: "pointer",
  };
}

export default AdminProductos;