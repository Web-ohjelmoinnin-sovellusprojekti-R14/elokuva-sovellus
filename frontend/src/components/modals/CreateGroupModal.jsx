import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "../../hooks/useTranslation";

const API_URL = process.env.REACT_APP_API_URL;

export default function CreateGroupModal({ isOpen, onClose, onSuccess }) {
  const { t } = useTranslation();

  const modalRef = useRef(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t("g_n_req"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${API_URL}/api/create_group?name=${encodeURIComponent(name.trim())}&description=${encodeURIComponent(description.trim() || "")}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("f_g"));
      } else {
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      setError(t("netError"));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-window" ref={modalRef}>
        <h2 className="modal-title">{t("ceate_new_group")}</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="form-control mb-3"
            placeholder={t("g_name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            required
            disabled={loading}
            autoFocus
          />

          <textarea
            className="form-control mb-3"
            rows="4"
            placeholder={t("dis_opt")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            disabled={loading}
          />

          <button
            type="submit"
            className="btn btn-success w-100 mb-2"
            disabled={loading}
          >
            {loading ? t("creatingg") : t("ceate_group")}
          </button>

          <button
            type="button"
            className="btn btn-danger w-100"
            onClick={handleClose}
            disabled={loading}
          >
            {t("cancelCr")}
          </button>
        </form>
      </div>
    </div>
  );
}
