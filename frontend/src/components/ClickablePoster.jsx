import React from "react";
import { Link} from "react-router-dom";
import { useNavigate } from "react-router-dom";

const ClickablePoster = ({ item }) => {
  const navigate = useNavigate();
  const mediaType = item.media_type || (item.title ? "movie" : "tv");
  const title = item.title || item.name || "Without name";

  const animationType = "anim-portal";

  const imgPoster = `${process.env.PUBLIC_URL}/images/noPoster.png`;
  const gifPoster = "https://media1.tenor.com/m/TPN57Pq6g44AAAAd/smeh-smeshno.gif";

  const handleImageError = (e) => { if (e.currentTarget.src !== imgPoster) { e.currentTarget.src = imgPoster; } }

  const handleClick = (e) => {
    e.preventDefault();
    const poster = e.currentTarget;
    poster.classList.add(animationType);
    setTimeout(() => { navigate(`/title/${item.id}/${mediaType}`); }, 350);
  };
 
  return (
    <Link
      to={`/title/${item.id}/${item.media_type || "movie"}`}
      className="d-block text-decoration-none"
    >
      <img
        src = {
          item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : gifPoster
        }
        alt = {title}
        className="img-fluid img-rounded"
        style = {{
          height: "280px",
          objectFit: "cover",
          width: "100%",
          boxShadow: "0 4px 15px rgba(0,0,0,0.6)",
        }}
        onError = {handleImageError}

        onClick={ handleClick }
      />
    </Link>
  );
};

export default ClickablePoster;