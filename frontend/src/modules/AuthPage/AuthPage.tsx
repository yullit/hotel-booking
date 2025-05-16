import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Для перенаправлення після логіну

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLogin, setIsLogin] = useState(true); // Стан для перемикання між формами
  const [error, setError] = useState<string | null>(null); // Для відображення помилок
  const [loading, setLoading] = useState(false); // Для індикації завантаження
  const navigate = useNavigate(); // Для перенаправлення

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || (isLogin === false && !username)) {
      setError("Будь ласка, заповніть всі поля.");
      return;
    }

    setLoading(true);
    setError(null);

    const endpoint = isLogin ? "login" : "register";
    const body = isLogin
      ? { email, password }
      : { username, email, password, role: "client" }; // Тут роль за замовчуванням, для нових користувачів

    try {
      const response = await fetch(`http://localhost:5000/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        if (isLogin) {
          localStorage.setItem("token", data.token);

          // Перевірка ролі після логіну
          const decodedToken = JSON.parse(atob(data.token.split(".")[1])); // Декодуємо JWT токен
          if (decodedToken.role === "manager") {
            navigate("/manage-rooms"); // Перенаправлення на ManageRoomsPage для менеджера
          } else {
            navigate("/rooms"); // Перенаправлення на RoomsPage для звичайного користувача
          }
        } else {
          setError("Реєстрація успішна! Тепер ви можете увійти.");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Невірний логін або пароль");
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
        {/* Відображаємо форму для реєстрації або авторизації */}
        {!isLogin && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}
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
