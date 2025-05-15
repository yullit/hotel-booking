import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { App } from './App';  // Залишай так, якщо App знаходиться в тій самій папці
import HomePage from './modules/HomePage/HomePage';  
import RoomsPage from './modules/RoomsPage/RoomsPage';
import ContactsPage from './modules/ContactsPage/ContactsPage';
import LoginPage from './modules/LoginPage/LoginPage';
import RegisterPage from './modules/RegisterPage/RegisterPage';
import NotFoundPage from './modules/NotFoundPage/NotFoundPage';

export const Root = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="home" element={<Navigate to="/" replace />} />
          <Route path="rooms" element={<RoomsPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
};
