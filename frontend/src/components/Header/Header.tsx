import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
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
        <NavLink to="/" className="logo-link">
          <h2>Готель "Комфорт"</h2>
        </NavLink>
      </div>
      <nav>
        <ul>
          {!isManager && (
            <li>
              <NavLink
                to="/rooms"
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
              >
                Номери
              </NavLink>
            </li>
          )}
          {token ? (
            <>
              {isManager ? (
                <li>
                  <NavLink
                    to="/manage-rooms"
                    className={({ isActive }) =>
                      isActive ? 'nav-link active' : 'nav-link'
                    }
                  >
                    Управління номерами
                  </NavLink>
                </li>
              ) : (
                <li>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      isActive ? 'nav-link active' : 'nav-link'
                    }
                  >
                    Особистий кабінет
                  </NavLink>
                </li>
              )}
              <li>
                <button onClick={handleLogout} className="nav-link-button">
                  Вийти
                </button>
              </li>
            </>
          ) : (
            <li>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive ? 'nav-link-button active' : 'nav-link-button'
                }
              >
                Увійти
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
