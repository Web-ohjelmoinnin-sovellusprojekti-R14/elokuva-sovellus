import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ClickablePoster from "./ClickablePoster";

const CartoonsSection = () => {
  const [topCartoons, setTopCartoons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/category/cartoons?batch=1")
      .then(res => res.json())
      .then(data => {
        setTopCartoons(data.results.slice(0, 12));
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load cartoons:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="popular container-md py-5 text-center">
        <h2 className="title-bg mb-4 text-white">Cartoons</h2>
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="movies container-md py-5">
      <h2 className="title-bg mb-4 text-white noBack">
        Cartoons
      </h2>

      <div className="row g-3 g-md-4">
        {topCartoons.map((cartoon) => (
          <div
            key={cartoon.id}
            className="col-6 col-md-4 col-lg-2 text-center movie-card"
            style={{ position: "relative" }}
          >
            {cartoon.imdb_rating && (
              <div className="imdb-badge">⭐ {cartoon.imdb_rating}</div>
            )}
            <ClickablePoster item={{ ...cartoon, media_type: "movie" }}/>
            <div className="movie-title-parent">
                <p className="movie-title text-white" style={{ fontSize: "0.9rem" }}>
                    {cartoon.title || cartoon.name}
                </p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-5">
        <Link
          to="/type?category=cartoons"
          className="title-under mb-4"
          style={{ fontSize: "1.1rem", fontWeight: "600" }}
        >
          Show more...
        </Link>
      </div>
    </section>
  );
};

export default CartoonsSection;