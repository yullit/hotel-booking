import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext"; // Імпортуємо AuthContext
import './AuthPage.scss'; // Імпортуємо стилі

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Поле для підтвердження пароля
  const [firstName, setFirstName] = useState(""); // Ім'я
  const [lastName, setLastName] = useState(""); // Прізвище
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

    if (!email || !password || (!isLogin && !firstName) || (!isLogin && !lastName)) {
      setError("Будь ласка, заповніть всі поля.");
      return;
    }

    if (!isLogin && password !== confirmPassword) {  // Перевірка на співпадіння паролів
      setError("Паролі не збігаються.");
      return;
    }

    setLoading(true);
    setError(null);

    const endpoint = isLogin ? "login" : "register";
    const body = { email, password, firstName, lastName }; // Видаляємо поле username

    try {
      const response = await fetch(`http://localhost:5000/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Невірний логін або пароль");
        return;
      }

      const data = await response.json();
      login(data.token);

      if (data.token) {
        const decodedToken = JSON.parse(atob(data.token.split(".")[1]));
        
        if (decodedToken.role === "manager") {
          navigate("/manage-rooms");
        } else {
          navigate("/rooms");
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
    <div className="auth-form-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            placeholder="Введіть свою електронну адресу"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            id="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input
            placeholder="Введіть свій пароль"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            id="password"
          />
        </div>

        {/* Покажемо поле для підтвердження пароля тільки на реєстрації */}
        {!isLogin && (
          <div className="form-group">
            <label htmlFor="confirmPassword">Підтвердьте пароль</label>
            <input
              placeholder="Підтвердьте свій пароль"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              id="confirmPassword"
            />
          </div>
        )}

        {!isLogin && (
          <>
            <div className="form-group">
              <label htmlFor="firstName">Ім'я</label>
              <input
                placeholder="Вкажіть своє ім'я"
                type="text"
                name="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                id="firstName"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Прізвище</label>
              <input
                placeholder="Вкажіть своє прізвище"
                type="text"
                name="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                id="lastName"
              />
            </div>
          </>
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
