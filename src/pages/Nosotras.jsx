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
      overlay_opacidad: safeNumber(heroConfig?.overlay_opacidad, 0.28),
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
      rol: "Fundadora / Dirección creativa",
      imagen: "/nosotras/nicky.png",
      texto:
        "Nicky es el fuego de AŞKA. Inició este sueño en 2020 y desde entonces no ha dejado de expandirlo. Hoy explora nuevas creaciones en plata para las futuras colecciones de la marca.",
    },
    {
      nombre: "Rubí",
      rol: "Manos artesanas / Técnica",
      imagen: "/nosotras/rubi.png",
      texto:
        "Rubí es las manos creadoras de AŞKA. Su proceso ha sido intuitivo y empírico: comenzó explorando sin una idea definida hasta encontrar, en cada pieza, el valor del detalle y la precisión artesanal.",
    },
    {
      nombre: "Mich",
      rol: "Imagen / Estética de marca",
      imagen: "/nosotras/mich.png",
      texto:
        "Mich es la estética de AŞKA. Está detrás de las imágenes y las palabras, dando forma a la manera en que la marca se ve, se siente y se conecta con el mundo.",
    },
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <section className="aska-nosotras-loading">Cargando Nosotras...</section>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <section className="aska-nosotras-hero">
        {hero.media_url ? (
          hero.media_tipo === "video" ? (
            <video
              src={hero.media_url}
              autoPlay
              muted
              loop
              playsInline
              className="aska-nosotras-hero-media"
            />
          ) : (
            <img
              src={hero.media_url}
              alt={hero.titulo}
              className="aska-nosotras-hero-media"
            />
          )
        ) : null}

        <div
          className="aska-nosotras-hero-overlay"
          style={{
            background: `linear-gradient(90deg, rgba(0,0,0,${hero.overlay_opacidad + 0.18}), rgba(0,0,0,${hero.overlay_opacidad}) 48%, rgba(0,0,0,${hero.overlay_opacidad + 0.08})), linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.58))`,
          }}
        />

        {hero.mostrar_logo && hero.overlay_logo_url && (
          <img
            src={hero.overlay_logo_url}
            alt="AŞKA"
            className="aska-nosotras-overlay-logo"
            style={{
              left: `${hero.logo_pos_x}%`,
              top: `${hero.logo_pos_y}%`,
              width: `${hero.overlay_logo_width}px`,
            }}
          />
        )}

        {hero.mostrar_texto && (
          <div
            className="aska-nosotras-hero-content"
            style={{
              left: `${hero.texto_pos_x}%`,
              top: `${hero.texto_pos_y}%`,
              textAlign: hero.texto_align,
              color: hero.color_texto,
              fontFamily: hero.fuente_texto,
            }}
          >
            <p className="aska-nosotras-eyebrow">AŞKA Maison</p>
            <h1>{hero.titulo}</h1>
            <span>{hero.subtitulo}</span>
          </div>
        )}
      </section>

      <section className="aska-nosotras-manifesto">
        <div className="aska-nosotras-manifesto-inner">
          <p className="aska-section-kicker">Nuestra esencia</p>
          <h2>Joyería con carácter, oficio y presencia.</h2>
          <p>{hero.descripcion}</p>
        </div>
      </section>

      <section className="aska-nosotras-campaign">
        <div className="aska-nosotras-campaign-copy">
          <p className="aska-section-kicker">Hecho a mano</p>
          <h2>El lujo también puede nacer del taller.</h2>
          <p>
            Cada pieza de AŞKA se construye desde el detalle: metal, textura,
            tiempo y manos que entienden el valor de crear algo con identidad.
          </p>
        </div>
      </section>

      <section className="aska-nosotras-team-section">
        <div className="aska-nosotras-team-header">
          <p className="aska-section-kicker">Detrás de AŞKA</p>
          <h2>Las mujeres que dan forma a la marca.</h2>
        </div>

        <div className="aska-nosotras-team-grid">
          {teamCards.map((item, index) => (
            <article
              key={item.nombre}
              className={`aska-nosotras-person ${index === 1 ? "is-lifted" : ""}`}
            >
              <div className="aska-nosotras-person-media">
                <img src={item.imagen} alt={item.nombre} />
              </div>

              <div className="aska-nosotras-person-copy">
                <p>{item.rol}</p>
                <h3>{item.nombre}</h3>
                <span>{item.texto}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {legacyData.bloques.length > 0 && (
        <section className="aska-nosotras-legacy-section">
          {legacyData.bloques.map((bloque, index) => {
            const mediaEsVideo =
              bloque.tipo_media === "video" ||
              /\.(mp4|webm|ogg)$/i.test(bloque.media_url || "");

            return (
              <article
                key={bloque.id}
                className={`aska-nosotras-editorial-block ${index % 2 === 1 ? "is-reversed" : ""}`}
              >
                <div className="aska-nosotras-editorial-media">
                  {bloque.media_url ? (
                    mediaEsVideo ? (
                      <video
                        src={bloque.media_url}
                        controls
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={bloque.media_url}
                        alt={bloque.titulo || "Bloque Nosotras"}
                      />
                    )
                  ) : null}
                </div>

                <div className="aska-nosotras-editorial-copy">
                  <p className="aska-section-kicker">Historia</p>
                  <h3>{bloque.titulo}</h3>
                  <span>{bloque.descripcion}</span>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <style>
        {`
          .aska-nosotras-loading {
            min-height: 100vh;
            background: var(--aska-bg-primary, #050505);
            color: var(--aska-text-secondary, #ffffff);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: 1rem;
            letter-spacing: .12em;
            text-transform: uppercase;
          }

          .aska-nosotras-hero {
            position: relative;
            min-height: 92svh;
            overflow: hidden;
            background: #050505;
            display: flex;
            align-items: flex-end;
          }

          .aska-nosotras-hero-media {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center center;
            display: block;
          }

          .aska-nosotras-hero-overlay {
            position: absolute;
            inset: 0;
            z-index: 1;
          }

          .aska-nosotras-overlay-logo {
            position: absolute;
            transform: translate(-50%, -50%);
            max-width: min(78vw, 620px);
            object-fit: contain;
            display: block;
            z-index: 4;
            filter: drop-shadow(0 18px 48px rgba(0,0,0,.32));
          }

          .aska-nosotras-hero-content {
            position: absolute;
            transform: translate(-50%, -50%);
            z-index: 5;
            width: min(90vw, 1040px);
            padding: 8px 12px;
          }

          .aska-nosotras-eyebrow,
          .aska-section-kicker {
            margin: 0 0 14px;
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: .7rem;
            font-weight: 600;
            letter-spacing: .24em;
            text-transform: uppercase;
          }

          .aska-nosotras-eyebrow {
            color: rgba(255,255,255,.74);
          }

          .aska-nosotras-hero-content h1 {
            margin: 0;
            color: #fff;
            font-size: clamp(4rem, 11vw, 10rem);
            line-height: .82;
            letter-spacing: -.075em;
            font-weight: 500 !important;
            text-transform: uppercase;
            text-shadow: 0 20px 70px rgba(0,0,0,.42);
          }

          .aska-nosotras-hero-content span {
            display: block;
            margin-top: 22px;
            color: rgba(255,255,255,.84);
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: clamp(1rem, 1.35vw, 1.28rem);
            line-height: 1.68;
            font-weight: 300;
          }

          .aska-nosotras-manifesto {
            background: var(--aska-bg-secondary, #f8f3f0);
            color: #111;
            padding: clamp(86px, 9vw, 150px) 24px;
          }

          .aska-nosotras-manifesto-inner {
            width: min(1040px, 100%);
            margin: 0 auto;
            text-align: center;
          }

          .aska-nosotras-manifesto .aska-section-kicker,
          .aska-nosotras-team-header .aska-section-kicker,
          .aska-nosotras-editorial-copy .aska-section-kicker,
          .aska-nosotras-campaign .aska-section-kicker {
            color: rgba(17,17,17,.48);
          }

          .aska-nosotras-manifesto h2,
          .aska-nosotras-team-header h2,
          .aska-nosotras-campaign-copy h2 {
            margin: 0;
            color: #111;
            font-size: clamp(2.8rem, 6vw, 7.4rem);
            line-height: .86;
            letter-spacing: -.075em;
            font-weight: 500 !important;
            text-transform: uppercase;
          }

          .aska-nosotras-manifesto p:last-child,
          .aska-nosotras-campaign-copy p,
          .aska-nosotras-editorial-copy span {
            display: block;
            margin: 28px auto 0;
            max-width: 760px;
            color: rgba(17,17,17,.66);
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: clamp(1rem, 1.25vw, 1.22rem);
            line-height: 1.85;
            font-weight: 300;
            white-space: pre-line;
          }

          .aska-nosotras-campaign {
            min-height: 74vh;
            background:
              linear-gradient(90deg, rgba(0,0,0,.72), rgba(0,0,0,.30), rgba(0,0,0,.76)),
              radial-gradient(circle at 24% 28%, rgba(255,255,255,.18), transparent 24%),
              #050505;
            color: #fff;
            display: flex;
            align-items: center;
            padding: clamp(86px, 9vw, 150px) clamp(24px, 5vw, 76px);
          }

          .aska-nosotras-campaign-copy {
            max-width: 760px;
          }

          .aska-nosotras-campaign .aska-section-kicker,
          .aska-nosotras-campaign-copy h2,
          .aska-nosotras-campaign-copy p {
            color: #fff;
          }

          .aska-nosotras-campaign-copy p {
            margin-left: 0;
            color: rgba(255,255,255,.76);
          }

          .aska-nosotras-team-section {
            background: var(--aska-bg-secondary, #f8f3f0);
            color: #111;
            padding: clamp(86px, 9vw, 144px) clamp(20px, 4vw, 64px);
          }

          .aska-nosotras-team-header {
            max-width: 1280px;
            margin: 0 auto clamp(42px, 6vw, 84px);
          }

          .aska-nosotras-team-grid {
            max-width: 1420px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: clamp(22px, 3vw, 46px);
            align-items: start;
          }

          .aska-nosotras-person {
            position: relative;
          }

          .aska-nosotras-person.is-lifted {
            transform: translateY(56px);
          }

          .aska-nosotras-person-media {
            height: 560px;
            overflow: hidden;
            background: #050505;
            border-radius: 32px;
            box-shadow: 0 30px 90px rgba(0,0,0,.12);
          }

          .aska-nosotras-person-media img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center top;
            display: block;
            filter: saturate(.95) contrast(1.03);
            transition: transform .8s cubic-bezier(.22,.61,.36,1), filter .8s ease;
          }

          .aska-nosotras-person:hover .aska-nosotras-person-media img {
            transform: scale(1.045);
            filter: saturate(1.02) contrast(1.08);
          }

          .aska-nosotras-person-copy {
            padding: 24px 8px 0;
          }

          .aska-nosotras-person-copy p {
            margin: 0 0 10px;
            color: rgba(17,17,17,.48);
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: .7rem;
            font-weight: 700;
            letter-spacing: .18em;
            text-transform: uppercase;
          }

          .aska-nosotras-person-copy h3 {
            margin: 0 0 14px;
            color: #111;
            font-size: clamp(2rem, 4vw, 4.8rem);
            line-height: .88;
            letter-spacing: -.06em;
            font-weight: 500 !important;
            text-transform: uppercase;
          }

          .aska-nosotras-person-copy span {
            display: block;
            color: rgba(17,17,17,.64);
            font-family: var(--aska-font-family-secondary, Helvetica, Arial, sans-serif);
            font-size: .98rem;
            line-height: 1.8;
            font-weight: 300;
          }

          .aska-nosotras-legacy-section {
            background: #050505;
            color: #fff;
            padding: clamp(80px, 8vw, 138px) clamp(20px, 4vw, 64px);
            display: grid;
            gap: clamp(44px, 6vw, 96px);
          }

          .aska-nosotras-editorial-block {
            max-width: 1420px;
            width: 100%;
            margin: 0 auto;
            display: grid;
            grid-template-columns: minmax(0, 1.16fr) minmax(320px, .84fr);
            gap: clamp(26px, 4vw, 72px);
            align-items: center;
          }

          .aska-nosotras-editorial-block.is-reversed {
            grid-template-columns: minmax(320px, .84fr) minmax(0, 1.16fr);
          }

          .aska-nosotras-editorial-block.is-reversed .aska-nosotras-editorial-media {
            order: 2;
          }

          .aska-nosotras-editorial-media {
            min-height: 560px;
            overflow: hidden;
            background: #111;
            border-radius: 34px;
          }

          .aska-nosotras-editorial-media img,
          .aska-nosotras-editorial-media video {
            width: 100%;
            height: 100%;
            min-height: 560px;
            object-fit: cover;
            display: block;
          }

          .aska-nosotras-editorial-copy h3 {
            margin: 0;
            color: #fff;
            font-size: clamp(2.4rem, 5vw, 6.4rem);
            line-height: .86;
            letter-spacing: -.075em;
            font-weight: 500 !important;
            text-transform: uppercase;
          }

          .aska-nosotras-editorial-copy .aska-section-kicker {
            color: rgba(255,255,255,.46);
          }

          .aska-nosotras-editorial-copy span {
            margin-left: 0;
            color: rgba(255,255,255,.72);
          }

          @media (max-width: 980px) {
            .aska-nosotras-team-grid,
            .aska-nosotras-editorial-block,
            .aska-nosotras-editorial-block.is-reversed {
              grid-template-columns: 1fr;
            }

            .aska-nosotras-person.is-lifted {
              transform: none;
            }

            .aska-nosotras-editorial-block.is-reversed .aska-nosotras-editorial-media {
              order: initial;
            }
          }

          @media (max-width: 768px) {
            .aska-nosotras-hero {
              min-height: 76svh;
            }

            .aska-nosotras-hero-content h1 {
              font-size: clamp(3.4rem, 18vw, 6.2rem);
            }

            .aska-nosotras-hero-content span {
              white-space: normal;
            }

            .aska-nosotras-manifesto,
            .aska-nosotras-team-section,
            .aska-nosotras-legacy-section,
            .aska-nosotras-campaign {
              padding-left: 18px;
              padding-right: 18px;
            }

            .aska-nosotras-person-media,
            .aska-nosotras-editorial-media,
            .aska-nosotras-editorial-media img,
            .aska-nosotras-editorial-media video {
              min-height: 430px;
              height: 430px;
            }
          }
        `}
      </style>
    </>
  );
}

export default Nosotras;
