// src/components/BookingForm/BookingForm.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BookingForm = () => {
  const [checkInDate, setCheckInDate] = useState<string | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkInDate || !checkOutDate) {
      alert("Будь ласка, виберіть обидві дати.");
      return;
    }

    // Перенаправлення на сторінку з номерами, передаємо обрані дати
    navigate("/rooms", {
      state: { checkInDate, checkOutDate },
    });
  };

  return (
    <div>
      <div>
        <label>Дата заїзду:</label>
        <input
          type="date"
          value={checkInDate || ""}
          onChange={(e) => setCheckInDate(e.target.value)}
        />
      </div>
      <div>
        <label>Дата виїзду:</label>
        <input
          type="date"
          value={checkOutDate || ""}
          onChange={(e) => setCheckOutDate(e.target.value)}
        />
      </div>
      <button type="submit" onClick={handleSubmit}>
        Перевірити наявність номерів
      </button>
    </div>
  );
};

export default BookingForm;
