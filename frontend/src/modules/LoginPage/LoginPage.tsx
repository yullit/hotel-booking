import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Для перенаправлення після логіну

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null); // Для відображення помилок
  const [loading, setLoading] = useState(false); // Для індикації завантаження
  const navigate = useNavigate(); // Для перенаправлення

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Перевірка на порожні поля
    if (!email || !password) {
      setError("Будь ласка, заповніть всі поля.");
      return;
    }

    setLoading(true); // Початок завантаження
    setError(null); // Очищення попередніх помилок

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token); // Зберігаємо токен
        console.log("JWT токен:", data.token);

        // Перенаправлення після успішного логіну
        navigate("/rooms");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Невірний логін або пароль");
      }
    } catch (err) {
      console.error(err);
      setError("Помилка при підключенні до сервера");
    } finally {
      setLoading(false); // Завершення завантаження
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
      <button type="submit" disabled={loading}>
        {loading ? "Зачекайте..." : "Увійти"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
};

export default LoginPage;
