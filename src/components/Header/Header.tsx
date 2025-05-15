// src/components/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.scss';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        {/* Текст "Готель Комфорт", який буде клікабельним */}
        <Link to="/" className="logo-link">
          <h1>Готель "Хуйня"</h1> {/* або тут можна вставити логотип */}
        </Link>
      </div>
      <nav>
        <ul>
          <li><Link to="/rooms">Номери</Link></li>
          <li><Link to="/contacts">Контакти</Link></li>
          <li><Link to="/login">Увійти</Link></li>
          <li><Link to="/register">Зареєструватися</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
