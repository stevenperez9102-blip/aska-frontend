import { useEffect, useState } from "react";

function EasterEgg() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const activate = () => {
      setActive(true);

      setTimeout(() => {
        setActive(false);
      }, 5200);
    };

    window.addEventListener("aska-secret", activate);

    return () => {
      window.removeEventListener("aska-secret", activate);
    };
  }, []);

  if (!active) return null;

  return (
    <div className="aska-easter-egg">
      <div className="aska-easter-shine" />

      <div className="aska-chain-rain">
        {Array.from({ length: 36 }).map((_, index) => (
          <span
            key={index}
            className="aska-chain"
            style={{
              left: `${(index * 8.3) % 100}%`,
              animationDelay: `${(index % 9) * 0.16}s`,
              animationDuration: `${3 + (index % 6) * 0.35}s`,
            }}
          >
            ⛓
          </span>
        ))}
      </div>

      <div className="aska-secret-card">
        <p>✨ Se desbloqueó el secreto de AŞKA ✨</p>
        <h2>Aska es una chimba</h2>
        <h3>y Nicky una agente secreta de las zuricatas!</h3>
      </div>
    </div>
  );
}

export default EasterEgg;