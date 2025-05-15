// src/Root.tsx
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { App } from './App';
import HomePage from './modules/HomePage/HomePage';  // Змінили на default import
import RoomsPage from './modules/RoomsPage/RoomsPage';  // Змінили на default import
import ContactsPage from './modules/ContactsPage/ContactsPage';  // Змінили на default import
import LoginPage from './modules/LoginPage/LoginPage';  // Змінили на default import
import RegisterPage from './modules/RegisterPage/RegisterPage';  // Змінили на default import
import NotFoundPage from './modules/NotFoundPage/NotFoundPage';  // Змінили на default import

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
