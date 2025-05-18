// src/pages/HomePage.tsx
import React, { useState } from "react";
import './HomePage.scss';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);

  const navigate = useNavigate();

  const handleCheckInDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckInDate(new Date(e.target.value));
  };

  const handleCheckOutDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckOutDate(new Date(e.target.value));
  };

  const handleSubmit = () => {
    // Перевірка наявності дат
    if (checkInDate && checkOutDate) {
      navigate("/rooms", { state: { checkInDate, checkOutDate } });
    }
  };

  return (
    <div className="home-page">
      {/* Hero Image Section */}
      <div className="hero-image">
        <div className="hero-content">
          <h1>Готель "Baza"</h1>
          <form className="booking-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <label htmlFor="checkInDate">Дата заїзду</label>
            <input
              type="date"
              id="checkInDate"
              value={checkInDate ? checkInDate.toISOString().split("T")[0] : ""}
              onChange={handleCheckInDateChange}
              required
            />
            <label htmlFor="checkOutDate">Дата виїзду</label>
            <input
              type="date"
              id="checkOutDate"
              value={checkOutDate ? checkOutDate.toISOString().split("T")[0] : ""}
              onChange={handleCheckOutDateChange}
              required
            />
            <button type="submit">Перевірити доступність</button>
          </form>
        </div>
      </div>

      {/* Carousel Section */}
      <div className="carousel-section">
        {/* Тут можна додати карусель */}
      </div>

      {/* Info Section */}
      <div className="info-section">
        <h2>Ласкаво просимо в наш готель!</h2>
        <p>Забронюйте номер, який підходить саме вам.</p>
      </div>
    </div>
  );
};

export default HomePage;
