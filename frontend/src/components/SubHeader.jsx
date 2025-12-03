import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function SubHeader() {
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [openMenu, setOpenMenu] = useState(null);

    const searchRef = useRef(null);
    const menuRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();

    const [yearFrom, setYearFrom] = useState("");
    const [yearTo, setYearTo] = useState("");
    const [ratingMin, setRatingMin] = useState("");
    const [ratingMax, setRatingMax] = useState("");
    const [country, setCountry] = useState("");
    const [include18, setInclude18] = useState(false);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [lastCategory, setLastCategory] = useState("movies");

    useEffect(() => {
        setSelectedGenres([]);
    }, [openMenu]);

    const genreMap = {
        "Action": "28",
        "Adventure": "12",
        "Comedy": "35",
        "Crime": "80",
        "Drama": "18",
        "Fantasy": "14",
        "History": "36",
        "Horror": "27",
        "Mystery": "9648",
        "Romance": "10749",
        "Sci-Fi": "878",
        "Thriller": "53",
        "War": "10752",
        "Western": "37",
        "Musical": "10402",

        "Action & Adventure": "10759",
        "Sci-Fi & Fantasy": "10765",
        "War & Politics": "10768",
        "Documentary": "99",
        "Reality": "10764",

        "Animation": "16",
        "Family": "10751"
    };

    const toggleGenre = (genreName) => {
        setSelectedGenres(prev => 
            prev.includes(genreName) ? prev.filter(g => g !== genreName) : [...prev, genreName]
        );
    };

    const handleRatingMinChange = (value) => {
        const v = Math.max(0, Math.min(10, Number(value)));
        setRatingMin(v);
        if (ratingMax && v > ratingMax) setRatingMax(v);
    };

    const handleRatingMaxChange = (value) => {
        const v = Math.max(0, Math.min(10, Number(value)));
        setRatingMax(v);
        if (ratingMin && v < ratingMin) setRatingMin(v);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) { setOpenMenu(null); }
            if (searchRef.current && !searchRef.current.contains(e.target)) { setSearchResults([]); }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        setOpenMenu(null);
    }, [location.pathname]);

    useEffect(() => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const res = await fetch(`http://localhost:5000/api/titlesearch?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setSearchResults(data.results || []);
            } catch (err) {
                console.error("Search error:", err);
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const goToSearch = () => {
        if (!query.trim()) return;

        const url = `/search?q=${encodeURIComponent(query)}`;
        navigate(url, { replace: location.pathname === "/search" });

        setOpenMenu(null);
    };

const goToFilteredSearch = () => {
  const params = new URLSearchParams();

  const categoryMap = { films: "movies", series: "series", cartoons: "cartoons", anime: "anime" };
  const selectedCategory = categoryMap[openMenu];
  if (selectedCategory) params.set("category", selectedCategory);

  if (yearFrom) params.set("year_from", yearFrom);
  if (yearTo) params.set("year_to", yearTo);
  if (ratingMin) params.set("rating_min", ratingMin);
  if (ratingMax) params.set("rating_max", ratingMax);
  if (country.trim()) params.set("country", country.trim());
  params.set("adult", include18 ? "1" : "0");

  params.delete("with_genres");
  params.delete("with_original_language");

  const genreIds = selectedGenres.map((g) => genreMap[g]).filter(Boolean);
  if (genreIds.length > 0) params.set("with_genres", genreIds.join(","));

  if (genreIds.length > 0) { params.set("with_genres", genreIds.join(","));}

  navigate(`/advanced-search?${params.toString()}`);

  setYearFrom("");
  setYearTo("");
  setRatingMin("");
  setRatingMax("");
  setCountry("");
  setInclude18(false);
  setOpenMenu(null);
};

    const menus = {
        films: ["Action", "Comedy", "Drama", "Thriller", "Horror", "Sci-Fi", "Fantasy", "War", "Crime", "Romance"],
        series: ["Action & Adventure", "Comedy", "Drama", "Sci-Fi & Fantasy", "War & Politics", "Crime", "Horror", "Mystery", "Documentary"],
        cartoons: ["Animation", "Family", "Comedy", "Adventure", "Fantasy"],
        anime: ["Animation", "Action & Adventure", "Sci-Fi & Fantasy", "Comedy", "Drama"]
    };

    const renderMenu = (items) => (
        <div className="row g-4">
            {[0, 1, 2].map((col) => (
                <div key={col} className="col-4">
                    {items.slice(col * 8, (col + 1) * 8).map((genre) => (
                        <Link
                            key={genre}
                            to={`/genre?${genre.toLowerCase().replace(/ /g, "-")}`}
                            className="d-block text-white py-2 px-3 rounded text-decoration-none hover-bg-primary"
                            style={{ fontSize: "0.95rem" }}
                            onClick={() => setOpenMenu(null)}
                        >
                            {genre}
                        </Link>
                    ))}
                </div>
            ))}
        </div>
    );

    return (
        <section className="sub-header container">
            <div className="categories" ref={menuRef}>
                {[
                    { key: "films", label: "Films", path: "/type?category=movies" },
                    { key: "series", label: "Series", path: "/type?category=series" },
                    { key: "cartoons", label: "Cartoons", path: "/type?category=cartoons" },
                    { key: "anime", label: "Anime", path: "/type?category=anime" }
                ].map(({ key, label, path }) => (
                    <div
                        key={key}
                        className="category"
                        onMouseEnter={() => { setOpenMenu(key) }}
                    >
                        <Link
                            to={path}
                            className="position-relative text-white text-decoration-none noBack"
                            style={{ zIndex: 10 }}
                        >
                            {label}
                        </Link>

                        {openMenu === key && (
                            <div
                                className="mega-menu active"
                                onMouseEnter={() => setOpenMenu(key)}
                                onMouseLeave={() => setOpenMenu(null)}
                            >
                                <div
                                    className="text-white-50 mb-4 fw-bold"
                                    style={{ fontSize: "1.1rem" }}
                                >
                                    {label} — Genres & Subgenres
                                </div>

                                {/*{renderMenu(menus[key])}*/}

                                <div className="row g-3 mb-3">
                                    {menus[key].map((genre) => {
                                        const isActive = selectedGenres.includes(genre);
                                        return (
                                            <div key={genre} className="col-4">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleGenre(genre)}
                                                    className={`btn btn-sm w-100 text-start d-flex justify-content-between align-items-center ${
                                                        isActive
                                                            ? "btn-primary text-white"
                                                            : "btn-outline-light text-white-50 border-secondary"
                                                    }`}
                                                >
                                                    <span>{genre}</span>
                                                    {isActive && <strong className="ms-2">✓</strong>}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>

                                {selectedGenres.length > 0 && (
                                    <div className="alert alert-dark py-2 mb-3 small" role="alert">
                                        <strong>Selected:</strong> {selectedGenres.join(" + ")}
                                    </div>
                                )}

                                <div className="mt-4 p-3 rounded" style={{ background: "#1a1a1a", border: "1px solid #444" }}>
                                <div className="text-white-50 fw-bold mb-3" style={{ fontSize: "1rem" }}>
                                    Advanced Filters
                                </div>

                                <div className="row g-3">

                                    <div className="col-6">
                                        <label className="text-white-50 small">Year (from)</label>
                                        <input
                                            type="number"
                                            className="form-control bg-dark text-white border-secondary"
                                            value={yearFrom}
                                            onChange={(e) => setYearFrom(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label className="text-white-50 small">Year (to)</label>
                                        <input
                                            type="number"
                                            className="form-control bg-dark text-white border-secondary"
                                            value={yearTo}
                                            onChange={(e) => setYearTo(e.target.value)}
                                        />
                                    </div>

                                    <div className="col-6">
                                        <label className="text-white-50 small">Min Rating</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            className="form-control bg-dark text-white border-secondary"
                                            value={ratingMin}
                                            onChange={(e) => handleRatingMinChange(e.target.value)}
                                        />
                                    </div>

                                    <div className="col-6">
                                        <label className="text-white-50 small">Max Rating</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            className="form-control bg-dark text-white border-secondary"
                                            value={ratingMax}
                                            onChange={(e) => handleRatingMaxChange(e.target.value)}
                                        />
                                    </div>

                                    <div className="col-12 d-flex align-items-center mt-1">
                                        <input
                                            type="checkbox"
                                            id="adultToggle"
                                            className="form-check-input me-2"
                                            checked={include18}
                                            onChange={() => setInclude18(!include18)}
                                        />
                                        <label htmlFor="adultToggle" className="text-white-50 small">
                                            Include 18+ content
                                        </label>
                                    </div>

                                    <div className="col-12">
                                        <button
                                            className="btn btn-primary w-100 mt-2"
                                            onClick={goToFilteredSearch}
                                        >
                                            Apply Filters
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        )}
                    </div>
                ))}

                <Link
                    to="/now-in-cinema"
                    className="category text-white text-decoration-none"
                    onMouseEnter={() => setOpenMenu(null)}
                >
                    In cinemas
                </Link>
            </div>

            <div className="search-box position-relative" ref={searchRef}>
                <img src="images/searchMain.png" alt="Search" className={`search-icon ${searchLoading ? "searching" : ""}`} />

                <input
                    type="text"
                    placeholder="Search..."
                    className="search-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") goToSearch();
                    }}
                    onFocus={() => setOpenMenu(null)}
                />

                {query && (
                    <div
                        className="search-dropdown shadow-lg"
                        style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            width: "100%",
                            background: "#fff",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            zIndex: 10,
                            maxHeight: "300px",
                            overflowY: "auto",
                            marginTop: "4px",
                            padding: "4px"
                        }}
                    >
                        {searchLoading && <div className="p-2">Loading...</div>}

                        {!searchLoading &&
                            searchResults.length > 0 &&
                            searchResults.slice(0, 5).map((item) => (
                                <div
                                    key={item.id}
                                    className="search-item p-2 d-flex justify-content-between align-items-center"
                                    style={{
                                        cursor: "pointer",
                                        borderBottom: "1px solid #eee"
                                    }}
                                    onClick={goToSearch}
                                >
                                    <span style={{ flex: 1 }}>
                                        {item.title || item.name} ({item.media_type})
                                    </span>

                                    {item.imdb_rating && (
                                        <span
                                            style={{
                                                color: "#2a2a49",
                                                fontWeight: "bold",
                                                marginLeft: "8px",
                                                flexShrink: 0
                                            }}
                                        >
                                            ⭐ {item.imdb_rating}
                                        </span>
                                    )}
                                </div>
                            ))}

                        {!searchLoading && searchResults.length > 5 && (
                            <button
                                className="btn btn-primary w-100 mt-2"
                                onClick={goToSearch}
                            >
                                Show All Results
                            </button>
                        )}

                        {!searchLoading && searchResults.length === 0 && (
                            <div className="p-2">No results</div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

export default SubHeader;