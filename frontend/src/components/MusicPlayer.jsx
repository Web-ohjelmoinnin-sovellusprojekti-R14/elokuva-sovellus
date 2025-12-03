import { useEffect, useRef, useState } from "react";

export default function MusicPlayer() {
  const audioRef = useRef(null);
  const savedVolume = Number(localStorage.getItem("music_volume")) || 0.5;
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(savedVolume);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.0001;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        setTimeout(() => { audio.volume = savedVolume; }, 300); })
        .catch(() => { setPlaying(false); });
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) { audioRef.current.volume = volume; }
    localStorage.setItem("music_volume", volume);
  }, [volume]);

  const togglePlay = () => {
    const audio = audioRef.current;

    if (!playing) { audio.play(); } else { audio.pause(); }
    setPlaying(!playing);
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/music/background.mp3"
        loop
        preload="auto"
      />

      <div className="popular"
        style={{
          position: "fixed",
          bottom: "20px", left: "20px",
          zIndex: 9999,
          display: "flex", alignItems: "center",
          gap: "10px",
          background: "rgba(0, 0, 0, 0.4)",
          padding: "10px",
          borderRadius: "12px",
          backdropFilter: "blur(6px)",
        }}
      >
        <button
          onClick={togglePlay}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: "26px",
            color: "white",
            transition: "transform 0.3s ease, color 0.3s ease",
            transform: hovered ? "scale(1.3) rotate(15deg)" : "scale(1) rotate(0deg)",
            color: hovered ? "#FFD700" : "white",
          }}
        >
        {playing ? "🔊" : "🔈"}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          style={{ cursor: "pointer" }}
        />
      </div>
    </>
  );
}