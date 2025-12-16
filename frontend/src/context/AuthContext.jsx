import React, { createContext, useContext, useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/me`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function login(username, password) {
    const res = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setUser(data.user);
    }

    return data;
  }

  async function register(username, password) {
    const res = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    return await res.json();
  }

  async function logout() {
    await fetch(`${API_URL}/api/logout`, {
      method: "POST",
      credentials: "include",
    });

    setUser(null);

    localStorage.removeItem("user_reviews_cache_v3");
    localStorage.removeItem("user_reviews_cache");
    localStorage.removeItem("user_reviews_cache_v4");
    localStorage.removeItem("user_reviews_cache_v5");
    localStorage.removeItem("user_reviews_cache_v6");
    localStorage.removeItem("user_reviews_cache_v7");
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
