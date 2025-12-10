import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";

export default function LoginModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const modalRef = useRef(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const res = await login(username, password);

    if (res.error) {
      setError(res.error);
      return;
    }

    onClose();

    //navigate("/");
  }

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-window" ref={modalRef}>
        <h2 className="modal-title">{t("sign_in")}</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="form-control mb-2"
            placeholder={t("username")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
          />

          <input
            type="password"
            className="form-control mb-3"
            placeholder={t("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="btn btn-primary w-100">{t("log_in")}</button>
        </form>

        <button className="btn btn-danger w-100 mt-2" onClick={onClose}>
          {t("close")}
        </button>
      </div>
    </div>
  );
} 