// src/components/Header.tsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';  // Імпортуємо AuthContext
import './Header.scss';

const Header = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error('AuthContext is not available');
  }

  const { token, logout } = authContext;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Перевірка ролі, чи є менеджер
  const decodedToken = token ? token.split(".")[1] : null;
  let decodedPayload;
  if (decodedToken) {
    try {
      decodedPayload = JSON.parse(atob(decodedToken));
    } catch (error) {
      console.error("Помилка декодування токену:", error);
      decodedPayload = null;
    }
  }

  const isManager = decodedPayload && decodedPayload.role === "manager";

  return (
    <header className="header">
      <div className="logo">
        <Link to="/" className="logo-link">
          <h1>Готель "Не хуйня"</h1>
        </Link>
      </div>
      <nav>
        <ul>
          {/* Якщо користувач не є менеджером, відображаємо посилання на Номери */}
          {!isManager && <li><Link to="/rooms">Номери</Link></li>}
          <li><Link to="/contacts">Контакти</Link></li>
          {token ? (
            <>
              {isManager ? (
                <li><Link to="/manage-rooms">Управління номерами</Link></li>
              ) : (
                <li><Link to="/dashboard">Особистий кабінет</Link></li>
              )}
              <li>
                <button onClick={handleLogout} className="logout-button">Вийти</button>
              </li>
            </>
          ) : (
            <li><Link to="/login">Увійти</Link></li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;