import React, { useState } from 'react';
import DatePicker from 'react-datepicker'; // Імпортуємо компонент календаря
import 'react-datepicker/dist/react-datepicker.css'; // Стилі для календаря
import './BookingForm.scss';

const BookingForm = () => {
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Логіка для перевірки наявності номерів
    console.log('Перевірка наявності для:', checkInDate, checkOutDate);
  };

  return (
    <div className="booking-form">
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-item">
          <label>Дата заїзду</label>
          <DatePicker
            selected={checkInDate}
            onChange={(date: Date | null) => setCheckInDate(date)}
            placeholderText="Виберіть дату"
            className="datepicker"
          />
        </div>
        <div className="form-item">
          <label>Дата виїзду</label>
          <DatePicker
            selected={checkOutDate}
            onChange={(date: Date | null) => setCheckOutDate(date)}
            placeholderText="Виберіть дату"
            className="datepicker"
          />
        </div>
        <button type="submit" className="check-availability-button">
          Перевірити наявність
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
