import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext"; // Імпортуємо AuthContext

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // Для реєстрації
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext is not available");
  }

  const { login } = authContext;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || (!isLogin && !username)) {
      setError("Будь ласка, заповніть всі поля.");
      return;
    }

    setLoading(true);
    setError(null);

    const endpoint = isLogin ? "login" : "register";
    const body = { email, password, ...(isLogin ? {} : { username }) }; // Додаємо username при реєстрації

    try {
      const response = await fetch(`http://localhost:5000/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        // Якщо відповідь не успішна, читаємо текст помилки з JSON
        const errorData = await response.json();
        setError(errorData.message || "Невірний логін або пароль");
        return;
      }

      const data = await response.json();
      login(data.token); // Використовуємо метод з контексту для збереження токену

      if (data.token) {
        // Перевірка, чи є токен
        const decodedToken = JSON.parse(atob(data.token.split(".")[1])); // Декодуємо токен

        if (decodedToken.role === "manager") {
          navigate("/manage-rooms"); // Перенаправляємо на сторінку для менеджера
        } else {
          navigate("/rooms"); // Перенаправляємо на сторінку для звичайного користувача
        }
      } else {
        setError("Токен не отримано");
      }
    } catch (err) {
      console.error(err);
      setError("Помилка при підключенні до сервера");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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
        {!isLogin && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)} // Додаємо поле для username
          />
        )}
        <button type="submit" disabled={loading}>
          {loading ? "Зачекайте..." : isLogin ? "Увійти" : "Зареєструватися"}
        </button>
      </form>

      <p>
        {isLogin ? (
          <>
            Ще не зареєстровані?{" "}
            <button onClick={() => setIsLogin(false)}>Реєстрація</button>
          </>
        ) : (
          <>
            Вже маєте акаунт?{" "}
            <button onClick={() => setIsLogin(true)}>Увійти</button>
          </>
        )}
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default AuthPage;
