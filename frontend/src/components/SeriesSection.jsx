import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ClickablePoster from "./ClickablePoster";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../hooks/useTranslation";

const API_URL = process.env.REACT_APP_API_URL;

const SeriesSection = () => {
  const { t, getTmdbLanguage } = useTranslation();

  const [topSeries, setTopSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetch(
      `${API_URL}/api/category/series?batch=1&language=${getTmdbLanguage()}`
    )
      .then((res) => res.json())
      .then((data) => {
        setTopSeries(data.results.slice(0, 12));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load series:", err);
        setLoading(false);
      });
  }, [getTmdbLanguage]);

  const [userReviews, setUserReviews] = useState({});

  useEffect(() => {
    if (!user) return;

    fetch(`${API_URL}/api/get_reviews_by_user_id?user_id=${user.user_id}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data.rows)) return;
        const reviewMap = {};
        data.rows.forEach((r) => {
          const key = `${r.media_type || "tv"}-${r.movie_id}`;
          reviewMap[key] = r.rating;
        });
        setUserReviews(reviewMap);
      })
      .catch((err) => console.error(err));
  }, [user]);

  const [dots, setDots] = useState([]);
  const lineRef = useRef(null);

  useEffect(() => {
    if (!lineRef.current) return;
    const line = lineRef.current;

    function renderDottedLine() {
      const lineWidth = line.offsetWidth;
      const dotDiameter = 8;
      const gap = 8;
      const totalStep = dotDiameter + gap;
      const count = Math.floor(lineWidth / totalStep);

      const newDots = [];
      for (let i = 0; i < count; i++) {
        const t = count > 1 ? i / (count - 1) : 0;
        const r = Math.round(45 + (255 - 45) * t);
        const g = Math.round(153 + (53 - 153) * t);
        const b = Math.round(255 + (57 - 255) * t);
        newDots.push(
          <span
            key={i}
            style={{
              backgroundColor: `rgb(${r},${g},${b})`,
              width: dotDiameter,
              height: dotDiameter,
              borderRadius: "50%",
              display: "inline-block",
            }}
          />
        );
      }
      setDots(newDots);
    }

    const observer = new ResizeObserver(renderDottedLine);
    observer.observe(line);

    renderDottedLine();
    return () => observer.disconnect();
  }, [loading]);

  if (loading) {
    return (
      <section className="popular container-md py-5 text-center">
        <h2 className="title-bg mb-4 text-white">{t("tv_series")}</h2>
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">{t("loading")}</span>
        </div>
      </section>
    );
  }

  return (
    <section className="popular container-md py-5">
      <h2 className="title-bg py-2 text-white withMargin">
        {t("tv_series")}
        <div className="title-bg-line" ref={lineRef}>
          {dots} {/**/}
        </div>
      </h2>

      <div className="row g-3 g-md-4 px-2">
        {topSeries.map((series) => {
          const mediaType = "tv";
          return (
            <div
              key={series.id}
              className="col-6 col-md-4 col-lg-2 text-center movie-card"
              style={{ position: "relative" }}
            >
              {series.imdb_rating && (
                <div className="imdb-badge">⭐ {series.imdb_rating}</div>
              )}
              {user && userReviews[`${mediaType}-${series.id}`] && (
                <div className="user-badge">
                  {" "}
                  ✭ {userReviews[`${mediaType}-${series.id}`]}{" "}
                </div>
              )}
              <div className="movie-card-inner text-decoration-none">
                {user && userReviews[`${mediaType}-${series.id}`] ? (
                  <div className="underline-animation me-auto"></div>
                ) : (
                  <div className="underline-animation-sec me-auto"></div>
                )}
                <ClickablePoster item={{ ...series, media_type: "tv" }} />

                <div className="movie-title-parent">
                  <p
                    className="movie-title text-white"
                    style={{ fontSize: "0.9rem" }}
                  >
                    {series.title || series.name}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-5">
        <Link
          to="/type?category=series"
          className="title-under mb-4"
          style={{ fontSize: "1.1rem", fontWeight: "600" }}
        >
          {t("show_more")}
        </Link>
      </div>
    </section>
  );
};

export default SeriesSection;
