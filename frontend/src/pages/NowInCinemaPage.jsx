import React, { useEffect, useState, useRef } from "react";
import ClickablePoster from "../components/ClickablePoster";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../hooks/useTranslation";

const API_URL = process.env.REACT_APP_API_URL;

const MOVIES_PER_PAGE = 18;

export default function NowInCinemaPage() {
  const { t, getTmdbLanguage } = useTranslation();

  const [allMovies, setAllMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    const fetchAllPages = async () => {
      setLoading(true);
      setError(null);
      setAllMovies([]);
      setCurrentPage(1);
      const movies = [];

      try {
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const res = await fetch(
            `${API_URL}/api/now_in_cinema?page=${page}&language=${getTmdbLanguage()}`
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
          const key = `${r.media_type || "movie"}-${r.movie_id}`;
          reviewMap[key] = r.rating;
        });
        setUserReviews(reviewMap);
      })
      .catch((err) => console.error(err));
  }, [user]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentPage]);

  const [dots, setDots] = useState([]);
  const lineRef = useRef(null);

  const [animateKey, setAnimateKey] = useState(0);

  useEffect(() => {
    setAnimateKey(k => k + 1);
  }, [currentPage, loading]);

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
          {t("loading_in_cinema")}
        </p>
      </section>
    );
  }

  if (error) {
    return <p className="text-danger text-center">{error}</p>;
  }

  return (
    <section className="popular container-md py-5">
      <h2 className="title-bg mb-4 py-2 withMargin text-white">
        {t("now_in_cinemas")} ({totalMovies} {t("def_films")})
        <div className="title-bg-line" ref={lineRef}>
          {dots} {/**/}
        </div>
      </h2>
      {currentMovies.length > 0 ? (
        <>
          <div className="row g-3 g-md-4 px-2">
            {currentMovies.map((movie, index) => {
              const mediaType = "movie";
              const poster = movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : "/images/no-poster.png";
              const COLUMNS = 6;
              const rowIndex = Math.floor(index / COLUMNS);
              return (
                <div
                  key={`${movie.id}-page-${currentPage}`}
                  className="col-6 col-md-4 col-lg-2 text-center movie-card"
                  style={{
                    position: "relative",
                    "--delay": `${rowIndex * 120}ms`,
                    "--duration": "480ms",
                    "--offset": rowIndex % 2 === 0 ? "120px" : "-120px",
                  }}
                >
                  {movie.imdb_rating && (
                    <div className="imdb-badge">⭐ {movie.imdb_rating}</div>
                  )}
                  {user && userReviews[`${mediaType}-${movie.id}`] && (
                    <div className="user-badge">
                      {" "}
                      ✭ {userReviews[`${mediaType}-${movie.id}`]}{" "}
                    </div>
                  )}
                  <div className="movie-card-inner text-decoration-none">
                    {user && userReviews[`${mediaType}-${movie.id}`] ? (
                      <div className="underline-animation me-auto"></div>
                    ) : (
                      <div className="underline-animation-sec me-auto"></div>
                    )}
                    <ClickablePoster item={movie} />

                    <div className="movie-title-parent">
                      <p
                        className="movie-title text-white"
                        style={{ fontSize: "0.9rem" }}
                      >
                        {movie.title}
                      </p>
                    </div>
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
                ← {t("previous")}
              </button>

              <span
                className="text-white noBack mx-4"
                style={{ fontSize: "1.1rem" }}
              >
                {t("page")} <strong>{currentPage}</strong> {t("of")}{" "}
                <strong>{totalPages}</strong>
              </span>

              <button
                className="btn btn-outline-light ms-3"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                {t("next")} →
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-white text-center">{t("no_current_films")}</p>
      )}
    </section>
  );
}
