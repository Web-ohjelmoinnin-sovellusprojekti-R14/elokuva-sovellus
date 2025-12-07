import { useState } from "react";
 
export default function SignUpPage() {
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
      <button>Sign Up</button>
    </form>
  );
}