import React, { useState, useEffect } from "react";
import ClickablePoster from "./ClickablePoster";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../hooks/useTranslation";

const API_URL = process.env.REACT_APP_API_URL;

const PopularSection = () => {
  const { t, getTmdbLanguage } = useTranslation();

  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/trending?language=${getTmdbLanguage()}`
        );
        const data = await res.json();
        setTrending(data.results || []);
      } catch (err) {
        console.error("Failed to load trending:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [getTmdbLanguage]);

  const [userReviews, setUserReviews] = useState({});

  useEffect(() => {
    if (!user) return;

    fetch(`${API_URL}/api/get_reviews_by_user_id?user_id=${user.user_id}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const reviewMap = {};
        data.forEach((r) => {
          const key = `${r.media_type || "movie"}-${r.movie_id}`;
          reviewMap[key] = r.rating;
        });
        setUserReviews(reviewMap);
      })
      .catch((err) => console.error(err));
  }, [user]);

  if (loading) {
    return (
      <section className="popular container-md py-5 text-center">
        <h2 className="title-bg mb-4 text-white">{t("trending_this_week")}</h2>
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">{t("loading")}</span>
        </div>
      </section>
    );
  }

  return (
    <section className="popular container-md py-5">
      <h2 className="title-bg py-2 px-3 text-white popularTitle withMargin">
        {t("trending_this_week")}
      </h2>
      <div className="row g-3 g-md-4 px-2">
        {trending.slice(0, 12).map((item) => {
          return (
          <div
            key={`${item.media_type}-${item.id}`}
            className="col-6 col-md-4 col-lg-2 text-center movie-card"
            style={{ position: "relative" }}
          >
            {item.imdb_rating && (
              <div className="imdb-badge">⭐ {item.imdb_rating}</div>
            )}

            {user && userReviews[`${item.media_type}-${item.id}`] && (
              <div className="user-badge">✭ {userReviews[`${item.media_type}-${item.id}`]}</div>
            )}

            <div
              className="movie-card-inner text-decoration-none"
            >
              {user && userReviews[`${item.mediaType}-${item.id}`] ? (
                <div className="underline-animation me-auto"></div>
              ) : (
                <div className="underline-animation-sec me-auto"></div>
              )}
              <ClickablePoster item={item} />

              <div className="movie-title-parent">
                <p className="movie-title text-white" style={{ fontSize: "0.9rem" }}>
                  {item.title || item.name}
                </p>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
};

export default PopularSection;
