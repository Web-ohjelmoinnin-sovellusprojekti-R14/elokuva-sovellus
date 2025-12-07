import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ClickablePoster from "./ClickablePoster";
import { useAuth } from "../context/AuthContext";

const SeriesSection = () => {
  const [topSeries, setTopSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetch("http://localhost:5000/api/category/series?batch=1")
      .then(res => res.json())
      .then(data => {
        setTopSeries(data.results.slice(0, 12));
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load series:", err);
        setLoading(false);
      });
  }, []);

  const [userReviews, setUserReviews] = useState({});

  useEffect(() => {
    if (!user) return;
  
    fetch(`http://localhost:5000/api/get_reviews_by_user_id?user_id=${user.user_id}`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const reviewMap = {};
        data.forEach(r => {
          reviewMap[`${r.movie_id}`] = r.rating;
        });
        setUserReviews(reviewMap);
      })
      .catch(err => console.error(err));
  }, [user]);

  if (loading) {
    return (
      <section className="popular container-md py-5 text-center">
        <h2 className="title-bg mb-4 text-white">TV Series</h2>
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </section>
    );
  }
 
  return (
    <section className="popular container-md py-5">
      <h2 className="title-bg mb-4 text-white noBack">
        TV Series
      </h2>

      <div className="row g-3 g-md-4 px-2">
        {topSeries.map((series) => (
          <div
            key={series.id}
            className="col-6 col-md-4 col-lg-2 text-center movie-card"
            style={{ position: "relative" }}
          >
            {series.imdb_rating && (
              <div className="imdb-badge">⭐ {series.imdb_rating}</div>
            )}
            {user && userReviews[series.id] && (
              <div className="user-badge"> ✭ {userReviews[series.id]} </div>
            )}
            <ClickablePoster item={{ ...series, media_type: "tv" }}/>
            <div className="movie-title-parent">
                <p className="movie-title text-white" style={{ fontSize: "0.9rem" }}>
                    {series.title || series.name}
                </p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-5">
        <Link
          to="/type?category=series"
          className="title-under mb-4"
          style={{ fontSize: "1.1rem", fontWeight: "600" }}
        >
          Show more...
        </Link>
      </div>
    </section>
  );
};

export default SeriesSection;