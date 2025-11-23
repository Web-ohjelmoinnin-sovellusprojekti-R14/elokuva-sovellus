import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";

export default function RegisterModal({ isOpen, onClose }) {
  const { register } = useAuth();

  const modalRef = useRef(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isOpen) {
      setError("");
      setSuccess("");
    }
  }, [isOpen]);

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const res = await register(username, password);

    if (res.error) {
      setError(res.error);
      return;
    }

    setSuccess("Registration successful! You can now log in.");
  }

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-window" ref={modalRef}>
        <h2 className="modal-title">Sign Up</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            className="form-control mb-3"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="btn btn-success w-100">Register</button>
        </form>

        <button className="btn btn-danger w-100 mt-2" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
