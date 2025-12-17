import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import ClickablePoster from "../components/ClickablePoster";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../hooks/useTranslation";

const API_URL = process.env.REACT_APP_API_URL;

const ITEMS_PER_PAGE = 18;

const GENRE_MAP = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

export default function AdvancedSearchResultsPage() {
  const { t, tg, getTmdbLanguage } = useTranslation();

  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const category = params.get("category") || "movies";

  const [allItems, setAllItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const fetchBatch = async (batch = 1) => {
    if (batch === 1) {
      setLoading(true);
      setAllItems([]);
      setCurrentPage(1);
    } else {
      setLoadingMore(true);
    }

    try {
      const url = new URL(`${API_URL}/api/category/${category}`);
      url.searchParams.set("batch", batch);
      url.searchParams.set("language", getTmdbLanguage());

      for (const [key, value] of params.entries()) {
        if (key !== "category" && value && !key.includes("rating")) {
          if (key === "country") {
            url.searchParams.set("with_origin_country", value);
          } else {
            url.searchParams.set(key, value);
          }
        }
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Network error");
      const data = await res.json();

      let newItems = (data.results || []).filter(Boolean);

      const ratingMin = parseFloat(params.get("rating_min") || 0);
      const ratingMax = parseFloat(params.get("rating_max") || 10);
      const yearFrom = parseInt(params.get("year_from") || 0);
      const yearTo = parseInt(params.get("year_to") || 9999);

      newItems = newItems.filter((item) => {
        const rating = parseFloat(item.imdb_rating || 0);
        if (rating < ratingMin || rating > ratingMax) return false;

        const yearStr = item.release_date || item.first_air_date || "";
        const year = parseInt(yearStr.slice(0, 4));
        if (year < yearFrom || year > yearTo) return false;

        if (params.get("adult") === "0" && item.adult) return false;

        return true;
      });

      if (ratingMin > 0 || ratingMax < 10) {
        newItems.sort(
          (a, b) => parseFloat(b.imdb_rating) - parseFloat(a.imdb_rating)
        );
      }

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

  const { user } = useAuth();

  useEffect(() => {
    setAllItems([]);
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
    fetchBatch(1);
  }, [location.search, getTmdbLanguage]);

  const [userReviews, setUserReviews] = useState({});

  useEffect(() => {
    if (!user) return;

    fetch(`${API_URL}/api/get_reviews_by_user_id?user_id=${user.user_id}`, {
      credentials: "include",
    })
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
    const baseTitle = t(
      category === "series"
        ? "series"
        : category === "anime"
          ? "anime"
          : category === "cartoons"
            ? "cartoons"
            : "films"
    );

    const filters = [];

    const genreParam = params.get("with_genres");
    if (genreParam) {
      const genreNames = genreParam
        .split(",")
        .map((id) => {
          const eng = GENRE_MAP[id];
          return eng ? tg(eng) || eng : `Genre ${id}`;
        })
        .filter(Boolean);
      if (genreNames.length) filters.push(genreNames.join(" + "));
    }

    const from = params.get("year_from");
    const to = params.get("year_to");
    if (from || to) filters.push(`${from || "..."}–${to || "..."}`);

    const ratingMin = params.get("rating_min");
    const ratingMax = params.get("rating_max");
    if (ratingMin || ratingMax) {
      if (ratingMin && ratingMax)
        filters.push(
          t("rating_range")
            .replace("{min}", ratingMin)
            .replace("{max}", ratingMax)
        );
      else if (ratingMin)
        filters.push(t("rating_from").replace("{min}", ratingMin));
      else if (ratingMax)
        filters.push(t("rating_up_to").replace("{max}", ratingMax));
    }

    if (params.get("adult") === "0") filters.push(t("under_18"));

    const country = params.get("country");
    if (country) filters.push(country);

    return filters.length ? `${baseTitle} — ${filters.join(" + ")}` : baseTitle;
  };

  if (loading && allItems.length === 0) {
    const baseTitle = t(
      category === "series"
        ? "series"
        : category === "anime"
          ? "anime"
          : category === "cartoons"
            ? "cartoons"
            : "films"
    );

    const filters = [];

    const genreParam = params.get("with_genres");
    if (genreParam) {
      const genreNames = genreParam
        .split(",")
        .map((id) => {
          const eng = GENRE_MAP[id];
          return eng ? tg(eng) || eng : `Genre ${id}`;
        })
        .filter(Boolean);
      if (genreNames.length) filters.push(genreNames.join(" + "));
    }

    const from = params.get("year_from");
    const to = params.get("year_to");
    if (from || to) filters.push(`${from || "..."}–${to || "..."}`);

    const ratingMin = params.get("rating_min");
    const ratingMax = params.get("rating_max");
    if (ratingMin || ratingMax) {
      if (ratingMin && ratingMax)
        filters.push(
          t("rating_range")
            .replace("{min}", ratingMin)
            .replace("{max}", ratingMax)
        );
      else if (ratingMin)
        filters.push(t("rating_from").replace("{min}", ratingMin));
      else if (ratingMax)
        filters.push(t("rating_up_to").replace("{max}", ratingMax));
    }

    if (params.get("adult") === "0") filters.push(t("under_18"));

    const country = params.get("country");
    if (country) filters.push(country);

    const loadingText = [
      t("def_loading"),
      baseTitle.toLowerCase(),
      filters.length ? "— " + filters.join(" + ") : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <section className="popular container-md text-center py-5">
        <p className="text-white" style={{ fontSize: "1.8rem" }}>
          {loadingText}...
        </p>
      </section>
    );
  }

  if (error) {
    return <p className="text-danger text-center py-5 fs-3">{error}</p>;
  }

  if (allItems.length === 0) {
    return (
      <section className="popular container-md text-center py-5">
        <p className="text-white" style={{ fontSize: "1.8rem" }}>
          {t("no_results")}
        </p>
      </section>
    );
  }

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
