import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

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

const inputStyle = {
  width: "100%",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "14px",
  padding: "14px 16px",
  fontSize: "1rem",
  outline: "none",
  background: "#111",
  color: "#fff",
};

const heroOptions = [
  { value: "home", label: "Inicio / portada principal" },
  { value: "catalogo", label: "Catálogo general" },
  { value: "collares", label: "Catálogo / Collares" },
  { value: "pulseras", label: "Catálogo / Pulseras" },
  { value: "accesorios-corporales", label: "Catálogo / Accesorios corporales" },
  { value: "aretes-y-anillos", label: "Catálogo / Aretes y anillos" },
  { value: "nosotras", label: "Página Nosotras" },
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function safeNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function AdminPagina() {
  const [heroTarget, setHeroTarget] = useState("home");
  const [formData, setFormData] = useState({
    media_url: "",
    media_tipo: "imagen",
    titulo: "",
    subtitulo: "",
    descripcion: "",
    color_texto: "#ffffff",
    overlay_opacidad: 0.2,
    fuente_texto: "Georgia, serif",
    overlay_logo_url: "",
    overlay_logo_width: 420,
    mostrar_logo: false,
    mostrar_texto: true,
    logo_pos_x: 50,
    logo_pos_y: 38,
    texto_pos_x: 50,
    texto_pos_y: 68,
    titulo_font_size: 62,
    subtitulo_font_size: 24,
    texto_align: "center",
  });

  const [mensaje, setMensaje] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const previewRef = useRef(null);
  const dragTypeRef = useRef(null);

const [metodosPago, setMetodosPago] = useState([]);
const [nuevoMetodo, setNuevoMetodo] = useState({
  nombre: "",
  tipo: "",
  titular: "",
  numero: "",
  descripcion: "",
  qr_url: "",
});


  const defaultHome = {
    media_url: "",
    media_tipo: "imagen",
    titulo: "AŞKA",
    subtitulo: "JOYERÍA ATEMPORAL",
    descripcion: "",
    color_texto: "#ffffff",
    overlay_opacidad: 0.2,
    fuente_texto: "Georgia, serif",
    overlay_logo_url: "",
    overlay_logo_width: 520,
    mostrar_logo: true,
    mostrar_texto: true,
    logo_pos_x: 50,
    logo_pos_y: 42,
    texto_pos_x: 50,
    texto_pos_y: 72,
    titulo_font_size: 74,
    subtitulo_font_size: 28,
    texto_align: "center",
  };

  const defaultCatalog = {
    media_url: "",
    media_tipo: "imagen",
    titulo: "Catálogo",
    subtitulo:
      "Descubre algunas piezas por categoría y entra al catálogo completo de cada sección.",
    descripcion: "",
    color_texto: "#ffffff",
    overlay_opacidad: 0.2,
    fuente_texto: "Georgia, serif",
    overlay_logo_url: "",
    overlay_logo_width: 520,
    mostrar_logo: false,
    mostrar_texto: true,
    logo_pos_x: 50,
    logo_pos_y: 42,
    texto_pos_x: 50,
    texto_pos_y: 72,
    titulo_font_size: 74,
    subtitulo_font_size: 28,
    texto_align: "left",
  };

  const defaultNosotras = {
    media_url: "",
    media_tipo: "imagen",
    titulo: "Nosotras",
    subtitulo: "Conoce la esencia detrás de AŞKA.",
    descripcion:
      "AŞKA nace desde la intención de crear piezas con identidad, estética y carácter. Cada detalle busca transmitir una joyería atemporal, elegante y poderosa.",
    color_texto: "#ffffff",
    overlay_opacidad: 0.2,
    fuente_texto: "Georgia, serif",
    overlay_logo_url: "",
    overlay_logo_width: 420,
    mostrar_logo: false,
    mostrar_texto: true,
    logo_pos_x: 50,
    logo_pos_y: 38,
    texto_pos_x: 50,
    texto_pos_y: 68,
    titulo_font_size: 62,
    subtitulo_font_size: 24,
    texto_align: "center",
  };

  const cargarConfigHome = async () => {
    const response = await fetch("https://aska-backend-nyx8.onrender.com/api/home-config");
    const data = await response.json();

    if (data) {
      setFormData({
        media_url: data.media_url || "",
        media_tipo: data.media_tipo || "imagen",
        titulo: data.titulo ?? defaultHome.titulo,
        subtitulo: data.subtitulo ?? defaultHome.subtitulo,
        descripcion: "",
        color_texto: data.color_texto || "#ffffff",
        overlay_opacidad: safeNumber(data.overlay_opacidad, 0.2),
        fuente_texto: data.fuente_texto || "Georgia, serif",
        overlay_logo_url: data.overlay_logo_url || "",
        overlay_logo_width: safeNumber(data.overlay_logo_width, 520),
        mostrar_logo: Number(data.mostrar_logo ?? 1) === 1,
        mostrar_texto: Number(data.mostrar_texto ?? 1) === 1,
        logo_pos_x: safeNumber(data.logo_pos_x, 50),
        logo_pos_y: safeNumber(data.logo_pos_y, 42),
        texto_pos_x: safeNumber(data.texto_pos_x, 50),
        texto_pos_y: safeNumber(data.texto_pos_y, 72),
        titulo_font_size: safeNumber(data.titulo_font_size, 74),
        subtitulo_font_size: safeNumber(data.subtitulo_font_size, 28),
        texto_align: data.texto_align || "center",
      });
    } else {
      setFormData(defaultHome);
    }
  };

  const cargarConfigCatalogo = async (slug) => {
    const response = await fetch(`https://aska-backend-nyx8.onrender.com/api/catalogo-hero/${slug}`);
    const data = await response.json();

    setFormData({
      media_url: data?.media_url || "",
      media_tipo: data?.media_tipo || "imagen",
      titulo: data?.titulo ?? defaultCatalog.titulo,
      subtitulo: data?.subtitulo ?? defaultCatalog.subtitulo,
      descripcion: "",
      color_texto: data?.color_texto || "#ffffff",
      overlay_opacidad: safeNumber(data?.overlay_opacidad, 0.2),
      fuente_texto: data?.fuente_texto || "Georgia, serif",
      overlay_logo_url: "",
      overlay_logo_width: 520,
      mostrar_logo: false,
      mostrar_texto: true,
      logo_pos_x: 50,
      logo_pos_y: 42,
      texto_pos_x: 50,
      texto_pos_y: 72,
      titulo_font_size: 74,
      subtitulo_font_size: 28,
      texto_align: "left",
    });
  };

  const cargarConfigNosotras = async () => {
    const response = await fetch("https://aska-backend-nyx8.onrender.com/api/nosotras-config");
    const data = await response.json();

    setFormData({
      media_url: data?.media_url || "",
      media_tipo: data?.media_tipo || "imagen",
      titulo: data?.titulo ?? defaultNosotras.titulo,
      subtitulo: data?.subtitulo ?? defaultNosotras.subtitulo,
      descripcion: data?.descripcion ?? defaultNosotras.descripcion,
      color_texto: data?.color_texto || "#ffffff",
      overlay_opacidad: safeNumber(data?.overlay_opacidad, 0.2),
      fuente_texto: data?.fuente_texto || "Georgia, serif",
      overlay_logo_url: data?.overlay_logo_url || "",
      overlay_logo_width: safeNumber(data?.overlay_logo_width, 420),
      mostrar_logo: Number(data?.mostrar_logo ?? 0) === 1,
      mostrar_texto: Number(data?.mostrar_texto ?? 1) === 1,
      logo_pos_x: safeNumber(data?.logo_pos_x, 50),
      logo_pos_y: safeNumber(data?.logo_pos_y, 38),
      texto_pos_x: safeNumber(data?.texto_pos_x, 50),
      texto_pos_y: safeNumber(data?.texto_pos_y, 68),
      titulo_font_size: safeNumber(data?.titulo_font_size, 62),
      subtitulo_font_size: safeNumber(data?.subtitulo_font_size, 24),
      texto_align: data?.texto_align || "center",
    });
  };

  useEffect(() => {


    
    const cargar = async () => {
      try {
        if (heroTarget === "home") {
          await cargarConfigHome();
        } else if (heroTarget === "nosotras") {
          await cargarConfigNosotras();
        } else {
          await cargarConfigCatalogo(heroTarget);
        }
      } catch (error) {
        console.error("Error cargando configuración:", error);
        setMensaje("No se pudo cargar la configuración de esta sección.");
      }
    };

const cargarMetodos = async () => {
    try {
      const res = await fetch("https://aska-backend-nyx8.onrender.com/api/admin/metodos-pago");
      const data = await res.json();
      setMetodosPago(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

    cargar();
    cargarMetodos();
  }, [heroTarget]);

  useEffect(() => {
    if (!mensaje) return;
    const timer = setTimeout(() => setMensaje(""), 2600);
    return () => clearTimeout(timer);
  }, [mensaje]);

  useEffect(() => {
    const handleMove = (event) => {
      if (!dragTypeRef.current || !previewRef.current) return;

      const rect = previewRef.current.getBoundingClientRect();
      const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
      const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);

      if (dragTypeRef.current === "logo") {
        setFormData((prev) => ({
          ...prev,
          logo_pos_x: Number(x.toFixed(2)),
          logo_pos_y: Number(y.toFixed(2)),
        }));
      }

      if (dragTypeRef.current === "texto") {
        setFormData((prev) => ({
          ...prev,
          texto_pos_x: Number(x.toFixed(2)),
          texto_pos_y: Number(y.toFixed(2)),
        }));
      }
    };

    const stopDrag = () => {
      dragTypeRef.current = null;
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", stopDrag);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : [
              "overlay_opacidad",
              "overlay_logo_width",
              "logo_pos_x",
              "logo_pos_y",
              "texto_pos_x",
              "texto_pos_y",
              "titulo_font_size",
              "subtitulo_font_size",
            ].includes(name)
          ? Number(value)
          : value,
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSubiendo(true);
      const body = new FormData();
      body.append("archivo", file);

      const response = await fetch("https://aska-backend-nyx8.onrender.com/api/upload", {
        method: "POST",
        body,
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        setMensaje(data?.mensaje || "No se pudo subir el archivo.");
        return;
      }

      const isVideo = file.type.startsWith("video");

      setFormData((prev) => ({
        ...prev,
        media_url: data.url,
        media_tipo: isVideo ? "video" : "imagen",
      }));

      setMensaje("Archivo subido correctamente.");
    } catch (error) {
      console.error("Error subiendo archivo:", error);
      setMensaje("Ocurrió un error al subir el archivo.");
    } finally {
      setSubiendo(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSubiendo(true);
      const body = new FormData();
      body.append("archivo", file);

      const response = await fetch("https://aska-backend-nyx8.onrender.com/api/upload", {
        method: "POST",
        body,
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        setMensaje(data?.mensaje || "No se pudo subir el logo.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        overlay_logo_url: data.url,
        mostrar_logo: true,
      }));

      setMensaje("Logo superpuesto subido correctamente.");
    } catch (error) {
      console.error("Error subiendo logo:", error);
      setMensaje("Ocurrió un error al subir el logo.");
    } finally {
      setSubiendo(false);
    }
  };

  const clearBackgroundMedia = () => {
    setFormData((prev) => ({
      ...prev,
      media_url: "",
      media_tipo: "imagen",
    }));
  };

  const clearOverlayLogo = () => {
    setFormData((prev) => ({
      ...prev,
      overlay_logo_url: "",
      mostrar_logo: false,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setGuardando(true);

      let url;

      if (heroTarget === "home") {
        url = "https://aska-backend-nyx8.onrender.com/api/home-config";
      } else if (heroTarget === "nosotras") {
        url = "https://aska-backend-nyx8.onrender.com/api/nosotras-config";
      } else {
        url = `https://aska-backend-nyx8.onrender.com/api/catalogo-hero/${heroTarget}`;
      }

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        setMensaje(data?.mensaje || "Error guardando configuración");
        return;
      }

      setMensaje("✅ Guardado correctamente");
    } catch (error) {
      console.error("Error guardando configuración:", error);
      setMensaje("❌ Error de conexión con el servidor");
    } finally {
      setGuardando(false);
    }
  };

  const previewTitle =
    heroTarget === "home"
      ? "Vista previa del Inicio"
      : heroTarget === "catalogo"
      ? "Vista previa del Catálogo"
      : heroTarget === "nosotras"
      ? "Vista previa de Nosotras"
      : `Vista previa de ${heroTarget.replaceAll("-", " ")}`;

  const previewBlockTitle =
    heroTarget === "nosotras"
      ? "Contenido Nosotras"
      : heroTarget === "catalogo"
      ? "Catálogo general"
      : heroTarget === "home"
      ? "Portada principal"
      : `Sección ${heroTarget.replaceAll("-", " ")}`;

  const shouldRenderTitle = Boolean(String(formData.titulo || "").trim());
  const shouldRenderSubtitle = Boolean(String(formData.subtitulo || "").trim());
  const shouldRenderDescription =
    heroTarget === "nosotras" &&
    Boolean(String(formData.descripcion || "").trim());

  const shouldRenderTextBlock =
    formData.mostrar_texto &&
    (shouldRenderTitle || shouldRenderSubtitle || shouldRenderDescription);

  return (
    <>
      <Navbar />

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
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
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
              Gestión de la página
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
           <Link to="/admin/pagina">
  <button style={topLinkButton(false)}>Panel principal</button>
</Link>

            <Link to="/admin/pagina">
              <button style={topLinkButton(true)}>Gestión de la página</button>
            </Link>

            <Link to="/admin/productos">
              <button style={topLinkButton(false)}>Gestión de productos</button>
            </Link>

            <Link to="/admin/pedidos">
              <button style={topLinkButton(false)}>Pedidos recibidos</button>
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 0.9fr)",
              gap: "24px",
              alignItems: "start",
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
              <form onSubmit={handleSubmit} style={{ display: "grid", gap: "18px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                    Sección a editar
                  </label>

                  <select
                    value={heroTarget}
                    onChange={(e) => setHeroTarget(e.target.value)}
                    style={inputStyle}
                  >
                    {heroOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                    Subir imagen o video de fondo
                  </label>

                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    style={inputStyle}
                  />

                  <div style={{ marginTop: "10px" }}>
                    <button
                      type="button"
                      onClick={clearBackgroundMedia}
                      style={{
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "999px",
                        padding: "10px 16px",
                        background: "transparent",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      Quitar fondo actual
                    </button>
                  </div>
                </div>

                {(heroTarget === "home" || heroTarget === "nosotras") && (
                  <>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                        Subir logo / imagen superpuesta PNG
                      </label>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        style={inputStyle}
                      />

                      <div style={{ marginTop: "10px" }}>
                        <button
                          type="button"
                          onClick={clearOverlayLogo}
                          style={{
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: "999px",
                            padding: "10px 16px",
                            background: "transparent",
                            color: "#fff",
                            cursor: "pointer",
                            fontWeight: 700,
                          }}
                        >
                          Quitar logo superpuesto
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                        URL logo superpuesto
                      </label>
                      <input
                        type="text"
                        name="overlay_logo_url"
                        value={formData.overlay_logo_url}
                        onChange={handleChange}
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                        Tamaño logo superpuesto
                      </label>
                      <input
                        type="range"
                        min="180"
                        max="1200"
                        step="20"
                        name="overlay_logo_width"
                        value={formData.overlay_logo_width}
                        onChange={handleChange}
                        style={{ width: "100%" }}
                      />
                      <p style={{ marginTop: "8px", color: "rgba(255,255,255,0.62)" }}>
                        {formData.overlay_logo_width}px
                      </p>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        gap: "14px",
                      }}
                    >
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                          X logo
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          name="logo_pos_x"
                          value={formData.logo_pos_x}
                          onChange={handleChange}
                          style={{ width: "100%" }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                          Y logo
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          name="logo_pos_y"
                          value={formData.logo_pos_y}
                          onChange={handleChange}
                          style={{ width: "100%" }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                          X texto
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          name="texto_pos_x"
                          value={formData.texto_pos_x}
                          onChange={handleChange}
                          style={{ width: "100%" }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                          Y texto
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          name="texto_pos_y"
                          value={formData.texto_pos_y}
                          onChange={handleChange}
                          style={{ width: "100%" }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                        gap: "14px",
                      }}
                    >
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                          Tamaño título
                        </label>
                        <input
                          type="range"
                          min="24"
                          max="180"
                          step="2"
                          name="titulo_font_size"
                          value={formData.titulo_font_size}
                          onChange={handleChange}
                          style={{ width: "100%" }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                          Tamaño subtítulo
                        </label>
                        <input
                          type="range"
                          min="12"
                          max="80"
                          step="1"
                          name="subtitulo_font_size"
                          value={formData.subtitulo_font_size}
                          onChange={handleChange}
                          style={{ width: "100%" }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                          Alineación
                        </label>
                        <select
                          name="texto_align"
                          value={formData.texto_align}
                          onChange={handleChange}
                          style={inputStyle}
                        >
                          <option value="left">Izquierda</option>
                          <option value="center">Centro</option>
                          <option value="right">Derecha</option>
                        </select>
                      </div>
                    </div>

                    <label style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        name="mostrar_logo"
                        checked={formData.mostrar_logo}
                        onChange={handleChange}
                      />
                      Mostrar logo superpuesto
                    </label>

                    <label style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        name="mostrar_texto"
                        checked={formData.mostrar_texto}
                        onChange={handleChange}
                      />
                      Mostrar texto sobre el hero
                    </label>
                  </>
                )}

                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                    URL del recurso principal
                  </label>
                  <input
                    type="text"
                    name="media_url"
                    value={formData.media_url}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                    Tipo de recurso
                  </label>
                  <select
                    name="media_tipo"
                    value={formData.media_tipo}
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    <option value="imagen">Imagen</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                    Título principal
                  </label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                    Subtítulo
                  </label>
                  <textarea
                    name="subtitulo"
                    value={formData.subtitulo}
                    onChange={handleChange}
                    rows={4}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>

                {heroTarget === "nosotras" && (
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      rows={6}
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                  </div>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "16px",
                  }}
                >
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                      Color del texto
                    </label>
                    <input
                      type="color"
                      name="color_texto"
                      value={formData.color_texto}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        height: "54px",
                        borderRadius: "14px",
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "#111",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                      Opacidad overlay
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      name="overlay_opacidad"
                      value={formData.overlay_opacidad}
                      onChange={handleChange}
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                    Fuente del texto
                  </label>
                  <input
                    type="text"
                    name="fuente_texto"
                    value={formData.fuente_texto}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <button
                  type="submit"
                  disabled={guardando || subiendo}
                  style={{
                    border: "none",
                    borderRadius: "999px",
                    padding: "16px 26px",
                    background: "linear-gradient(135deg, #6f5491, #8a67b3)",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: "pointer",
                    width: "fit-content",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
                  }}
                >
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>
              </form>
            </div>

            <div
              style={{
                position: "sticky",
                top: "96px",
                background: "#0d0d0d",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "28px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "18px 20px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "1rem" }}>{previewTitle}</h3>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
                  Arrastra logo o texto
                </span>
              </div>

              <div
                ref={previewRef}
                style={{
                  position: "relative",
                  minHeight: "560px",
                  background: "#000",
                  overflow: "hidden",
                  userSelect: "none",
                }}
              >
                {formData.media_url ? (
                  formData.media_tipo === "video" ? (
                    <video
                      src={formData.media_url}
                      autoPlay
                      muted
                      loop
                      playsInline
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <img
                      src={formData.media_url}
                      alt="preview"
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )
                ) : null}

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `rgba(0,0,0,${formData.overlay_opacidad})`,
                    zIndex: 1,
                  }}
                />

                {(heroTarget === "home" || heroTarget === "nosotras") &&
                  formData.mostrar_logo &&
                  formData.overlay_logo_url && (
                    <img
                      src={formData.overlay_logo_url}
                      alt="logo preview"
                      onMouseDown={() => {
                        dragTypeRef.current = "logo";
                      }}
                      style={{
                        position: "absolute",
                        left: `${formData.logo_pos_x}%`,
                        top: `${formData.logo_pos_y}%`,
                        transform: "translate(-50%, -50%)",
                        width: `${formData.overlay_logo_width}px`,
                        maxWidth: "92%",
                        objectFit: "contain",
                        display: "block",
                        zIndex: 4,
                        cursor: "grab",
                      }}
                    />
                  )}

                {shouldRenderTextBlock && (
                  <div
                    onMouseDown={() => {
                      dragTypeRef.current = "texto";
                    }}
                    style={{
                      position: "absolute",
                      left: `${formData.texto_pos_x}%`,
                      top: `${formData.texto_pos_y}%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: 5,
                      textAlign: formData.texto_align,
                      cursor: "grab",
                      padding: "8px 12px",
                      width:
                        heroTarget === "nosotras"
                          ? "min(90%, 560px)"
                          : heroTarget === "catalogo"
                          ? "min(92%, 560px)"
                          : "min(90%, 520px)",
                    }}
                  >
                    {heroTarget !== "home" && (
                      <p
                        style={{
                          margin: 0,
                          marginBottom: shouldRenderTitle || shouldRenderSubtitle ? "10px" : "0",
                          color: formData.color_texto || "#fff",
                          fontSize: "0.95rem",
                          opacity: 0.9,
                          fontWeight: 600,
                          fontFamily: formData.fuente_texto || "Georgia, serif",
                        }}
                      >
                        {previewBlockTitle}
                      </p>
                    )}

                    {shouldRenderTitle && (
                      <h2
                        style={{
                          margin: 0,
                          fontSize: `${formData.titulo_font_size}px`,
                          lineHeight: 1,
                          color: formData.color_texto || "#fff",
                          fontFamily: formData.fuente_texto || "Georgia, serif",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {formData.titulo}
                      </h2>
                    )}

                    {shouldRenderSubtitle && (
                      <p
                        style={{
                          margin: 0,
                          marginTop: shouldRenderTitle
                            ? heroTarget === "home"
                              ? "-2px"
                              : "12px"
                            : "0",
                          fontSize: `${formData.subtitulo_font_size}px`,
                          lineHeight: 1.2,
                          color: formData.color_texto || "#fff",
                          fontFamily: formData.fuente_texto || "Georgia, serif",
                          whiteSpace: heroTarget === "home" ? "nowrap" : "normal",
                        }}
                      >
                        {formData.subtitulo}
                      </p>
                    )}

                    {shouldRenderDescription && (
                      <p
                        style={{
                          marginTop: "18px",
                          color: "rgba(255,255,255,0.86)",
                          fontSize: "1rem",
                          lineHeight: 1.7,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {formData.descripcion}
                      </p>
                    )}
                  </div>
                )}

                {!formData.media_url && !shouldRenderTextBlock && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      zIndex: 2,
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      paddingBottom: "18px",
                      color: "rgba(255,255,255,0.32)",
                      fontSize: "0.9rem",
                    }}
                  >
                    Sin fondo cargado
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

{/* ======================= */}
{/* METODOS DE PAGO ADMIN */}
{/* ======================= */}

<div
  style={{
    marginTop: "40px",
    background: "#0d0d0d",
    padding: "28px",
    borderRadius: "28px",
    border: "1px solid rgba(255,255,255,0.08)",
  }}
>
  <h2 style={{ marginTop: 0 }}>Métodos de pago</h2>

  {/* CREAR METODO */}
  <div style={{ display: "grid", gap: "10px", marginBottom: "20px" }}>
    <input
      placeholder="Nombre (Nequi, Daviplata...)"
      style={inputStyle}
      onChange={(e) =>
        setNuevoMetodo({ ...nuevoMetodo, nombre: e.target.value })
      }
    />

    <input
      placeholder="Tipo (transferencia, qr...)"
      style={inputStyle}
      onChange={(e) =>
        setNuevoMetodo({ ...nuevoMetodo, tipo: e.target.value })
      }
    />

    <input
      placeholder="Titular"
      style={inputStyle}
      onChange={(e) =>
        setNuevoMetodo({ ...nuevoMetodo, titular: e.target.value })
      }
    />

    <input
      placeholder="Número"
      style={inputStyle}
      onChange={(e) =>
        setNuevoMetodo({ ...nuevoMetodo, numero: e.target.value })
      }
    />

    <input
      placeholder="Descripción"
      style={inputStyle}
      onChange={(e) =>
        setNuevoMetodo({ ...nuevoMetodo, descripcion: e.target.value })
      }
    />

    <input
      placeholder="URL QR (opcional)"
      style={inputStyle}
      onChange={(e) =>
        setNuevoMetodo({ ...nuevoMetodo, qr_url: e.target.value })
      }
    />

    <button
      style={{
        background: "#6f5491",
        color: "#fff",
        borderRadius: "999px",
        padding: "12px",
        border: "none",
        cursor: "pointer",
      }}
      onClick={async () => {
        try {
          await fetch("https://aska-backend-nyx8.onrender.com/api/admin/metodos-pago", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(nuevoMetodo),
          });

          window.location.reload();
        } catch (err) {
          console.error(err);
        }
      }}
    >
      Crear método de pago
    </button>
  </div>

  {/* LISTA */}
  <div style={{ display: "grid", gap: "12px" }}>
    {metodosPago.map((m) => (
      <div
        key={m.id}
        style={{
          padding: "14px",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "16px",
        }}
      >
        <strong>{m.nombre}</strong>
        <p>{m.descripcion}</p>

        <button
          onClick={async () => {
            await fetch(
              `https://aska-backend-nyx8.onrender.com/api/admin/metodos-pago/${m.id}`,
              { method: "DELETE" }
            );
            window.location.reload();
          }}
          style={{
            background: "red",
            color: "#fff",
            border: "none",
            padding: "8px 12px",
            borderRadius: "999px",
            cursor: "pointer",
          }}
        >
          Eliminar
        </button>
      </div>
    ))}
  </div>
</div>

      </section>
    </>
  );
}



export default AdminPagina;