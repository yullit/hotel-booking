import React from 'react';
import './HomePage.scss';
import BookingForm from './components/BookingForm/BookingForm'; // Форма бронювання
import CarouselComponent from './components/Carousel/Carousel'; // Імпортуємо компонент каруселі

const HomePage = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Логіка для перевірки доступності номерів або переходу до списку
  };

  return (
    <div className="home-page">
      {/* Hero Image Section */}
      <div className="hero-image">
        <div className="hero-content">
          <h1>Готель "Baza"</h1>
          <form onSubmit={handleSubmit} className="booking-form">
            <BookingForm />
          </form>
        </div>
      </div>

      {/* Carousel Section */}
      <CarouselComponent />

      {/* Info Section */}
      <div className="info-section">
        <h2>Ласкаво просимо в наш готель!</h2>
        <p>Забронюйте номер, який підходить саме вам.</p>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="feature-item">
          <h3>Стильний дизайн</h3>
          <p>У нас ви знайдете сучасні номери з стильним інтер'єром.</p>
        </div>
        <div className="feature-item">
          <h3>Комфорт</h3>
          <p>Ми гарантуємо комфорт та зручність для наших гостей.</p>
        </div>
        <div className="feature-item">
          <h3>Зручне розташування</h3>
          <p>Наш готель розташований у самому центрі міста.</p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="cta-section">
        <button className="cta-button">Забронювати номер</button>
      </div>
    </div>
  );
};

export default HomePage;
