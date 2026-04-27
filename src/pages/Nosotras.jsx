import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";

function safeNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function Nosotras() {
  const [heroConfig, setHeroConfig] = useState(null);
  const [legacyData, setLegacyData] = useState({
    contenido: null,
    bloques: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const cargarTodo = async () => {
      try {
        setLoading(true);

        const [heroRes, legacyRes] = await Promise.allSettled([
          fetch("https://aska-backend-nyx8.onrender.com/api/nosotras-config"),
          fetch("https://aska-backend-nyx8.onrender.com/api/nosotras"),
        ]);

        let heroJson = null;
        let legacyJson = { contenido: null, bloques: [] };

        if (heroRes.status === "fulfilled") {
          try {
            heroJson = await heroRes.value.json();
          } catch {
            heroJson = null;
          }
        }

        if (legacyRes.status === "fulfilled") {
          try {
            legacyJson = await legacyRes.value.json();
          } catch {
            legacyJson = { contenido: null, bloques: [] };
          }
        }

        if (!mounted) return;

        setHeroConfig(heroJson || null);
        setLegacyData({
          contenido: legacyJson?.contenido || null,
          bloques: Array.isArray(legacyJson?.bloques) ? legacyJson.bloques : [],
        });
      } catch (error) {
        console.error("Error cargando Nosotras:", error);
        if (!mounted) return;
        setHeroConfig(null);
        setLegacyData({
          contenido: null,
          bloques: [],
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    cargarTodo();

    return () => {
      mounted = false;
    };
  }, []);

  const hero = useMemo(() => {
    const contenido = legacyData.contenido || {};

    const mediaUrl = heroConfig?.media_url?.trim() || "";
    const mediaTipo =
      heroConfig?.media_tipo ||
      (/\.(mp4|webm|ogg)$/i.test(mediaUrl) ? "video" : "imagen");

    return {
      media_url: mediaUrl,
      media_tipo: mediaTipo,
      titulo: heroConfig?.titulo?.trim() || contenido.hero_titulo || "Nosotras",
      subtitulo:
        heroConfig?.subtitulo?.trim() || "Conoce la esencia detrás de AŞKA.",
      descripcion:
        heroConfig?.descripcion?.trim() ||
        contenido.intro_texto ||
        "AŞKA nace desde la intención de crear piezas con identidad, estética y carácter. Cada detalle busca transmitir una joyería atemporal, elegante y poderosa.",
      color_texto: heroConfig?.color_texto || "#ffffff",
      overlay_opacidad: safeNumber(heroConfig?.overlay_opacidad, 0.2),
      fuente_texto: heroConfig?.fuente_texto || "Georgia, serif",
      overlay_logo_url: heroConfig?.overlay_logo_url || "",
      overlay_logo_width: safeNumber(heroConfig?.overlay_logo_width, 420),
      mostrar_logo: Number(heroConfig?.mostrar_logo ?? 0) === 1,
      mostrar_texto: Number(heroConfig?.mostrar_texto ?? 1) === 1,
      logo_pos_x: safeNumber(heroConfig?.logo_pos_x, 50),
      logo_pos_y: safeNumber(heroConfig?.logo_pos_y, 38),
      texto_pos_x: safeNumber(heroConfig?.texto_pos_x, 50),
      texto_pos_y: safeNumber(heroConfig?.texto_pos_y, 68),
      titulo_font_size: safeNumber(heroConfig?.titulo_font_size, 62),
      subtitulo_font_size: safeNumber(heroConfig?.subtitulo_font_size, 24),
      texto_align: heroConfig?.texto_align || "center",
    };
  }, [heroConfig, legacyData]);

  const teamCards = [
    {
      nombre: "Nicky",
      imagen: "/nosotras/nicky.png",
      texto:
        "Nicky es el fuego de AŞKA. Inició este sueño en 2020 y desde entonces no ha dejado de expandirlo. Hoy explora nuevas creaciones en plata para las futuras colecciones de la marca.",
    },
    {
      nombre: "Rubí",
      imagen: "/nosotras/rubi.png",
      texto:
        "Rubí es las manos creadoras de AŞKA. Su proceso ha sido intuitivo y empírico: comenzó explorando sin una idea definida hasta encontrar, en cada pieza, el valor del detalle y la precisión artesanal.",
    },
    {
      nombre: "Mich",
      imagen: "/nosotras/mich.png",
      texto:
        "Mich es la estética de AŞKA. Está detrás de las imágenes y las palabras, dando forma a la manera en que la marca se ve, se siente y se conecta con el mundo.",
    },
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <section
          style={{
            minHeight: "100vh",
            background: "#050505",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.1rem",
          }}
        >
          Cargando Nosotras...
        </section>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <section
        style={{
          position: "relative",
          minHeight: "72vh",
          overflow: "hidden",
          background: hero.media_url ? "#000" : "#0b0b0b",
        }}
      >
        {hero.media_url ? (
          hero.media_tipo === "video" ? (
            <video
              src={hero.media_url}
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
              src={hero.media_url}
              alt={hero.titulo}
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
            background: `rgba(0,0,0,${hero.overlay_opacidad})`,
            zIndex: 1,
          }}
        />

        {hero.mostrar_logo && hero.overlay_logo_url && (
          <img
            src={hero.overlay_logo_url}
            alt="AŞKA"
            style={{
              position: "absolute",
              left: `${hero.logo_pos_x}%`,
              top: `${hero.logo_pos_y}%`,
              transform: "translate(-50%, -50%)",
              width: `${hero.overlay_logo_width}px`,
              maxWidth: "92vw",
              objectFit: "contain",
              display: "block",
              zIndex: 4,
            }}
          />
        )}

        {hero.mostrar_texto && (
          <div
            style={{
              position: "absolute",
              left: `${hero.texto_pos_x}%`,
              top: `${hero.texto_pos_y}%`,
              transform: "translate(-50%, -50%)",
              zIndex: 5,
              textAlign: hero.texto_align,
              padding: "8px 12px",
              width: "min(90vw, 1000px)",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: `${hero.titulo_font_size}px`,
                lineHeight: 1,
                color: hero.color_texto,
                fontFamily: hero.fuente_texto,
                letterSpacing: "0.02em",
              }}
            >
              {hero.titulo}
            </h1>

            <p
              style={{
                margin: 0,
                marginTop: "-2px",
                fontSize: `${hero.subtitulo_font_size}px`,
                lineHeight: 1.2,
                color: hero.color_texto,
                fontFamily: hero.fuente_texto,
                whiteSpace: "nowrap",
              }}
            >
              {hero.subtitulo}
            </p>
          </div>
        )}
      </section>

      <section
        style={{
          background: "#050505",
          color: "#fff",
          padding: "56px 24px 80px",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            display: "grid",
            gap: "28px",
          }}
        >
          <div
            style={{
              background: "#0d0d0d",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "28px",
              padding: "32px",
              boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "18px",
                fontSize: "2rem",
              }}
            >
              AŞKA
            </h2>

            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,0.78)",
                lineHeight: 1.9,
                whiteSpace: "pre-line",
                fontSize: "1.04rem",
              }}
            >
              {hero.descripcion}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "28px",
            }}
          >
            {teamCards.map((item) => (
              <div
                key={item.nombre}
                style={{
                  background: "#0d0d0d",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "28px",
                  overflow: "hidden",
                  boxShadow: "0 16px 40px rgba(0,0,0,0.18)",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "320px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#111",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    style={{
                      maxWidth: "90%",
                      maxHeight: "100%",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </div>

                <div style={{ padding: "24px" }}>
                  <h3
                    style={{
                      marginTop: 0,
                      marginBottom: "14px",
                      fontSize: "2rem",
                      textAlign: "center",
                    }}
                  >
                    {item.nombre}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: "rgba(255,255,255,0.76)",
                      lineHeight: 1.9,
                      textAlign: "center",
                    }}
                  >
                    {item.texto}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {legacyData.bloques.length > 0 && (
            <div
              style={{
                display: "grid",
                gap: "24px",
              }}
            >
              {legacyData.bloques.map((bloque, index) => {
                const mediaEsVideo =
                  bloque.tipo_media === "video" ||
                  /\.(mp4|webm|ogg)$/i.test(bloque.media_url || "");

                const mediaSection = (
                  <div style={{ minHeight: "420px", background: "#111" }}>
                    {bloque.media_url ? (
                      mediaEsVideo ? (
                        <video
                          src={bloque.media_url}
                          controls
                          muted
                          playsInline
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      ) : (
                        <img
                          src={bloque.media_url}
                          alt={bloque.titulo || "Bloque Nosotras"}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      )
                    ) : null}
                  </div>
                );

                const textSection = (
                  <div
                    style={{
                      padding: "32px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <h3
                      style={{
                        marginTop: 0,
                        marginBottom: "16px",
                        fontSize: "2rem",
                      }}
                    >
                      {bloque.titulo}
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        color: "rgba(255,255,255,0.74)",
                        lineHeight: 1.9,
                        whiteSpace: "pre-line",
                      }}
                    >
                      {bloque.descripcion}
                    </p>
                  </div>
                );

                return (
                  <div
                    key={bloque.id}
                    style={{
                      background: "#0d0d0d",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "28px",
                      overflow: "hidden",
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    }}
                  >
                    {index % 2 === 0 ? (
                      <>
                        {mediaSection}
                        {textSection}
                      </>
                    ) : (
                      <>
                        {textSection}
                        {mediaSection}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Nosotras;