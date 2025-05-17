import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Room } from "../../types/Room"; // Тип Room

const RoomDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null); // Використовуємо тип Room
  const [checkInDate, setCheckInDate] = useState<string | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<string | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Завантаження номеру по id
  useEffect(() => {
    fetch(`http://localhost:5000/rooms/${id}`)
      .then((response) => response.json())
      .then((data) => setRoom(data))
      .catch((err) => {
        setError("Помилка при завантаженні номеру");
        console.error(err);
      });
  }, [id]);

  // Перевірка доступності номера на вказані дати
  const checkAvailability = async () => {
    if (!checkInDate || !checkOutDate) {
      setError("Будь ласка, виберіть дати.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/check-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId: id,
          checkIn: checkInDate,
          checkOut: checkOutDate,
        }),
      });

      const data = await response.json();
      setAvailable(data.available);
    } catch (err) {
      setError("Помилка при перевірці доступності");
      console.error(err);
    }
  };

  const handleBooking = () => {
    if (available) {
      navigate(`/book/${id}`, { state: { checkInDate, checkOutDate } });
    } else {
      setError("Цей номер не доступний на обрані дати.");
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!room) return <p>Завантаження номеру...</p>;

  return (
    <div>
      <h2>{room.name}</h2>
      <p>{room.description}</p>
      <p>Ціна: {room.price} грн/день</p>
      <p>Місткість: {room.capacity} осіб</p>

      <div>
        <label>Дата заїзду:</label>
        <input
          type="date"
          onChange={(e) => setCheckInDate(e.target.value)}
        />
      </div>
      <div>
        <label>Дата виїзду:</label>
        <input
          type="date"
          onChange={(e) => setCheckOutDate(e.target.value)}
        />
      </div>

      <button onClick={checkAvailability}>Перевірити доступність</button>

      {available !== null && (
        <button onClick={handleBooking} disabled={!available}>
          {available ? "Забронювати" : "Номер не доступний"}
        </button>
      )}
    </div>
  );
};

export default RoomDetailsPage;
