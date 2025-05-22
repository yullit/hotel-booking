// src/App.tsx
import { Outlet } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import { AuthProvider } from './context/AuthContext'; // Імпортуємо AuthProvider
import './App.scss';

export const App = () => (
  <AuthProvider>
    <div className="app">
      <Header />
      <main className="main">
        <div className="container">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  </AuthProvider>
);

