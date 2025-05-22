import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import './AuthPage.scss';

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);

  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  if (!authContext) throw new Error("AuthContext is not available");
  const { login } = authContext;

  const validateEmail = (email: string) =>
    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);
  const validatePassword = (password: string) => password.length >= 6;
  const validateConfirmPassword = (p: string, c: string) => p === c;
  const validateNameLength = (name: string) => name.trim().length >= 2;

  const validateForm = () => {
    let valid = true;
    if (!validateEmail(email)) {
      setEmailError("Електронна пошта повинна мати формат: user@example.com");
      valid = false;
    } else setEmailError(null);

    if (!validatePassword(password)) {
      setPasswordError("Пароль має бути не менше 6 символів.");
      valid = false;
    } else setPasswordError(null);

    if (!isLogin && !validateConfirmPassword(password, confirmPassword)) {
      setConfirmPasswordError("Паролі не збігаються.");
      valid = false;
    } else setConfirmPasswordError(null);

    if (!isLogin && !validateNameLength(firstName)) {
      setFirstNameError("Ім'я має містити щонайменше 2 символи.");
      valid = false;
    } else setFirstNameError(null);

    if (!isLogin && !validateNameLength(lastName)) {
      setLastNameError("Прізвище має містити щонайменше 2 символи.");
      valid = false;
    } else setLastNameError(null);

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setError("Будь ласка, виправте помилки.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const endpoint = isLogin ? "login" : "register";
    const body = { email, password, firstName, lastName };

    try {
      const response = await fetch(`http://localhost:5000/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Невірний логін або пароль");
        return;
      }

      login(data.token);

      const decodedToken = JSON.parse(atob(data.token.split(".")[1]));

      if (!isLogin) {
        setSuccessMessage("Реєстрація успішна!<br/>Вас буде перенаправлено...");
        setTimeout(() => {
          if (decodedToken.role === "manager") {
            navigate("/manage-rooms");
          } else {
            navigate("/rooms");
          }
        }, 5000);
      } else {
        if (decodedToken.role === "manager") {
          navigate("/manage-rooms");
        } else {
          navigate("/rooms");
        }
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
    <form onSubmit={handleSubmit} className="auth-form" noValidate>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {emailError && <div className="error-message">{emailError}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="password">Пароль</label>
        <input
          type="password"
          id="password"
          placeholder="Введіть пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {passwordError && <div className="error-message">{passwordError}</div>}
      </div>

      {!isLogin && (
        <>
          <div className="form-group">
            <label htmlFor="confirmPassword">Підтвердьте пароль</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Повторіть ваш пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {confirmPasswordError && <div className="error-message">{confirmPasswordError}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="firstName">Ім’я</label>
            <input
              type="text"
              id="firstName"
              placeholder="Вкажіть ваше ім’я"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            {firstNameError && <div className="error-message">{firstNameError}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Прізвище</label>
            <input
              type="text"
              id="lastName"
              placeholder="Вкажіть ваше прізвище"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            {lastNameError && <div className="error-message">{lastNameError}</div>}
          </div>
        </>
      )}

      <button type="submit" disabled={loading}>
        {loading ? "Зачекайте..." : isLogin ? "Увійти" : "Зареєструватися"}
      </button>
    </form>

    {error && <p className="error-message-global">{error}</p>}

    {successMessage && (
      <div
        className="floating-message success-floating"
        dangerouslySetInnerHTML={{ __html: successMessage || "" }}
      ></div>
    )}

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
  </div>
);

};

export default AuthPage;
