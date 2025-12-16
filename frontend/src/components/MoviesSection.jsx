import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ClickablePoster from "./ClickablePoster";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../hooks/useTranslation";

const MoviesSection = () => {
  const { t, getTmdbLanguage } = useTranslation();

  const [topMovies, setTopMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetch(
      `http://localhost:5000/api/category/movies?batch=1&language=${getTmdbLanguage()}`
    )
      .then((res) => res.json())
      .then((data) => {
        setTopMovies(data.results.slice(0, 12));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load movies:", err);
        setLoading(false);
      });
  }, [getTmdbLanguage]);

  const [userReviews, setUserReviews] = useState({});

  useEffect(() => {
    if (!user) return;

    fetch(
      `http://localhost:5000/api/get_reviews_by_user_id?user_id=${user.user_id}`,
      {
        credentials: "include",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const reviewMap = {};
        data.forEach((r) => {
          reviewMap[`${r.movie_id}`] = r.rating;
        });
        setUserReviews(reviewMap);
      })
      .catch((err) => console.error(err));
  }, [user]);

  if (loading) {
    return (
      <section className="popular container-md py-5 text-center">
        <h2 className="title-bg mb-4 text-white">{t("films")}</h2>
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">{t("loading")}</span>
        </div>
      </section>
    );
  }

  return (
    <section className="movies container-md py-5">
      <h2 className="title-bg mb-4 text-white noBack">{t("films")}</h2>

      <div className="row g-3 g-md-4 px-2">
        {topMovies.map((movie) => (
          <div
            key={movie.id}
            className="col-6 col-md-4 col-lg-2 text-center movie-card"
            style={{ position: "relative" }}
          >
            {movie.imdb_rating && (
              <div className="imdb-badge">⭐ {movie.imdb_rating}</div>
            )}
            {user && userReviews[movie.id] && (
              <div className="user-badge"> ✭ {userReviews[movie.id]} </div>
            )}
            <ClickablePoster item={{ ...movie, media_type: "movie" }} />
            <div className="movie-title-parent">
              <p
                className="movie-title text-white"
                style={{ fontSize: "0.9rem" }}
              >
                {movie.title || movie.name}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-5">
        <Link
          to="/type?category=movies"
          className="title-under mb-4"
          style={{ fontSize: "1.1rem", fontWeight: "600" }}
        >
          {t("show_more")}
        </Link>
      </div>
    </section>
  );
};

export default MoviesSection;
