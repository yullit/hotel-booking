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

  // Додаткові стейти для помилок валідації
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);

  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext is not available");
  }

  const { login } = authContext;

  // Валідація email
  const validateEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

  // Валідація пароля
  const validatePassword = (password: string) => {
    return password.length >= 6; // Перевірка мінімальної довжини пароля
  };

  // Валідація підтвердження пароля
  const validateConfirmPassword = (password: string, confirmPassword: string) => {
    return password === confirmPassword;
  };

  // Валідація форми перед відправленням
  const validateForm = () => {
    let valid = true;
    if (!validateEmail(email)) {
      setEmailError("Електронна пошта повинна мати формат: user@example.com");
      valid = false;
    } else {
      setEmailError(null);
    }

    if (!validatePassword(password)) {
      setPasswordError("Пароль має бути не менше 6 символів.");
      valid = false;
    } else {
      setPasswordError(null);
    }

    if (!isLogin && !validateConfirmPassword(password, confirmPassword)) {
      setConfirmPasswordError("Паролі не збігаються.");
      valid = false;
    } else {
      setConfirmPasswordError(null);
    }

    if (!isLogin && !firstName) {
      setFirstNameError("Будь ласка, введіть ваше ім'я.");
      valid = false;
    } else {
      setFirstNameError(null);
    }

    if (!isLogin && !lastName) {
      setLastNameError("Будь ласка, введіть ваше прізвище.");
      valid = false;
    } else {
      setLastNameError(null);
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Перевірка валідності перед відправкою
    if (!validateForm()) {
      setError("Будь ласка, виправте помилки.");
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
      <form onSubmit={handleSubmit} className="auth-form" noValidate> {/* Забороняємо вбудовану валідацію браузера */}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            placeholder="Введіть свою електронну пошту"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            id="email"
          />
          {emailError && <div className="error-message">{emailError}</div>} {/* Показуємо помилку */}
        </div>

        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input
            placeholder="Ведіть свій пароль"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            id="password"
          />
          {passwordError && <div className="error-message">{passwordError}</div>} {/* Показуємо помилку */}
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
            {confirmPasswordError && <div className="error-message">{confirmPasswordError}</div>} {/* Показуємо помилку */}
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
              {firstNameError && <div className="error-message">{firstNameError}</div>} {/* Показуємо помилку */}
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
              {lastNameError && <div className="error-message">{lastNameError}</div>} {/* Показуємо помилку */}
            </div>
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Зачекайте..." : isLogin ? "Увійти" : "Зареєструватися"}
        </button>
      </form>
      {error && <p className="error-message-global">{error}</p>}

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
