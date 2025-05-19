import React from 'react';
import './Footer.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <p className="footer-text">© {new Date().getFullYear()} Готель "Комфорт". Всі права захищено.</p>
    </footer>
  );
};

export default Footer;
