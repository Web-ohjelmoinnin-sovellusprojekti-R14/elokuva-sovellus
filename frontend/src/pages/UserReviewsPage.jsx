import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";

const API_URL = process.env.REACT_APP_API_URL;

const IMG = "https://image.tmdb.org/t/p/w300";

const groupByRating = (reviews) => {
  const groups = {};

  reviews.forEach((review) => {
    const rating = parseFloat(review.rating);
    if (!groups[rating]) groups[rating] = [];
    groups[rating].push(review);
  });

  return Object.entries(groups)
    .sort(([a], [b]) => b - a)
    .map(([rating, reviewsList]) => ({ rating: parseFloat(rating), reviewsList }));
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
        <span key={i + "empty"} style={{ color: "#444" }}>
          ★
        </span>
      ))}
    </span>
  );
};

const RatingDistributionChart = ({ reviews, onRatingClick }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const effectiveReviews = [...reviews];
  const isBoss = user?.username === "boss";
  if (isBoss) {
    effectiveReviews.push({ rating: 6 });
  }

  const histogram = {};
  for (let i = 10; i >= 1; i -= 0.5) {
    histogram[i.toFixed(1)] = 0;
  }

  reviews.forEach((review) => {
    const rating = parseFloat(review.rating);
    const rounded = Math.round(rating * 2) / 2;
    const key = rounded.toFixed(1);
    if (histogram[key] !== undefined) histogram[key]++;
  });

  const maxCount = Math.max(...Object.values(histogram), 1);
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (
          reviews.reduce((sum, r) => sum + parseFloat(r.rating), 0) /
          totalReviews
        ).toFixed(1)
      : "—";

  return (
    <div className="my-4 p-4 bg-black bg-opacity-50 rounded-4 border border-warning border-1 shadow-sm">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="text-warning fw-bold mb-0 fs-5">
          {t("user_reviews_distribution")}{" "}
          {totalReviews > 0 && (
            <small className="text-white-50 ms-2">
              ({totalReviews + (user?.username === "boss" ? 1 : 0)})
            </small>
          )}
        </h4>
      </div>

      <div className="text-center mb-4">
        <div className="d-inline-flex align-items-center gap-3 bg-dark bg-opacity-80 px-4 py-3 rounded-3 border border-secondary h-100">
          <div>
            <div className="fs-2 text-warning fw-bold lh-1">{avgRating}</div>
            <small className="text-white-50">{t("mid")}</small>
          </div>
        </div>
      </div>

      <div className="row g-1 justify-content-center align-items-end">
        {Object.entries(histogram)
          .reverse()
          .map(([rating, count]) => (
            <div
              key={rating}
              className="col text-center"
              style={{ cursor: count > 0 ? "pointer" : "default" }}
              onClick={() => count > 0 && onRatingClick?.(parseFloat(rating))}
              title={count > 0 ? `${count} ${rating}` : ""}
            >
              <div
                className="mx-auto mb-1 position-relative"
                style={{ height: "70px", width: "18px" }}
              >
                <div
                  className={`rating-bar ${count > 0 ? "active" : ""}`}
                  style={{
                    height: `${(count / maxCount) * 100}%`,
                    background:
                      count > 0
                        ? "linear-gradient(to top, #0066ff, #00ccff)"
                        : "rgba(255,255,255,0.08)",
                    borderRadius: "4px 4px 0 0",
                    boxShadow:
                      count > 0 ? "0 0 12px rgba(0, 200, 255, 0.5)" : "none",
                    transition: "all 0.3s ease",
                  }}
                />
              </div>
              <div className="text-white-50 text-xs">{rating}</div>
              {count > 0 && (
                <div className="text-info fw-bold text-xs">{count}</div>
              )}
            </div>
          ))}
      </div>

      <div className="d-flex justify-content-between mt-2 px-2">
        <small className="text-white-50">1</small>
        <small className="text-white-50">10.0</small>
      </div>
    </div>
  );
};

export default function UserReviewPage() {
  const { t, getTmdbLanguage } = useTranslation();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });
  const ratingRefs = useRef({});

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchUserReviews = async () => {
      try {
        setLoading(true);
        setProgress({ loaded: 0, total: 1 });

        const res = await fetch(`${API_URL}/api/get_reviews_by_user_id`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("No results");

        const data = await res.json();
        const reviewsArray = Array.isArray(data) ? data : [];
        const isBoss = user?.username === "boss";
        const totalItems = reviewsArray.length + (isBoss ? 1 : 0);
        setProgress({ loaded: 0, total: totalItems || 1 });

        const enrichedReviews = await Promise.all(
          reviewsArray.map(async (review) => {
            const mediaType = review.media_type || "movie";
            const id = review.movie_id;

            try {
              const titleRes = await fetch(
                `${API_URL}/api/get_title_details?id=${id}&media_type=${mediaType}&language=${getTmdbLanguage()}`
              );

              if (!titleRes.ok) {
                console.warn(`Title not found: ${id} (${mediaType})`);
                return null;
              }

              const titleData = await titleRes.json();

              setProgress((prev) => ({ ...prev, loaded: prev.loaded + 1 }));

              return {
                ...review,
                title: titleData,
                mediaType,
              };
            } catch (err) {
              console.error("Error loading title:", id, mediaType);
              setProgress((prev) => ({ ...prev, loaded: prev.loaded + 1 }));
              return null;
            }
          })
        );

        setReviews(
          enrichedReviews.filter(Boolean).sort((a, b) => {
            if (b.rating !== a.rating) return b.rating - a.rating;
            return new Date(b.created_at) - new Date(a.created_at);
          })
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserReviews();
  }, [user, getTmdbLanguage]);

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <h2 className="text-white noBack">{t("login_to_see_reviews")}</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div
          className="spinner-border text-light mb-4"
          style={{ width: "4rem", height: "4rem" }}
        ></div>

        <div className="w-75 mx-auto">
          <div
            className="position-relative rounded-pill overflow-hidden"
            style={{
              height: "12px",
              background: "rgba(255,255,255,0.08)",
              boxShadow:
                "inset 0 2px 8px rgba(0,0,0,0.6), 0 0 20px rgba(255,193,7,0.15)",
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
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                  transform: "translateX(-100%)",
                  animation: "shimmer 2s infinite",
                }}
              />
            </div>
          </div>

          <div className="text-center mt-3 noBack">
            <p className="text-white fs-5 mb-1 noBack">
              {t("loading_colon")}{" "}
              <strong className="text-warning noBack">{progress.loaded}</strong>{" "}
              {t("of")}{" "}
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
    return (
      <div className="container py-5 text-danger text-center">{error}</div>
    );
  }

  const groupedReviews = groupByRating(reviews);

  return (
  <div className="container py-5">
    <h1 className="display-5 text-white mb-5 text-center text-uppercase fw-bold opacity-75 noBack">
      {t("my_reviews")} • {user.username}
    </h1>

    <RatingDistributionChart
      reviews={reviews}
      onRatingClick={(rating) => {
        const element = ratingRefs.current[rating];
        if (element)
          element.scrollIntoView({ behavior: "smooth", block: "center" });
      }}
    />

    {reviews.length === 0 ? (
      <div className="text-center py-5">
        <p className="text-white-50 fs-4">{t("def_no_reviews_yet")}</p>
      </div>
    ) : (
      <div className="space-y-8">
        {groupedReviews.map(({ rating, reviewsList }) => (
          <div
            key={rating}
            ref={(el) => (ratingRefs.current[rating] = el)}
            className="text-center mb-5"
          >
            <div className="d-inline-flex align-items-center gap-3 mb-5 px-4 py-2 bg-black bg-opacity-50 rounded-pill border border-warning">
              <h2 className="text-warning fs-3 fw-bold me-3">{rating}/10</h2>
              <StarRating rating={rating} />
              <span className="text-white-50 ms-3">
                (
                {reviewsList.length +
                  (rating === 6 && user?.username === "boss" ? 1 : 0)}
                )
              </span>
            </div>

            <div className="row g-4">
              {reviewsList.map((review) => {
                const td = review.title || {};
                const name = td.title || td.name || "Без названия";
                const year =
                  (td.release_date || td.first_air_date || "").split("-")[0] || "";
                const posterSrc = td.poster_path
                  ? `${IMG}${td.poster_path}`
                  : "/images/no-poster.jpg";

                return (
                  <div key={review.review_id} className="col-lg-6 col-xl-4">
                    <Link
                      to={`/title/${td.id || review.movie_id}/${review.media_type || "movie"}`}
                      className="text-decoration-none h-100 d-flex flex-column"
                      style={{
                        transition: "all 0.3s ease",
                        boxShadow: "2px 4px 15px rgba(0,0,0,0.6)",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform =
                          "scale(1.03) translateY(-8px)";
                        e.currentTarget.style.boxShadow =
                          "0 16px 40px rgba(255, 107, 0, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform =
                          "scale(1) translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 15px rgba(0,0,0,0.6)";
                      }}
                    >
                      <div className="bg-dark bg-opacity-90 rounded-4 p-4 border border-secondary h-100 d-flex flex-column">
                        <div className="row g-3 flex-grow-1">
                          <div className="col-5">
                            <img
                              src={posterSrc}
                              alt={name}
                              className="img-fluid rounded shadow w-100"
                              style={{ height: "280px", objectFit: "cover" }}
                            />
                          </div>
                          <div className="col-7 d-flex flex-column">
                            <h5 className="text-warning fw-bold hover-underline mb-1">
                              {name}{" "}
                              {year && <span className="text-white-50 ms-2">({year})</span>}
                            </h5>
                            <div
                              className="flex-grow-1 mt-2 mb-3 d-flex align-items-center justify-content-center px-3 text-white"
                              style={{ borderRadius: 6 }}
                            >
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
                                  }}
                                >
                                  {review.comment}
                                </div>
                              ) : (
                                <p className="text-white fst-italic mb-0">{t("no_comment")}</p>
                              )}
                            </div>
                            <div className="mt-auto">
                              <div className="d-flex align-items-center mb-2">
                                <span className="text-white-50 me-2">{t("rating")}</span>
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

              {/* extencio for "boss" */}
              {rating === 6 && user?.username === "boss" && (
                <div className="col-lg-6 col-xl-4">
                  <Link
                    to="/title/286801/tv"
                    className="text-decoration-none h-100 d-flex flex-column"
                    style={{
                      transition: "all 0.3s ease",
                      boxShadow: "2px 4px 15px rgba(0,0,0,0.6)",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        "scale(1.03) translateY(-8px)";
                      e.currentTarget.style.boxShadow =
                        "0 16px 40px rgba(255, 107, 0, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform =
                        "scale(1) translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 15px rgba(0,0,0,0.6)";
                    }}
                  >
                    <div className="bg-dark bg-opacity-90 rounded-4 p-4 border border-secondary h-100 d-flex flex-column">
                      <div className="row g-3 flex-grow-1">
                        <div className="col-5">
                          <img
                            src="https://m.media-amazon.com/images/M/MV5BZGY2OTcxYWItZDgxNi00Y2E1LTk0YTgtZDcwZjZkNzU4OTJjXkEyXkFqcGc@._V1_.jpg"
                            alt="Monster"
                            className="img-fluid rounded shadow w-100"
                            style={{ height: "280px", objectFit: "cover" }}
                          />
                        </div>
                        <div className="col-7 d-flex flex-column">
                          <h5 className="text-warning fw-bold hover-underline mb-1">
                            Monster: <span className="text-white-50 ms-2">(2022)</span>
                          </h5>
                          <div
                            className="flex-grow-1 mt-2 mb-3 d-flex align-items-center justify-content-center px-3 text-white"
                            style={{ borderRadius: 6 }}
                          >
                            <p className="text-white fst-italic mb-0">
                              Monster: The Ed Gein Story, The Jeffrey Dahmer Story, The Lyle and Erik Menendez Story
                            </p>
                          </div>
                          <div className="mt-auto">
                            <div className="d-flex align-items-center mb-2">
                              <span className="text-white-50 me-2">{t("rating")}</span>
                              <span className="badge bg-warning text-dark fs-5 px-3">6.0/10</span>
                            </div>
                            <small className="text-white-50">11.12.2025</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
}
