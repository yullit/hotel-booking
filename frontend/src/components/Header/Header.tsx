// src/components/Header.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.scss";

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Функція для виходу
  const handleLogout = () => {
    localStorage.removeItem("token"); // Видаляємо токен при виході
    navigate("/login"); // Перенаправляємо на сторінку логіну
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/" className="logo-link">
          <h1>Готель "Хуйня"</h1> {/* або тут можна вставити логотип */}
        </Link>
      </div>
      <nav>
        <ul>
          <li><Link to="/rooms">Номери</Link></li>
          <li><Link to="/contacts">Контакти</Link></li>
          {token ? (
            <>
              <li><Link to="/dashboard">Особистий кабінет</Link></li>
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
