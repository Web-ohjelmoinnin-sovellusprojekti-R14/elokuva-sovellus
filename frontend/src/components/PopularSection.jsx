import React, { useState, useEffect } from "react";
import ClickablePoster from "./ClickablePoster";

const PopularSection = () => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/trending");
        const data = await res.json();
        setTrending(data.results || []);
      } catch (err) {
        console.error("Failed to load trending:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) {
    return (
      <section className="popular container-md py-5 text-center">
        <h2 className="title-bg mb-4 text-white">Trending this week</h2>
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="popular container-md py-5">
      <h2 className="title-bg mb-4 text-white noBack">
        Trending this week
      </h2>
      <div className="row g-3 g-md-4">
        {trending.slice(0, 12).map((item) => (
          <div
            key={`${item.media_type}-${item.id}`}
            className="col-6 col-md-4 col-lg-2 text-center movie-card"
            style={{ position: "relative" }}
          >
            {item.imdb_rating && (
              <div className="imdb-badge">⭐ {item.imdb_rating}</div>
            )}
            <ClickablePoster item={item}/>
            <div className="movie-title-parent">
              <p className="movie-title text-white" style={{ fontSize: "0.9rem" }}>
                  {item.title || item.name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularSection;