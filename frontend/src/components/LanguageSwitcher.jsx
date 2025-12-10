import React, { useState, useRef, useEffect } from "react";

const languages = [
  { code: "en", flag: "US", name: "English" },
  { code: "ru", flag: "RU", name: "Русский" },
  { code: "fi", flag: "FI", name: "Suomi" },
];

export default function LanguageSwitcher() {
  const savedLang = localStorage.getItem("language") || "en";
  const [currentLang, setCurrentLang] = useState(savedLang);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const current = languages.find(l => l.code === currentLang);
  const wrapperRef = useRef(null);

  const handleChange = (code) => {
    setCurrentLang(code);
    localStorage.setItem("language", code);
    document.documentElement.lang = code;
    setOpen(false);

    window.dispatchEvent(new Event("languageChanged"));
  };
 
  return (
    <div
      ref={wrapperRef}
      className="position-fixed"
      style={{
        bottom: "20px",
        right: "20px",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "rgba(0, 0, 0, 0.4)",
          padding: "10px",
          borderRadius: "12px",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          position: "relative",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setOpen(false) }}
      >
        <button
          onClick={() => setOpen(!open)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: "26px",
            color: "white",
            transition: "transform 0.3s ease, color 0.3s ease",
            transform: hovered ? "scale(1.2) rotate(10deg)" : "scale(1) rotate(0deg)",
            color: hovered ? "#FFD700" : "white",
          }}
        >
          {current.flag} {current.name}
        </button>

        {open && (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100%)",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0, 0, 0, 0.35)",
              borderRadius: "12px",
              padding: "8px 0",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 215, 0, 0.3)",
              minWidth: "160px",
              animation: "fadeInUp 0.3s ease-out",
              zIndex: 99999,
            }}
          >
            {languages
              .filter(l => l.code !== currentLang)
              .map(lang => (
                <button
                  key={lang.code}
                  onClick={() =>{ handleChange(lang.code); setHovered(false); setOpen(false)}}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px 16px",
                    background: "transparent",
                    borderRadius: "12px",
                    borderColor: "transparent",
                    color: "white",
                    textAlign: "left",
                    fontSize: "18px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "rgba(10, 239, 255, 0.6)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                  }}
                >
                  {lang.flag} {lang.name}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

const style = document.createElement("style");
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
`;
document.head.appendChild(style);