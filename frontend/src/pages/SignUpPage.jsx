import { useState } from "react";
<<<<<<< HEAD
import { useTranslation } from "../hooks/useTranslation";
=======
>>>>>>> 21c3fbfee366e1e90e1cce2ef46130fbef857a26
 
export default function SignUpPage() {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    window.location.href = "/signin";
  };

  return (
    <form onSubmit={handleRegister}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} />
      <button>{t("sign_up")}</button>
    </form>
  );
}