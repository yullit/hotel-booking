// src/App.tsx
import { Outlet } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import { AuthProvider } from './context/AuthContext'; // Імпортуємо AuthProvider
import './App.scss';

export const App = () => (
  <AuthProvider>  {/* Обгортаємо весь додаток в AuthProvider */}
    <div className="app">
      <Header />
      <main className="main">
        <div className="container">
          <Outlet /> {/* Це місце для динамічного контенту */}
        </div>
      </main>
      <Footer />
    </div>
  </AuthProvider>
);
