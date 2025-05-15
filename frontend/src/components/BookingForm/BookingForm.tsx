import React from 'react';
import './BookingForm.scss';

interface BookingFormProps {
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  setCheckInDate: React.Dispatch<React.SetStateAction<string>>;
  setCheckOutDate: React.Dispatch<React.SetStateAction<string>>;
  setGuests: React.Dispatch<React.SetStateAction<number>>;
  handleSubmit: (e: React.FormEvent) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  checkInDate,
  checkOutDate,
  guests,
  setCheckInDate,
  setCheckOutDate,
  setGuests,
  handleSubmit
}) => {
  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <div>
        <label htmlFor="check-in">Дата заїзду:</label>
        <input
          type="date"
          id="check-in"
          value={checkInDate}
          onChange={(e) => setCheckInDate(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="check-out">Дата виїзду:</label>
        <input
          type="date"
          id="check-out"
          value={checkOutDate}
          onChange={(e) => setCheckOutDate(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="guests">Кількість гостей:</label>
        <input
          type="number"
          id="guests"
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          min={1}
          required
        />
      </div>
      <button type="submit">Пошук номерів</button>
    </form>
  );
};

export default BookingForm;
