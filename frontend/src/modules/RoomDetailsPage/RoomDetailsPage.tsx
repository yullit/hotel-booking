import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Room } from "../../types/Room"; // Тип Room
import "./RoomDetailsPage.scss";

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

  // Функція для повернення на сторінку Номери
  const goBackToRooms = () => {
    navigate("/rooms");
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!room) return <p>Завантаження номеру...</p>;

  return (
    <div className="room-details-page">
      <div className="room-container">
        <h3>{room.name}</h3>

        {room.photo_url && (
          <div className="image-wrapper">
            <img
              src={`http://localhost:5000${room.photo_url}`}
              alt={room.name}
            />
          </div>
        )}

        <p className="description">{room.description}</p>
        <p className="info">Ціна: {room.price} грн/добу</p>
        <p className="info">Місткість: {room.capacity} осіб</p>

        <div className="date-inputs">
          <div className="input-group">
            <label>Дата заїзду:</label>
            <input
              type="date"
              onChange={(e) => setCheckInDate(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Дата виїзду:</label>
            <input
              type="date"
              onChange={(e) => setCheckOutDate(e.target.value)}
            />
          </div>
        </div>

        <div className="actions">
          {available === null && (
            <button className="check" onClick={checkAvailability}>
              Перевірити доступність
            </button>
          )}

          {available !== null && available && (
            <>
              <p className="available-text">
                Номер вільний для бронювання на обрані вами дати
              </p>
              <button onClick={handleBooking}>Забронювати</button>
            </>
          )}

          {available !== null && !available && (
            <>
              <p className="not-available">Номер не доступний</p>
              <button onClick={goBackToRooms}>Повернутись до номерів</button>
            </>
          )}

          {available !== null && (
            <button className="check-again" onClick={() => setAvailable(null)}>
              Перевірити інші дати
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsPage;