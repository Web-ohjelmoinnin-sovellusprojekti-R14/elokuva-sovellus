import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";

const IMG = "https://image.tmdb.org/t/p/w300";
const API_URL = process.env.REACT_APP_API_URL;

const groupByRating = (reviews) => {
  const groups = {};

  reviews.forEach((review) => {
    const rating = parseFloat(review.rating);
    if (!groups[rating]) groups[rating] = [];
    groups[rating].push(review);
  });

  return Object.entries(groups)
    .sort(([a], [b]) => b - a)
    .map(([rating, reviewsList]) => ({
      rating: parseFloat(rating),
      reviewsList,
    }));
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

const RatingDistributionChart = ({ reviews, onRatingClick, watchtime = 0, rating = 0 }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const effectiveReviews = [...reviews];

  const isBossProfile = reviews.some(r => r.username === "boss");

  if (isBossProfile) {
    effectiveReviews.push({ rating: 6 });
  }

  const histogram = {};
  for (let i = 10; i >= 1; i -= 0.5) {
    histogram[i.toFixed(1)] = 0;
  }

  effectiveReviews.forEach((review) => {
    const rating = parseFloat(review.rating);
    const rounded = Math.round(rating * 2) / 2;
    const key = rounded.toFixed(1);
    if (histogram[key] !== undefined) histogram[key]++;
  });

  const formatHours = (value) => {
    if (!value) return 0;
    if (value >= 10000) return `${(value / 1000).toFixed(1)}k`;
    if (value >= 1000) return `${Math.floor(value / 1000)}k`;
    return value;
  };

  const getFontSize = (value) => {
    const len = value.toString().length;
    if (len >= 7) return "0.8rem";
    if (len >= 6) return "0.9rem";
    if (len >= 5) return "1rem";
    if (len >= 4) return "1.2rem";
    return "1.4rem";
  };

  const maxCount = Math.max(...Object.values(histogram), 1);
  const totalReviews = effectiveReviews.length;
  const avgRating =
    totalReviews > 0
      ? (
          effectiveReviews.reduce((sum, r) => sum + parseFloat(r.rating), 0) /
          totalReviews
        ).toFixed(1)
      : "—";

  return (
    <div className="position-relative p-4 bg-black bg-opacity-50 rounded-4 border border-warning border-1 shadow-sm">
      <div className="d-flex align-items-center justify-content-center justify-content-md-between mb-3">
        <h4 className="text-warning fw-bold mb-0 fs-5">
          {t("user_reviews_distribution")}{" "}
          {totalReviews > 0 && (
            <small className="text-white-50 ms-2">({totalReviews})</small>
          )}
        </h4>
      </div>
  
  <div className="position-absolute top-0 end-0 m-4 d-none d-md-flex gap-3">
    {[{ value: watchtime, label: t("hours_watched") }, { value: rating, label: t("site_rating") }].map((item, idx) => (
      <div key={idx} className="d-flex flex-column align-items-center">
        <div
          className="rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center shadow-lg"
          style={{ width: "50px", height: "50px", minWidth: "50px" }}
        >
          <span
            className="fw-bold d-flex align-items-baseline justify-content-center text-nowrap"
            style={{ fontSize: getFontSize(formatHours(item.value)), lineHeight: 1 }}
          >
            {formatHours(item.value)}
          </span>
        </div>
        <span className="text-white-50 mt-1">{item.label}</span>
      </div>
    ))}
  </div>

  <div className="d-flex flex-wrap justify-content-center gap-3 mb-4 d-md-none">
    {[{ value: watchtime, label: t("hours_watched") }, { value: rating, label: t("site_rating") }].map((item, idx) => (
      <div key={idx} className="d-flex flex-column align-items-center">
        <div
          className="rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center shadow-lg"
          style={{ width: "45px", height: "45px", minWidth: "45px" }}
        >
          <span
            className="fw-bold d-flex align-items-baseline justify-content-center text-nowrap"
            style={{ fontSize: getFontSize(formatHours(item.value)), lineHeight: 1 }}
          >
            {formatHours(item.value)}
          </span>
        </div>
        <small className="text-white-50 mt-1">{item.label}</small>
      </div>
    ))}
  </div>

  <div className="text-center mb-4">
    <div className="d-inline-flex align-items-center gap-3 bg-dark bg-opacity-80 px-4 py-3 rounded-3 border border-secondary">
      <div>
        <div className="fs-2 text-warning fw-bold lh-1">{avgRating}</div>
        <small className="text-white-50">{t("mid")}</small>
      </div>
    </div>
  </div>

  <div className="row g-1 justify-content-center align-items-end">
    {Object.entries(histogram)
      .reverse()
      .map(([ratingVal, count]) => (
        <div
          key={ratingVal}
          className="col text-center"
          style={{ cursor: count > 0 ? "pointer" : "default" }}
          onClick={() => count > 0 && onRatingClick?.(parseFloat(ratingVal))}
          title={count > 0 ? `${count} ${ratingVal}` : ""}
        >
          <div className="mx-auto mb-1 position-relative" style={{ height: "70px", width: "18px" }}>
            <div
              className={`rating-bar w-100 position-absolute bottom-0 rounded-top transition-all ${count > 0 ? "active" : ""}`}
              style={{
                height: `${(count / maxCount) * 100}%`,
                background: count > 0 ? "linear-gradient(to top, #0066ff, #00ccff)" : "rgba(255,255,255,0.08)",
                borderRadius: "4px 4px 0 0",
                boxShadow: count > 0 ? "0 0 12px rgba(0, 200, 255, 0.5)" : "none",
                transition: "all 0.3s ease",
              }}
            />
          </div>
          <div className="text-white-50 text-xs">{ratingVal}</div>
          {count > 0 && <div className="text-info fw-bold text-xs">{count}</div>}
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

export default function UserReviewsPage() {
  const { t, getTmdbLanguage } = useTranslation();
  const { user: currentUser } = useAuth();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const queryUserId = query.get("user_id");

  const [targetUserId, setTargetUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });
  const [watchtime, setWatchtime] = useState(0);
  const [rating, setRating] = useState(0);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const maxAttempts = 5;
  const ratingRefs = useRef({});
  const accumulatedReviews = useRef([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const effectiveUserId = queryUserId || (currentUser ? currentUser.user_id : null);

    if (!effectiveUserId) {
      setLoading(false);
      setError("No user ID provided");
      return;
    }

    setTargetUserId(effectiveUserId);
  }, [queryUserId, currentUser?.user_id]);

  useEffect(() => {
    if (!targetUserId) return;

    setLoading(true);
    setProgress({ loaded: 0, total: 0 });
    accumulatedReviews.current = [];
    setConnectionAttempts(0);
    setError(null);
    setUsername(null);

    const isOwnProfile = currentUser && currentUser.user_id === Number(targetUserId);

    let evtSource = null;

    const connectSSE = () => {
      const language = getTmdbLanguage();
      let url;

      if (isOwnProfile) {
        url = `${API_URL}/api/get_reviews_by_user_id_sse?language=${language}`;
      } else {
        url = `${API_URL}/api/get_others_reviews_by_user_id_sse?user_id=${targetUserId}&language=${language}`;
      }

      evtSource = new EventSource(url, {
        withCredentials: isOwnProfile,
      });

      evtSource.addEventListener("total", (e) => {
        try {
          const { total } = JSON.parse(e.data);
          setProgress((prev) => ({ ...prev, total }));
        } catch {}
      });

     evtSource.addEventListener("progress", (e) => {
        try {
          const data = JSON.parse(e.data);

          setProgress((prev) => ({ ...prev, loaded: data.loaded, total: data.total }));

          if (data.username && !username) {
            setUsername(data.username);
          }

          if (data.watchtime !== undefined) {
            setWatchtime(data.watchtime);
          }
          if (data.rating !== undefined) {
            setRating(data.rating);
          }
        } catch {}
      });

      evtSource.addEventListener("reviews", (e) => {
        try {
          const batch = JSON.parse(e.data);

          const existingIds = new Set(
            accumulatedReviews.current.map((r) => r.review_id)
          );
          const newReviews = batch.filter((r) => !existingIds.has(r.review_id));

          if (newReviews.length > 0) {
            accumulatedReviews.current = [
              ...accumulatedReviews.current,
              ...newReviews,
            ];
            setReviews([...accumulatedReviews.current]);
          }
        } catch {}
      });

      evtSource.addEventListener("complete", () => {
        setLoading(false);
        setConnectionAttempts(0);
        evtSource.close();
      });

      evtSource.addEventListener("error", (e) => {
        console.warn("SSE error:", e);
        evtSource.close();

        if (connectionAttempts < maxAttempts) {
          setConnectionAttempts((prev) => prev + 1);
          const delay = Math.pow(2, connectionAttempts) * 1000;
          setTimeout(connectSSE, delay);
        } else {
          setLoading(false);
          setError("Failed to load reviews");
        }
      });
    };

    connectSSE();

    return () => {
      if (evtSource) evtSource.close();
      setConnectionAttempts(0);
    };
  }, [targetUserId, currentUser?.user_id, getTmdbLanguage]);

  const isOwnProfile = currentUser && currentUser.user_id === Number(targetUserId);

  const isBossProfile = username === "boss";

  const displayName = isOwnProfile
    ? currentUser?.username
    : username || `User ID ${targetUserId}`;

  if (!targetUserId) {
    return <div className="text-danger text-center py-5">No user selected</div>;
  }

  if (error) {
    return <div className="text-danger text-center py-5">{error}</div>;
  }

  const groupedReviews = groupByRating(reviews);

  return (
    <div className="container py-5">
      <h1 className="display-5 text-white mb-5 text-center text-uppercase fw-bold opacity-75 noBack">
        {isOwnProfile 
          ? `${t("my_reviews")} • ${currentUser?.username}` 
          : `${t("reviews")} • ${displayName}`}
      </h1>

      <RatingDistributionChart
        reviews={reviews}
        watchtime={watchtime}
        rating={rating}
        onRatingClick={(rating) => {
          const element = ratingRefs.current[rating];
          if (element) element.scrollIntoView({ behavior: "smooth", block: "center" });
        }}
      />

      {loading && (
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
                  width: `${(progress.loaded / Math.max(progress.total, 1)) * 100}%`,
                  background:
                    "linear-gradient(90deg, #00d4ff, #ff07f3, #ff3300)",
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
                <strong className="text-warning noBack">
                  {progress.loaded}
                </strong>{" "}
                {t("of")}{" "}
                <strong className="text-warning noBack">
                  {isBossProfile
                    ? (progress.total || 0) + 1
                    : progress.total || "?"}
                </strong>
              </p>
              <p className="text-white-50 small noBack">
                {Math.round(
                  (progress.loaded / Math.max(progress.total, 1)) * 100
                )}
                %
              </p>
            </div>
          </div>
        </div>
      )}

      {reviews.length === 0 && !loading && (
        <div className="text-center py-5">
          <p className="text-white-50 fs-4">{t("def_no_reviews_yet")}</p>
        </div>
      )}

      {reviews.length > 0 && (
        <div className="space-y-8 mt-5">
          {groupedReviews.map(({ rating, reviewsList }) => (
            <div
              key={rating}
              ref={(el) => (ratingRefs.current[rating] = el)}
              className="text-center mb-5"
            >
              <div
                className="d-inline-flex align-items-center gap-3 mb-5 px-0 px-md-4 py-1 bg-black bg-opacity-50 rounded-pill border border-warning"
              >
                <h2 className="text-warning fs-3 fw-bold me-0 me-md-3 d-flex align-items-center px-2 px-md-0">
                    {rating}/10
                  </h2>
                  <StarRating rating={rating} />
                <span className="text-white-50 ms-0 ms-md-3 px-2 px-md-0 md-0 d-flex align-items-center mt-2">
                  ({reviewsList.length + (rating === 6 && isBossProfile ? 1 : 0)})
                </span>
              </div>

              <div className="row g-4">
                {reviewsList.map((review) => {
                  const td = review.details || {};
                  const name = td.title || td.name || "No Title";
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
                                {year && (
                                  <span className="text-white-50 ms-2">
                                    ({year})
                                  </span>
                                )}
                              </h5>

                              <div className="mb-2">
                                <Link
                                  to={`/user-reviews?user_id=${review.user_id}`}
                                  className="text-info text-decoration-none hover-underline"
                                >
                                  {review.username}
                                </Link>
                              </div>

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
                                  <p className="text-white fst-italic mb-0">
                                    {t("no_comment")}
                                  </p>
                                )}
                              </div>

                              <div className="mt-auto">
                                <div className="d-flex align-items-center mb-2">
                                  <span className="text-white-50 me-2">
                                    {t("rating")}
                                  </span>
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

                {rating === 6 && isBossProfile && (
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
                              Monster:{" "}
                              <span className="text-white-50 ms-2">(2022)</span>
                            </h5>
                            <div
                              className="flex-grow-1 mt-2 mb-3 d-flex align-items-center justify-content-center px-3 text-white"
                              style={{ borderRadius: 6 }}
                            >
                              <p className="text-white fst-italic mb-0">
                                Monster: The Ed Gein Story, The Jeffrey Dahmer
                                Story, The Lyle and Erik Menendez Story
                              </p>
                            </div>
                            <div className="mt-auto">
                              <div className="d-flex align-items-center mb-2">
                                <span className="text-white-50 me-2">
                                  {t("rating")}
                                </span>
                                <span className="badge bg-warning text-dark fs-5 px-3">
                                  6.0/10
                                </span>
                              </div>
                              <small className="text-white-50">
                                11.12.2025
                              </small>
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