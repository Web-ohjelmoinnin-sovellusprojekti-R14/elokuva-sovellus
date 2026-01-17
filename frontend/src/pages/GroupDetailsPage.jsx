import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../hooks/useTranslation";
import ClickablePoster from "../components/ClickablePoster";

const API_URL = process.env.REACT_APP_API_URL;

const IMG = "https://image.tmdb.org/t/p/w300";

export default function GroupDetailsPage() {
  const { t, getTmdbLanguage } = useTranslation();
  const { user } = useAuth();
  const { id } = useParams();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [filmsRaw, setFilmsRaw] = useState([]);
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  const [forbidden, setForbidden] = useState(false);

  const fetchGroupData = async () => {
    setLoading(true);
    setForbidden(false);
    try {
      const [groupRes, filmsRes] = await Promise.all([
        fetch(`${API_URL}/api/get_group_details?group_id=${id}`, {
          credentials: "include",
        }),
        fetch(`${API_URL}/api/get_group_films?group_id=${id}`, {
          credentials: "include",
        }),
      ]);

      if (groupRes.status === 403 || filmsRes.status === 403) {
        setForbidden(true);
        setGroup(null);
        setMembers([]);
        setFilms([]);
        setFilmsRaw([]);
        return;
      }

      if (!groupRes.ok || !filmsRes.ok) throw new Error(t("loadErr"));

      const groupData = await groupRes.json();
      const filmsData = await filmsRes.json();

      setGroup(groupData);
      setMembers(groupData.members || []);
      setFilmsRaw(filmsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const enrichFilms = async () => {
    if (filmsRaw.length === 0) {
      setFilms([]);
      return;
    }

    const enriched = await Promise.all(
      filmsRaw.map(async (film) => {
        const typeToUse = film.media_type || "movie";

        try {
          const res = await fetch(
            `${API_URL}/api/get_title_details?id=${film.movie_id}&media_type=${typeToUse}&language=${getTmdbLanguage()}`
          );

          if (!res.ok) throw new Error("Not found");

          const data = await res.json();

          return {
            id: film.movie_id,
            media_type: typeToUse,
            title: data.title || data.name || t("untitledErr"),
            name: data.name || data.title || t("untitledErr"),
            poster_path: data.poster_path,
            imdb_rating: data.imdb_rating || null,
            added_by_username: film.added_by_username,
            added_by_id: film.added_by_id,
          };
        } catch (err) {
          return {
            id: film.movie_id,
            media_type: typeToUse,
            title: `ID: ${film.movie_id}`,
            name: `ID: ${film.movie_id}`,
            poster_path: null,
            imdb_rating: null,
            added_by_username: film.added_by_username,
            added_by_id: film.added_by_id,
          };
        }
      })
    );

    setFilms(enriched);
  };

  useEffect(() => {
    if (!user) {
      setGroup(null);
      setMembers([]);
      setFilms([]);
      setFilmsRaw([]);
      setForbidden(false);
      setLoading(false);
      return;
    }
    fetchGroupData();
  }, [id, user]);

  useEffect(() => {
    if (!loading) enrichFilms();
  }, [filmsRaw, getTmdbLanguage]);

  const isOwner = group && user && group.owner_id === user.user_id;

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/titlesearch?q=${encodeURIComponent(searchQuery)}&language=${getTmdbLanguage()}`
        );
        const data = await res.json();
        setSearchResults(data.results?.slice(0, 5) || []);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, getTmdbLanguage]);

  const handleAddFilm = async (titleId, titleMediaType) => {
    setAddError("");
    setAddSuccess("");

    try {
      const res = await fetch(
        `${API_URL}/api/add_film?group_id=${id}&movie_id=${titleId}&media_type=${titleMediaType}`,
        { method: "POST", credentials: "include" }
      );

      const data = await res.json();

      if (res.ok) {
        setAddSuccess(t("addedFilm"));
        setSearchQuery("");
        setSearchResults([]);
        fetchGroupData();
        setTimeout(() => setAddSuccess(""), 3000);
      } else {
        setAddError(data.message || t("err"));
        setTimeout(() => setAddError(""), 3000);
      }
    } catch (err) {
      setAddError(t("err"));
      setTimeout(() => setAddError(""), 3000);
    }
  };

  const handleRemoveFilm = async (movie_id, media_type) => {
    if (!movie_id) {
      alert(t("errMID"));
      return;
    }

    if (!window.confirm(t("remove_gr"))) return;

    const typeToUse = media_type || "movie";

    try {
      const res = await fetch(
        `${API_URL}/api/remove_film?group_id=${id}&movie_id=${movie_id}&media_type=${typeToUse}`,
        { method: "DELETE", credentials: "include" }
      );

      if (res.ok) {
        fetchGroupData();
      } else {
        const data = await res.json();
        alert(data.message || t("deleteErr"));
      }
    } catch (err) {
      alert(t("err"));
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteUsername.trim()) return;

    setInviteError("");
    setInviteSuccess("");

    try {
      const res = await fetch(
        `${API_URL}/api/send_invitation?username=${encodeURIComponent(inviteUsername.trim())}&group_id=${id}`,
        { method: "POST", credentials: "include" }
      );

      const data = await res.json();

      if (res.ok) {
        setInviteSuccess(t("inv_sent"));
        setInviteUsername("");
        setTimeout(() => setInviteSuccess(""), 3000);
      } else {
        setInviteError(data.message || t("err"));
        setTimeout(() => setInviteError(""), 3000);
      }
    } catch (err) {
      setInviteError(t("err"));
      setTimeout(() => setInviteError(""), 3000);
    }
  };

  if (!user) {
    return (
      <div className="container py-5 d-flex justify-content-center">
        <div
          className="bg-dark bg-opacity-90 p-5 rounded-4 text-center border border-secondary auth-card"
          style={{ maxWidth: "420px" }}
        >
          <h2 className="text-white fw-bold mb-3 noBack">{t("not_log")}</h2>
          <p className="text-white-50 mb-0">{t("logToV")}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div
          className="spinner-border text-light"
          style={{ width: "4rem", height: "4rem" }}
        ></div>
        <p className="text-white mt-4 noBack">{t("load_group")}</p>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="container py-5 d-flex justify-content-center">
        <div
          className="bg-dark bg-opacity-90 p-5 rounded-4 text-center border border-danger auth-card"
          style={{ maxWidth: "520px" }}
        >
          <div className="fs-1 mb-3">🚫</div>
          <h2 className="text-danger fw-bold mb-3">{t("ad")}</h2>
          <p className="text-white-50 mb-4">{t("not_a_member")}</p>
          <Link to="/my-groups" className="btn btn-warning btn-lg px-4">
            ← {t("to_group")}
          </Link>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="container py-5 text-center">
        <h2 className="text-white noBack">{t("no_gro")}</h2>
        <Link
          to="/my-groups"
          className="btn btn-outline-warning d-flex align-items-center gap-2 me-3"
          style={{
            borderRadius: "999px",
            padding: "0.4rem 1rem",
            fontWeight: "600",
          }}
        >
          ← {t("back_to_groups")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex align-items-center mb-4">
        <Link
          to="/my-groups"
          className="btn btn-warning d-flex align-items-center gap-2 me-3 px-4 btn-sm"
          style={{
            borderRadius: "999px",
            padding: "0.4rem 1rem",
            fontWeight: "600",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.08)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          ← {t("back_to")}
        </Link>
        {isOwner && (
          <span
            className="badge ms-auto d-flex align-items-center gap-2 px-3 py-2"
            style={{
              background: "linear-gradient(135deg, #ffcc00, #ff9500)",
              color: "#000000ff",
              fontWeight: "700",
              boxShadow: "0 0 10px rgba(255,193,7,0.6)",
            }}
          >
            👑 {t("owner_txt")}
          </span>
        )}
      </div>

      <h1 className="group-title">{group.name}</h1>
      {group.description && (
        <div className="group-description">{group.description}</div>
      )}

      <h3 className="text-warning mt-5 mb-3">
        {t("members")} ({members.length})
      </h3>
      <div className="d-flex flex-wrap gap-2 mb-5">
        {[...members]
          .sort((a, b) => {
            if (a.user_id === group.owner_id) return -1;
            if (b.user_id === group.owner_id) return 1;
            return 0;
          })
          .map((m) => {
          const isGroupOwner = m.user_id === group.owner_id;
          const canRemoveMember = isOwner && !isGroupOwner;
          const isOwnProfile = user && m.user_id === user.user_id;

          return (
            <div key={m.user_id} className="d-flex align-items-center gap-2">
              <Link
                to={
                  isOwnProfile
                  ? "/my-reviews"
                  : `/user-reviews?user_id=${m.user_id}`
                }
                className="badge px-3 py-2 btn-sm"
                style={
                  isGroupOwner
                    ? {
                        background: "linear-gradient(135deg, #ffcc00, #ff9500)",
                        color: "#000",
                        fontWeight: "700",
                        boxShadow: "0 0 10px rgba(255,193,7,0.6)",
                        textDecoration: "none"
                      }
                    : {
                        background:
                          "linear-gradient(135deg, #6c757d, #4d4c4cff)",
                        color: "#000",
                        fontWeight: "700",
                        textDecoration: "none"
                      }
                }
              >
                {isGroupOwner && "👑 "}
                {m.username}
              </Link>

              {canRemoveMember && (
                <button
                  className="btn btn-sm btn-danger badge px-3 py-2"
                  style={{ transition: "transform 0.2s ease" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.07)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                  onClick={async () => {
                    if (!window.confirm(`${m.username}, ` + t("remove_user_gr")))
                      return;

                    try {
                      const res = await fetch(
                        `${API_URL}/api/remove_member?group_id=${group.group_id}&member_id=${m.user_id}`,
                        { method: "DELETE", credentials: "include" }
                      );
                      const data = await res.json();

                      if (res.ok) {
                        setMembers((prev) =>
                          prev.filter((mem) => mem.user_id !== m.user_id)
                        );
                      } else {
                        alert(data.message || t("failed_remove_member"));
                      }
                    } catch (err) {
                      alert(t("err_remove_member"));
                    }
                  }}
                >
                  {t("delete")}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mb-5 position-relative">
        <h3 className="text-warning mb-3 d-flex align-items-center gap-2">
          {t("add_movie_series")}
        </h3>
        <div className="position-relative">
          <input
            type="text"
            className="form-control bg-dark text-white border-secondary"
            placeholder="..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {(searchLoading || searchResults.length > 0) && (
            <div
              className="position-absolute w-100 bg-dark border border-secondary rounded-bottom shadow-lg"
              style={{ top: "100%", zIndex: 100 }}
            >
              {searchLoading && (
                <div className="p-3 text-white-50">{t("searchingFilm")}</div>
              )}
              {!searchLoading && searchResults.length === 0 && searchQuery && (
                <div className="p-3 text-white-50">{t("nothF")}</div>
              )}
              {searchResults.map((item) => (
                <div
                  key={item.id}
                  className="p-3 border-bottom border-secondary hover-bg-primary"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleAddFilm(item.id, item.media_type)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <strong className="text-white noBack">
                      {item.title || item.name} (
                      {(item.release_date || item.first_air_date || "").slice(
                        0,
                        4
                      )}
                      )
                    </strong>
                    <div>
                      <small className="text-white-50 me-3">
                        {item.media_type === "tv" ? t("series") : t("films")}
                      </small>
                      {item.imdb_rating && (
                        <span className="text-warning">
                          ⭐ {item.imdb_rating}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {addSuccess && (
          <div className="alert alert-success mt-3 shadow-sm">{addSuccess}</div>
        )}
        {addError && (
          <div className="alert alert-danger mt-3 shadow-sm">{addError}</div>
        )}
      </div>

      {isOwner && (
        <div className="mb-5">
          <h3 className="text-warning mb-3">{t("invite_mem")}</h3>
          <form onSubmit={handleInvite} className="d-flex gap-2">
            <input
              type="text"
              className="form-control bg-dark text-white border-secondary"
              placeholder="..."
              value={inviteUsername}
              onChange={(e) => setInviteUsername(e.target.value)}
              required
            />
            <button
              type="submit"
              className="btn btn-success"
              style={{ transition: "transform 0.2s ease" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.06)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              {t("send")}
            </button>
          </form>
          {inviteSuccess && (
            <div className="alert alert-success mt-3">{inviteSuccess}</div>
          )}
          {inviteError && (
            <div className="alert alert-danger mt-3">{inviteError}</div>
          )}
        </div>
      )}

      <h3 className="text-warning mb-4">
        {t("movies_in_group")} ({films.length})
      </h3>
      {films.length === 0 ? (
        <div className="text-center text-white-50 py-4">
          <div className="fs-1 mb-2">🎬</div>
          <p className="mb-0">{t("no_movies_yet")}</p>
        </div>
      ) : (
        <div className="row g-3 g-md-4 px-2">
          {films.map((item) => {
            const canRemove = isOwner || item.added_by_id === user?.user_id;

            return (
              <div
                key={item.id}
                className="col-6 col-md-4 col-lg-2 text-center movie-card"
                style={{ position: "relative" }}
              >
                {item.imdb_rating && (
                  <div className="imdb-badge">⭐ {item.imdb_rating}</div>
                )}

                <div
                  className="movie-card-inner text-decoration-none"
                >
                  <ClickablePoster item={item} />
                  <div className="movie-title-parent">
                    <p className="movie-title text-white" style={{ fontSize: "0.9rem" }}>
                      {item.title || item.name}
                    </p>
                  </div>
                </div>

                <small className="text-white-50 d-block mt-1">
                  {t("added_by")} {item.added_by_username}
                </small>

                {canRemove && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveFilm(item.id, item.media_type);
                    }}
                    className="btn btn-danger w-100 mt-2"
                    style={{ transition: "transform 0.2s ease" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "scale(1.05)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  >
                    {t("delete")}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
