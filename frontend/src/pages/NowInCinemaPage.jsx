import React, { useEffect, useState, useRef} from "react";
import ClickablePoster from "../components/ClickablePoster";
import { useAuth } from "../context/AuthContext";

const MOVIES_PER_PAGE = 18;

export default function NowInCinemaPage() {
  const [allMovies, setAllMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasFetched = useRef(false);
  const { user } = useAuth();

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchAllPages = async () => {
      setLoading(true);
      setError(null);
      const movies = [];

      try {
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const res = await fetch(
            `http://localhost:5000/api/now_in_cinema?page=${page}`
          );
          const data = await res.json();

          if (!data || !data.results || data.results.length === 0) {
            hasMore = false;
          } else {
            movies.push(...data.results);
            if (data.results.length < 20) hasMore = false;
            page++;
          }
        }

        setAllMovies(movies);
      } catch (err) {
        console.error("Error loading films:", err);
        setError("Cannot load films");
      } finally {
        setLoading(false);
      }
    };

    fetchAllPages();
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

  const totalMovies = allMovies.length;
  const totalPages = Math.ceil(totalMovies / MOVIES_PER_PAGE);
  const startIndex = (currentPage - 1) * MOVIES_PER_PAGE;
  const currentMovies = allMovies.slice(
    startIndex,
    startIndex + MOVIES_PER_PAGE
  );

  if (loading) {
    return (
      <section className="popular container-md text-center py-5">
        <p className="text-white" style={{ fontSize: "1.5rem" }}>
          Loading In Cinema films...
        </p>
      </section>
    );
  }

  if (error) { return <p className="text-danger text-center">{error}</p>; }

  return (
    <section className="popular container-md py-5">
      <h2 className="title-bg mb-4 text-white noBack">
        Now in Cinemas ({totalMovies} films)
      </h2>

      {currentMovies.length > 0 ? (
        <>
          <div className="row g-3 g-md-4 px-2">
            {currentMovies.map((movie) => {
              const poster = movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : "/images/no-poster.png";

              return (
                <div
                  key={movie.id}
                  className="col-6 col-md-4 col-lg-2 text-center movie-card"
                  style={{ position: "relative" }}
                >
                  {movie.imdb_rating && (<div className="imdb-badge">⭐ {movie.imdb_rating}</div>)}
                  {user && userReviews[movie.id] && (
                    <div className="user-badge"> ✭ {userReviews[movie.id]} </div>
                  )}
                  <ClickablePoster item={movie} />
                {/*
                  <img
                    src={poster}
                    alt={movie.title}
                    className="img-fluid rounded"
                    style={{
                      boxShadow: "0 4px 15px rgba(0,0,0,0.6)",
                      height: "280px",
                      objectFit: "cover",
                      width: "100%"
                    }}
                  />
                */}
                  <div class = "movie-title-parent">
                  <p className="movie-title text-white" style={{ fontSize: "0.9rem" }}>
                      {movie.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="text-center my-5">
              <button
                className="btn btn-outline-light me-3"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                ← Previous
              </button>

              <span
                className="text-white noBack mx-4"
                style={{ fontSize: "1.1rem" }}
              >
                Page <strong>{currentPage}</strong> From{" "}
                <strong>{totalPages}</strong>
              </span>

              <button
                className="btn btn-outline-light ms-3"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-white text-center">
          Not found current films from Cinemas.
        </p>
      )}
    </section>
  );
}