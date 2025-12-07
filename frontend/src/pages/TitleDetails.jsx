import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StarRaiting from "../components/StarRaiting";

const IMG = "https://image.tmdb.org/t/p";

export default function TitleDetails() {
  const { id, mediaType } = useParams();
  const [title, setTitle] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/get_title_details?id=${id}&media_type=${mediaType}`)
      .then(res => res.json())
      .then(data => setTitle(data))
      .catch(() => setTitle(null))
      .finally(() => setLoading(false));
  }, [id, mediaType]);

  useEffect(() => {
    setLoadingReviews(true);
    fetch(`http://localhost:5000/api/get_reviews_by_movie_id?movie_id=${id}&media_type=${mediaType}`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        const numericReviews = data.map(r => ({
          ...r,
          rating: Number(r.rating)
        }));
        setReviews(numericReviews);
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingReviews(false));
  }, [id, mediaType]);

  const userReview = user ? reviews.find(r => r.user_id === user.user_id) : null;
  useEffect(() => {
    if (userReview) {
      setNewRating(userReview.rating);
      setNewComment(userReview.comment);
    }
  }, [userReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setPosting(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:5000/api/save_review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating: newRating, movie_id: id, comment: newComment, media_type: mediaType }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post comment");

      setReviews(prev => [
        {
          user_id: user.user_id,
          username: user.username,
          rating: newRating,
          comment: newComment,
          created_at: new Date().toISOString(),
        },
        ...prev.filter(r => r.user_id !== user.user_id)
      ]);

      setNewComment("");
      setNewRating(5);
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete your review?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/delete_review?review_id=${reviewId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete review");

      setReviews(prev => prev.filter(r => r.review_id !== reviewId));

      if (userReview?.review_id === reviewId) {
        setNewComment("");
        setNewRating(5);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const formatVotes = (votes) => {
    if (!votes) return null;
    const num = parseInt(votes.replace(/,/g, ""), 10);
    if (num >= 1_000_000) { return `${(num / 1_000_000).toFixed(2).replace(/\.00$/, "")}m`; }
    if (num >= 1_000) { return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}k`; }
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-light" style={{ width: "4rem", height: "4rem" }}></div>
      </div>
    );
  }

  if (!title) {
    return (
      <div className="container text-center py-5 text-danger">
        <h2>Title not found</h2>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }

  const isMovie = mediaType === "movie";
  const name = isMovie ? title.title : title.name;
  const year = (isMovie ? title.release_date : title.first_air_date || "").split("-")[0];
  const trailerId = title.trailerUrl ? title.trailerUrl.split("v=")[1]?.split("&")[0] : null;

  return (
    <>
      <div
        className="container py-5 rounded-4 text-white"
        style={{
          background: `linear-gradient(to top, #0d0d12 0%, rgba(10,10,20,0.7) 50%, rgba(10,10,20,0.9) 100%),
                       url(${IMG}/original${title.backdrop_path || title.poster_path}) center/cover no-repeat`,
          minHeight: "90vh",
          display: "flex",
          alignItems: "flex-end",
          boxShadow: "inset 0 0 80px rgba(0,0,0,0.9)",
        }}
      >
        <div className="container pb-5">
          <div className="row align-items-end">
            <div className="col-lg-4 mb-4 mb-lg-0">
              <img
                src={title.poster_path ? `${IMG}/w780${title.poster_path}` : "/images/no-poster.jpg"}
                alt={name}
                className="img-fluid rounded-4 shadow-lg"
                style={{ border: "5px solid rgba(255,255,255,0.15)" }}
              />
            </div>

            <div className="col-lg-8">
              <h1 className="display-2 fw-bold mb-3 text-shadow">
                {name} <span className="fs-3 text-white-50">({year})</span>
              </h1>

              <div className="d-flex flex-wrap gap-3 mb-4 align-items-center">
                {user && userReview && (
                  <span className="badge bg-primary fs-4 px-4 py-2 shadow">
                    Your rating: {userReview.rating.toFixed(1)}
                  </span>
                )}
                {title.imdb_rating && (
                  <span className="badge bg-warning text-dark fs-4 px-4 py-2 shadow">
                    IMDb {title.imdb_rating}
                    {title.imdbVotes && <small className="ms-1 opacity-75">({formatVotes(title.imdbVotes)})</small>}
                  </span>
                )}
                <span className="badge bg-danger fs-5 px-4 py-2 shadow">
                  TMDB {title.vote_average?.toFixed(1)}
                </span>
                {isMovie ? (
                  <span className="badge bg-dark fs-5 px-4 py-2">{title.runtime} min</span>
                ) : (
                  <span className="badge bg-dark fs-5 px-4 py-2">
                    {title.number_of_seasons} season{title.number_of_seasons !== 1 ? "s" : ""} • {title.number_of_episodes} ep.
                  </span>
                )}
              </div>

              <div className="d-flex flex-wrap gap-2 mb-4">
                {title.genres?.map(g => (
                  <span key={g.id} className="badge bg-secondary fs-6 px-3 py-2">{g.name}</span>
                ))}
              </div>

              <div
                className="p-4 rounded-4 mb-5"
                style={{
                  background: "rgba(20, 20, 30, 0.92)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  maxWidth: "900px",
                }}
              >
                <p className="lead fs-4 mb-0 text-white noBack" style={{ lineHeight: "1.7" }}>
                  {title.overview || "No overview available."}
                </p>
              </div>

              <div className="d-flex flex-wrap gap-3">
                {title.homepage && (
                  <a href={title.homepage} target="_blank" rel="noopener noreferrer" className="btn btn-outline-light btn-lg px-5">
                    Official Site
                  </a>
                )}
                {title.imdb_id && (
                  <a href={`https://www.imdb.com/title/${title.imdb_id}`} target="_blank" rel="noopener noreferrer" className="btn btn-warning btn-lg px-5 text-dark fw-bold">
                    View on IMDb
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {trailerId && (
        <div className="container my-5 text-white noBack">
          <div 
            className="bg-black bg-opacity-90 rounded-4 row g-4"
            style={{
              background: "linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(10,10,20,0.98) 100%)",
              marginTop: "-40px"
            }}
          >
            <div className="container my-5">
              <h3 className="text-warning mb-5 fw-bold text-center fs-2">
                Official Trailer
              </h3>

              <div className="row justify-content-center">
                <div className="col-12 col-lg-10 col-xl-9">
                  <div 
                    className="ratio ratio-16x9 rounded-4 overflow-hidden shadow-2xl"
                    style={{
                      border: "4px solid rgba(255,193,7,0.4)",
                      boxShadow: "0 0 40px rgba(255,193,7,0.3), inset 0 0 20px rgba(0,0,0,0.5)",
                    }}
                  >
                    <iframe
                      src={`https://www.youtube.com/embed/${trailerId}?rel=0&modestbranding=1&controls=1&showinfo=0&autoplay=0`}
                      title="Official Trailer"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-4"
                      style={{ border: 0 }}
                    ></iframe>
                  </div>
                </div>
              </div>
              <div className="py-4"></div>
            </div>
          </div>
        </div>
      )}

      <div className="container my-5 text-white noBack">
        <div className="bg-black bg-opacity-90 rounded-4 row g-4 px-3" style={{ marginTop: "-40px" }}>
          <div className="bg-body col-lg-8 bg-transparent bg-opacity-90 rounded-4" style={{ marginBottom: "25px" }}>
            <div className="bg-dark bg-opacity-90 rounded-4 p-5 border border-secondary">
              <h3 className="mb-4 text-warning bg-dark bg-opacity-90 rounded-4">Information</h3>
              <div className="row g-4 fs-5">

                {(title.director || title.writer || title.actors) && (
                  <>
                    {title.director && title.director !== "N/A" && (
                      <div className="col-12">
                        <strong>Director:</strong> {title.director}
                      </div>
                    )}
                    {title.writer && title.writer !== "N/A" && (
                      <div className="col-12">
                        <strong>Writer:</strong> {title.writer}
                      </div>
                    )}
                    {title.actors && (
                      <div className="col-12">
                        <strong>Starring:</strong> {title.actors}
                      </div>
                    )}
                    <div className="col-12"><hr className="border-secondary" /></div>
                  </>
                )}

                {isMovie ? (
                  <>
                    <div className="col-md-6">
                      <strong>Budget:</strong> {title.budget > 0 ? `$${(title.budget / 1e6).toFixed(1)} million` : "—"}
                    </div>
                    <div className="col-md-6">
                      <strong>Box Office:</strong> {title.revenue > 0 ? `$${(title.revenue / 1e6).toFixed(1)} million` : "—"}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-md-6">
                      <strong>Status:</strong> {title.status || "—"}
                    </div>
                    <div className="col-md-6">
                      <strong>First Air Date:</strong> {title.first_air_date ? new Date(title.first_air_date).toLocaleDateString() : "—"}
                    </div>
                    <div className="col-12">
                      <strong>Networks:</strong> {title.networks?.map(n => n.name).join(", ") || "—"}
                    </div>
                  </>
                )}

                <div className="col-md-6">
                  <strong>Country:</strong> {title.production_countries?.map(c => c.name).join(", ") || "—"}
                </div>
                <div className="col-md-6">
                  <strong>Language:</strong> {title.spoken_languages?.map(l => l.english_name).join(", ") || title.original_language?.toUpperCase()}
                </div>
                <div className="col-12">
                  <strong>Production Companies:</strong> {title.production_companies?.map(c => c.name).join(", ") || "—"}
                </div>
              </div>
            </div>
          </div>

          {!isMovie && title.seasons?.length > 0 && (
            <div className="col-lg-4">
              <h3 className="mb-4 text-warning">Seasons</h3>
              {title.seasons.map(season => (
                <div key={season.id} className="d-flex align-items-center bg-dark bg-opacity-70 rounded-3 p-3 mb-3 border border-secondary">
                  <img
                    src={season.poster_path ? `${IMG}/w154${season.poster_path}` : "/images/no-poster.jpg"}
                    alt={season.name}
                    className="me-3 rounded"
                    style={{ width: "80px", height: "120px", objectFit: "cover" }}
                  />
                  <div>
                    <h6 className="mb-1">{season.name}</h6>
                    <small className="text-white-50">
                      {season.episode_count} ep. • {season.air_date?.split("-")[0] || "TBA"}
                    </small>
                    {season.vote_average > 0 && (
                      <div className="text-warning small mt-1">Rating: {season.vote_average.toFixed(1)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container my-5 text-white bg-black bg-opacity-90 rounded-4 px-4">
        <h3 className="mb-1 py-4" style={{ marginTop: "-40px" }}>
          <div className="mt-0">Reviews</div>
        </h3>
        {user && (
          <form onSubmit={handleSubmit} className="mb-0 bg-dark bg-opacity-90 rounded-4 p-3 border border-secondary rounded-3">
            <label className="form-label">Rating:</label>
            <StarRaiting rating={newRating} setRating={setNewRating} />

            <div className="mb-2 mt-2">
              <label className="form-label">Comment:</label>
              <textarea
                className="form-control"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                rows={3}
                required
              />
            </div>
            {error && <p className="text-danger">{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={posting}>
              {posting ? "Posting..." : "Post Review"}
            </button>
          </form>
        )}
        {loadingReviews ? (
          <p className="text-center py-3">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-center py-3">No reviews yet.</p>
        ) : (
          <div className="d-flex flex-column gap-4 py-4">
            {reviews.map((r) => {
              const isOwnReview = user && r.user_id === user.user_id;

              return (
                <div
                  key={r.review_id}
                  className="p-4 rounded-4 position-relative"
                  style={{
                    background: "rgba(20, 20, 30, 0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
                  }}
                >
                  {isOwnReview && (
                    <button
                      onClick={() => handleDelete(r.review_id)}
                      className="btn btn-danger btn-sm position-absolute top-50 end-0 translate-middle-y me-3"
                      style={{ zIndex: 10, fontSize: "0.8rem" }}
                    >
                      Delete
                    </button>
                  )}

                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong className="fs-5">{r.username}</strong>
                    <div className="d-flex align-items-center">
                      {Array.from({ length: 10 }).map((_, i) => {
                        const value = i + 1;
                        if (r.rating >= value) return <span key={i} style={{ color: "#ffc107" }}>★</span>;
                        if (r.rating >= value - 0.5) return <span key={i} style={{ color: "#ffc107" }}>☆</span>;
                        return <span key={i} style={{ color: "#555" }}>★</span>;
                      })}
                      <span className="ms-2 text-white-50">{r.rating}/10</span>
                    </div>
                  </div>

                  <p className="mb-2" style={{ lineHeight: "1.6", fontSize: "1rem" }}>
                    {r.comment || <span className="text-white-50 fst-italic">No comment</span>}
                  </p>
                  <small className="text-white-50">
                    {new Date(r.created_at).toLocaleDateString()}
                  </small>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}