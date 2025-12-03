import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ClickablePoster from "../components/ClickablePoster";

const ITEMS_PER_PAGE = 18;

export default function SearchResultsPage() {
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

    const fetchBatch = async (batch = 1) => {
        if (batch === 1) setLoading(true);
        else setLoadingMore(true);

        try {
            let url = "";

            if (q) {
                url = `http://localhost:5000/api/titlesearch?q=${encodeURIComponent(q)}&page=${batch}`;
            } else if (category) {
                url = `http://localhost:5000/api/category/${category}?batch=${batch}`;
            }

            const res = await fetch(url);
            if (!res.ok) throw new Error("Network error");

            const data = await res.json();
            const newItems = (data.results || []).filter(Boolean);

            setAllItems(prev => (batch === 1 ? newItems : [...prev, ...newItems]));
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
    }, [location.search]);

    const totalLoadedItems = allItems.length;
    const totalPagesAvailable = Math.ceil(totalLoadedItems / ITEMS_PER_PAGE);
    const isOnLastPage = currentPage >= totalPagesAvailable;

    const goNext = () => {
        if (isOnLastPage && hasMore) {
            const nextBatch = Math.floor((totalLoadedItems - 1) / 110) + 2;
            fetchBatch(nextBatch);
        }
        setCurrentPage(p => p + 1);
    };

    const goPrev = () => {
        if (currentPage > 1) setCurrentPage(p => p - 1);
    };

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = allItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const getTitle = () => {
        if (q) return `Search: "${q}"`;

        const map = {
            movies: "Films",
            series: "Series",
            anime: "Anime",
            cartoons: "Cartoons"
        };

        return map[category] || "Content";
    };

    if (loading && allItems.length === 0) {
        return (
            <section className="popular container-md text-center py-5">
                <p className="text-white" style={{ fontSize: "1.8rem" }}>
                    Loading {getTitle().toLowerCase()}...
                </p>
            </section>
        );
    }

    if (error) return <p className="text-danger text-center">{error}</p>;

    return (
        <section className="popular container-md" style={{ padding: "60px 0" }}>
            <h2 className="title-bg mb-4 text-white noBack">
                {getTitle()} ({totalLoadedItems}{hasMore ? "" : "."})
            </h2>

            <div className="row g-3">
                {pageItems.map(item => (
                    <div
                        key={`${item.id}-${item.media_type || "movie"}`}
                        className="col-6 col-md-4 col-lg-2 text-center movie-card"
                        style={{ position: "relative" }}
                    >
                        {item.imdb_rating && (
                            <div className="imdb-badge">⭐ {item.imdb_rating}</div>
                        )}
{/*
                        <img
                            src={
                                item.poster_path
                                    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                                    : "/images/no-poster.png"
                            }
                            alt={item.title || item.name}
                            className="img-fluid rounded"
                            style={{
                                height: "280px",
                                objectFit: "cover",
                                width: "100%",
                                boxShadow: "0 4px 15px rgba(0,0,0,0.6)"
                            }}
                        />
*/}
                        <ClickablePoster item={item} />

                        <div className="movie-title-parent">
                            <p className="movie-title text-white" style={{ fontSize: "0.9rem" }}>
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
                    ← Previous
                </button>

                <span
                    className="text-white mx-4 noBack"
                    style={{ fontSize: "1.1rem" }}
                >
                    Page <strong>{currentPage}</strong> of{" "}
                    <strong>{totalPagesAvailable}{hasMore ? "+" : ""}</strong>
                </span>

                <button
                    className="btn btn-outline-light ms-3"
                    onClick={goNext}
                    disabled={loadingMore || (!hasMore && isOnLastPage)}
                >
                    {loadingMore ? "Loading..." : "Next →"}
                </button>
            </div>

            {!hasMore && isOnLastPage && totalLoadedItems > 0 && (
                <p className="text-center text-white-50 mt-4">
                    You've seen everything!
                </p>
            )}
        </section>
    );
}