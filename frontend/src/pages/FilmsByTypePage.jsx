import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ClickablePoster from "../components/ClickablePoster";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../hooks/useTranslation";

const ITEMS_PER_PAGE = 18;

export default function SearchResultsPage() {
  const { t, getTmdbLanguage } = useTranslation();

  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const q = params.get("q")?.trim() || "";
  const category = params.get("category");

  const [allItems, setAllItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchBatch = async (batch = 1) => {
    if (batch === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      let url = "";

      if (q) {
        url = `http://localhost:5000/api/titlesearch?q=${encodeURIComponent(q)}&page=${batch}&language=${getTmdbLanguage()}`;
      } else if (category) {
        url = `http://localhost:5000/api/category/${category}?batch=${batch}&language=${getTmdbLanguage()}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Network error");

      const data = await res.json();
      const newItems = (data.results || []).filter(Boolean);

      setAllItems((prev) => (batch === 1 ? newItems : [...prev, ...newItems]));
      setHasMore(data.hasMore !== false);
    } catch (err) {
      console.error(err);
      setError("Failed to load");
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setAllItems([]);
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
    fetchBatch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, getTmdbLanguage]);

  const [userReviews, setUserReviews] = useState({});

  useEffect(() => {
    if (!user) return;

    fetch(
      `http://localhost:5000/api/get_reviews_by_user_id?user_id=${user.user_id}`,
      {
        credentials: "include",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const reviewMap = {};
        data.forEach((r) => {
          reviewMap[`${r.movie_id}`] = r.rating;
        });
        setUserReviews(reviewMap);
      })
      .catch((err) => console.error(err));
  }, [user]);

  const totalLoadedItems = allItems.length;
  const totalPagesAvailable = Math.ceil(totalLoadedItems / ITEMS_PER_PAGE);
  const isOnLastPage = currentPage >= totalPagesAvailable;

  const goNext = () => {
    if (isOnLastPage && hasMore) {
      const nextBatch = Math.floor((totalLoadedItems - 1) / 110) + 2;
      fetchBatch(nextBatch);
    }
    setCurrentPage((p) => p + 1);
  };

  const goPrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = allItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getTitle = () => {
    if (q) return `Search: "${q}"`;

    const map = {
      movies: "Films",
      series: "Series",
      anime: "Anime",
      cartoons: "Cartoons",
    };

    return map[category] || "Content";
  };

  if (loading && allItems.length === 0) {
    const categoryKey = q ? "search" : category ? category : "content";
    return (
      <section className="popular container-md text-center py-5">
        <p className="text-white" style={{ fontSize: "1.8rem" }}>
          {t("def_loading")}{" "}
          {t(`loading_category_${category || (q ? "search" : "content")}`)}...
        </p>
      </section>
    );
  }

  if (error) return <p className="text-danger text-center">{error}</p>;

  return (
    <section className="popular container-md py-5">
      <h2 className="title-bg mb-4 text-white noBack">
        {getTitle()} ({totalLoadedItems}
        {hasMore ? "" : "."})
      </h2>

      <div className="row g-3 g-md-4 px-2">
        {pageItems.map((item) => (
          <div
            key={`${item.id}-${item.media_type || "movie"}`}
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
        ))}
      </div>

      <div className="text-center my-5">
        <button
          className="btn btn-outline-light me-3"
          disabled={currentPage === 1}
          onClick={goPrev}
        >
          ← {t("previous")}
        </button>

        <span className="text-white mx-4 noBack" style={{ fontSize: "1.1rem" }}>
          {t("page")} <strong>{currentPage}</strong> {t("of")}{" "}
          <strong>
            {totalPagesAvailable}
            {hasMore ? "+" : ""}
          </strong>
        </span>

        <button
          className="btn btn-outline-light ms-3"
          onClick={goNext}
          disabled={loadingMore || (!hasMore && isOnLastPage)}
        >
          {loadingMore ? t("def_loading") : <> {t("next")} →</>}
        </button>
      </div>

      {!hasMore && isOnLastPage && totalLoadedItems > 0 && (
        <p className="text-center text-white-50 mt-4">{t("seen_everything")}</p>
      )}
    </section>
  );
}
