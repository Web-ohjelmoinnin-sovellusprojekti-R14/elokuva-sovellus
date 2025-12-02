import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const IMG = "https://image.tmdb.org/t/p";

export default function TitleDetails() {
  const { id, mediaType } = useParams();
  const [title, setTitle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/get_title_details?id=${id}&media_type=${mediaType}`)
      .then(res => res.json())
      .then(data => setTitle(data))
      .catch(() => setTitle(null))
      .finally(() => setLoading(false));
  }, [id, mediaType]);

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
                {title.imdb_rating && (
                  <span className="badge bg-warning text-dark fs-4 px-4 py-2 shadow">
                    IMDb {title.imdb_rating}
                  </span>
                )}
                <span className="badge bg-primary fs-5 px-4 py-2 shadow">
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
                  <a
                    href={`https://www.imdb.com/title/${title.imdb_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-warning btn-lg px-5 text-dark fw-bold"
                  >
                    View on IMDb
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container my-5 text-white">
        <div className="bg-black bg-opacity-90 rounded-4 row g-5" style={{ marginTop: "-40px"}}>
          <div className="bg-body col-lg-8 bg-transparent bg-opacity-90 rounded-4" style={{ marginBottom: "45px"}}>
            <div className="bg-dark bg-opacity-90 rounded-4 p-5 border border-secondary">
              <h3 className="mb-4 text-warning bg-dark bg-opacity-90 rounded-4">Information</h3>
              <div className="row g-4 fs-5">
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
    </>
  );
}