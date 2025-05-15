import { useState } from "react";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [error, setError] = useState<string | null>(null);  // Стейт для помилок
  const [successMessage, setSuccessMessage] = useState<string | null>(null);  // Стейт для успіху

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password, role }),
    });

    if (response.ok) {
      const data = await response.json();
      setSuccessMessage("Користувач успішно зареєстрований!");
      setError(null); // Якщо все ок, очищаємо помилку
      console.log("Користувач зареєстрований:", data);
    } else {
      setSuccessMessage(null); // Якщо є помилка, очищаємо повідомлення про успіх
      setError("Помилка при реєстрації, спробуйте ще раз.");
      console.error("Помилка реєстрації");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="client">Client</option>
        <option value="manager">Manager</option>
      </select>
      <button type="submit">Зареєструватися</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
    </form>
  );
};

export default RegisterPage;
