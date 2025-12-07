import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const IMG = "https://image.tmdb.org/t/p/w300";

const groupByRating = (reviews) => {
  const groups = {};
  reviews.forEach((review) => {
    const rating = review.rating;
    if (!groups[rating]) groups[rating] = [];
    groups[rating].push(review);
  });
  return Object.keys(groups)
    .sort((a, b) => b - a)
    .reduce((acc, key) => {
      acc[key] = groups[key];
      return acc;
    }, {});
};

const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <span className="text-warning">
      {[...Array(fullStars)].map((_, i) => (
        <span key={i}>★</span>
      ))}
      {hasHalfStar && <span style={{ color: "#ffaa00" }}>☆</span>}
      {[...Array(10 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
        <span key={i + "empty"} style={{ color: "#444" }}>★</span>
      ))}
    </span>
  );
};

export default function UserReviewPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchUserReviews = async () => {
      try {
        setLoading(true);
        setProgress({ loaded: 0, total: 1 });

        const res = await fetch("http://localhost:5000/api/get_reviews_by_user_id", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Не удалось загрузить отзывы");

        const data = await res.json();
        const reviewsArray = Array.isArray(data) ? data : [];

        setProgress({ loaded: 0, total: reviewsArray.length || 1 });

        const enrichedReviews = await Promise.all(
          reviewsArray.map(async (review) => {
            const mediaType = review.media_type || "movie";
            const id = review.movie_id;

            try {
              const titleRes = await fetch(
                `http://localhost:5000/api/get_title_details?id=${id}&media_type=${mediaType}`
              );

              if (!titleRes.ok) {
                console.warn(`Title not found: ${id} (${mediaType})`);
                return null;
              }

              const titleData = await titleRes.json();

              setProgress(prev => ({ ...prev, loaded: prev.loaded + 1 }));

              return {
                ...review,
                title: titleData,
                mediaType,
              };
            } catch (err) {
              console.error("Error loading title:", id, mediaType);
              setProgress(prev => ({ ...prev, loaded: prev.loaded + 1 }));
              return null;
            }
          })
        );

        setReviews(enrichedReviews.filter(Boolean)
          .sort((a, b) => {
            if (b.rating !== a.rating) return b.rating - a.rating;
            return new Date(b.created_at) - new Date(a.created_at);
          }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserReviews();
  }, [user]);

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <h2 className="text-white noBack">Log in to see your reviews</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-light mb-4" style={{ width: "4rem", height: "4rem" }}></div>

        <div className="w-75 mx-auto">
          <div
            className="position-relative rounded-pill overflow-hidden"
            style={{
              height: "12px",
              background: "rgba(255,255,255,0.08)",
              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.6), 0 0 20px rgba(255,193,7,0.15)",
              border: "1px solid rgba(255,193,7,0.3)",
            }}
          >
            <div
              className="h-100 rounded-pill position-relative overflow-hidden"
              style={{
                width: `${(progress.loaded / progress.total) * 100}%`,
                background: "linear-gradient(90deg, #00d4ff, #ff07f3, #ff3300)",
                transition: "width 0.5s ease",
                boxShadow: "0 0 20px rgba(255,193,7,0.6)",
              }}
            >
              <div
                className="position-absolute top-0 start-0 h-100 w-100"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                  transform: "translateX(-100%)",
                  animation: "shimmer 2s infinite",
                }}
              />
            </div>
          </div>

          <div className="text-center mt-3 noBack">
            <p className="text-white fs-5 mb-1 noBack">
              Loading: <strong className="text-warning noBack">{progress.loaded}</strong> from{" "}
              <strong className="text-warning noBack">{progress.total}</strong>
            </p>
            <p className="text-white-50 small noBack">
              {Math.round((progress.loaded / progress.total) * 100)}%
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="container py-5 text-danger text-center">{error}</div>;
  }

  const groupedReviews = groupByRating(reviews);

  return (
    <div className="container py-5">
      <h1 className="display-5 text-white mb-5 text-center text-uppercase fw-bold opacity-75 noBack">
        My reviews • {user.username}
      </h1>

      {reviews.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-white-50 fs-4">You haven't left any reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedReviews).map(([rating, reviewsList]) => (
            <div key={rating} className="text-center mb-5">
              <div className="d-inline-flex align-items-center gap-3 mb-5 px-4 py-2 bg-black bg-opacity-50 rounded-pill border border-warning">
                <h2 className="text-warning fs-3 fw-bold me-3">
                  {rating}/10
                </h2>
                <StarRating rating={parseFloat(rating)} />
                <span className="text-white-50 ms-3">({reviewsList.length})</span>
              </div>

              <div className="row g-4">
                {reviewsList.map((review) => {
                  const t = review.title;
                  if (!t) return null;

                  const name = t.title || t.name;
                  const year = (t.release_date || t.first_air_date || "").split("-")[0];

                  return (
                    <div key={review.review_id} className="col-lg-6 col-xl-4">
                      <Link
                        to={`/title/${t.id}/${review.mediaType}`}
                        className="text-decoration-none h-100 d-flex flex-column"
                        style={{
                          transition: "all 0.3s ease",
                          boxShadow: "2px 4px 15px rgba(0,0,0,0.6)",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.03) translateY(-8px)";
                          e.currentTarget.style.boxShadow = "0 16px 40px rgba(255, 107, 0, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1) translateY(0)";
                          e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.6)";
                        }}
                      >
                        <div className="bg-dark bg-opacity-90 rounded-4 p-4 border border-secondary h-100 d-flex flex-column">
                          <div className="row g-3 flex-grow-1">
                            <div className="col-5">
                              <img
                                src={t.poster_path ? `${IMG}${t.poster_path}` : "/images/no-poster.jpg"}
                                alt={name}
                                className="img-fluid rounded shadow w-100"
                                style={{ height: "280px", objectFit: "cover" }}
                              />
                            </div>

                            <div className="col-7 d-flex flex-column">
                              <h5 className="text-warning fw-bold hover-underline mb-1">
                                {name} {year && <span className="text-white-50 ms-2">({year})</span>}
                              </h5>

                              <div className="flex-grow-1 mt-2 mb-3 d-flex align-items-center justify-content-center px-3 text-white" style={{ borderRadius: 6 }}>
                                {review.comment ? (
                                  <div
                                    className="text-white text-center"
                                    style={{
                                      lineHeight: "1.55",
                                      fontSize: "0.95rem",
                                      wordBreak: "break-word",
                                      overflow: "hidden",
                                      display: "-webkit-box",
                                      WebkitLineClamp: 6,
                                      WebkitBoxOrient: "vertical",
                                      maxWidth: "100%",
                                    }}
                                  >
                                    {review.comment}
                                  </div>
                                ) : (
                                  <p className="text-white fst-italic mb-0">No comment</p>
                                )}
                              </div>

                              <div className="mt-auto">
                                <div className="d-flex align-items-center mb-2">
                                  <span className="text-white-50 me-2">Rating:</span>
                                  <span className="badge bg-warning text-dark fs-5 px-3">
                                    {review.rating}/10
                                  </span>
                                </div>
                                <small className="text-white-50">
                                  {new Date(review.created_at).toLocaleDateString("ru-RU")}
                                </small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}