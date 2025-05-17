import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext"; // Імпортуємо AuthContext

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // Для реєстрації
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

    if (!email || !password || (!isLogin && !username) || (!isLogin && !firstName) || (!isLogin && !lastName)) {
      setError("Будь ласка, заповніть всі поля.");
      return;
    }

    setLoading(true);
    setError(null);

    const endpoint = isLogin ? "login" : "register";
    const body = { email, password, firstName, lastName, ...(isLogin ? {} : { username }) }; // Додаємо поля firstName і lastName при реєстрації

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
          <>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
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
