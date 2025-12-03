import React from "react";
import { Link } from "react-router-dom";

const ClickablePoster = ({ item }) => {
  const mediaType = item.media_type || (item.title ? "movie" : "tv");
  const title = item.title || item.name || "Without name";

  const imgPoster = "/images/noPoster.png";
  const gifPoster = "https://media1.tenor.com/m/TPN57Pq6g44AAAAd/smeh-smeshno.gif";

  const handleImageError = (e) => { if (e.currentTarget.src !== imgPoster) { e.currentTarget.src = imgPoster; } }

  return (
    <Link
      to={`/title/${item.id}/${mediaType}`}
      className="d-block text-decoration-none"
    >
      <img
        src={
          item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : gifPoster
        }
        alt={title}
        className="img-fluid rounded"
        style={{
          height: "280px",
          objectFit: "cover",
          width: "100%",
          boxShadow: "0 4px 15px rgba(0,0,0,0.6)",
          transition: "all 0.3s ease",
        }}
        onError={handleImageError}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 12px 30px rgba(255, 107, 0, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.6)";
        }}
      />
    </Link>
  );
};

export default ClickablePoster;