import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
<<<<<<< HEAD
import { useTranslation } from "../hooks/useTranslation";
=======
>>>>>>> 21c3fbfee366e1e90e1cce2ef46130fbef857a26
 
export default function SignInPage() {
  const { t } = useTranslation();
  const { setUser } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.user) {
      setUser(data.user);
      window.location.href = "/";
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} />
      <button>{t("log_in")}</button>
    </form>
  );
}