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

  return (
    <header className="header">
      <div className="logo">
        <Link to="/" className="logo-link">
          <h1>Готель "Хуйня"</h1>
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
