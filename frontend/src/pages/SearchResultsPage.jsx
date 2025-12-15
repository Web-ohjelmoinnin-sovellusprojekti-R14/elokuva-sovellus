import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import ClickablePoster from "../components/ClickablePoster";
import { useAuth } from "../context/AuthContext";

const ITEMS_PER_PAGE = 18;
 
export default function SearchResultsPage() {
<<<<<<< Updated upstream
=======
  const { t, getTmdbLanguage } = useTranslation();
>>>>>>> Stashed changes
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get("q") || "";

  const [allItems, setAllItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  //const hasFetched = useRef(false);

  useEffect(() => {
    const loadPages = async () => {
      try {
        setLoading(true);
        setError(null);
        const arr = [];

        let page = 1;
        let hasMore = true;

        while (hasMore && page <= 2) {
          const res = await fetch(
            `http://localhost:5000/api/titlesearch?q=${encodeURIComponent(query)}&page=${page}&language=${getTmdbLanguage()}`
          );
          const data = await res.json();

          if (!data?.results?.length) {
            hasMore = false;
          } else {
            arr.push(...data.results);
            if (data.results.length < 20) hasMore = false;
            page++;
          }
        }

        setAllItems(arr);
        setCurrentPage(1);
      } catch (err) {
        console.error(err);
        setError("Cannot load search results");
      } finally {
        setLoading(false);
      }
    };

    if (query) { loadPages(); }
    else { setAllItems([]); }
  }, [query, getTmdbLanguage]);

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

  const totalItems = allItems.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = allItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return (
      <section className="popular container-md text-center py-5">
        <p className="text-white" style={{ fontSize: "1.5rem" }}>
          Loading search results...
        </p>
      </section>
    );
  }

  if (error) return <p className="text-danger text-center">{error}</p>;

  return (
    <section className="popular container-md py-5">
      <h2 className="title-bg mb-4 text-white noBack">
        Search Results for "{query}" ({totalItems})
      </h2>

      {pageItems.length > 0 ? (
        <>
          <div className="row g-3 g-md-4 px-2">
            {pageItems.map((item) => {
              const poster = item.poster_path
                ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                : "/images/no-poster.png";

              return (
                <div
                  key={item.id}
                  className="col-6 col-md-4 col-lg-2 text-center movie-card"
                  style={{ position: "relative" }}
                >
                  {item.imdb_rating && (
                    <div className="imdb-badge">⭐ {item.imdb_rating}</div>
                  )}
                  {user && userReviews[item.id] && (
                    <div className="user-badge"> ✭ {userReviews[item.id]} </div>
                  )}
                  <ClickablePoster item={item} />
                  <div className="movie-title-parent">
                    <p
                      className="movie-title text-white"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {item.title || item.name}
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
        <p className="text-white text-center">Nothing found.</p>
      )}
    </section>
  );
}