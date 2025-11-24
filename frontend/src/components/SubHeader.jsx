import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

function SubHeader() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchRef = useRef(null);

  // Close dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/titlesearch?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  const displayedResults = results.slice(0, 5);

  return (
    <section className="sub-header container" ref={searchRef}>
      <div className="categories">
        <a href="#films" className="category">Films</a>
        <a href="#series" className="category">Series</a>
        <a href="#cartoons" className="category">Cartoons</a>
        <a href="#anime" className="category">Anime</a>
        <Link to="/now-in-cinema" className="category">In cinemas</Link>
      </div>

      <div className="search-box position-relative">
        <img src="images/searchMain.png" alt="Search" className="search-icon" />
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Dropdown */}
        {query && (
          <div
            className="search-dropdown"
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
            {loading && <div className="p-2">Loading...</div>}

            {!loading && displayedResults.length > 0 &&
              displayedResults.map((item) => (
                <div
                  key={item.id}
                  className="search-item p-2 d-flex justify-content-between align-items-center"
                  style={{ cursor: "pointer", borderBottom: "1px solid #eee" }}
                >
                  <span style={{ flex: 1 }}>
                    {item.title || item.name} ({item.media_type})
                  </span>
                  {item.imdb_rating && (
                    <span style={{ color: "#2a2a49", fontWeight: "bold", marginLeft: "8px", flexShrink: 0 }}>
                      ⭐ {item.imdb_rating}
                    </span>
                  )}
                </div>
              ))
            }

            {!loading && results.length > 5 && (
              <button
                className="btn btn-primary w-100 mt-2"
              >
                Show All Results
              </button>
            )}

            {!loading && results.length === 0 && <div className="p-2">No results</div>}
          </div>
        )}
      </div>
    </section>
  );
}

export default SubHeader;
