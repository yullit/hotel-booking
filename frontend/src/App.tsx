// src/App.tsx
import { Outlet } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import './App.scss';

export const App = () => (
  <div className="app">
    <Header />
    <main className="main">
      <div className="container">
        <Outlet /> {/* Це місце для динамічного контенту */}
      </div>
    </main>
    <Footer />
  </div>
);