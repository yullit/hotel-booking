import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const BookingPage = () => {
  const { id } = useParams(); // Отримуємо id з URL
  const navigate = useNavigate();
  const [room, setRoom] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // Якщо користувач не авторизований, перенаправляємо на сторінку логіну
      return;
    }

    if (id) {
      // Отримуємо дані про номер по ID
      fetch(`http://localhost:5000/rooms/${id}`)
        .then((response) => response.json())
        .then((data) => setRoom(data))
        .catch((err) => {
          setError("Помилка при завантаженні номеру");
          console.error(err);
        });
    }
  }, [id, navigate]);

  const handleBooking = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const checkIn = "2025-06-01"; // Можна отримати з форми
    const checkOut = "2025-06-07"; // Можна отримати з форми

    fetch("http://localhost:5000/user/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomId: id, checkIn, checkOut }),
    })
      .then((response) => response.json())
      .then(() => {
        alert("Бронювання успішно створено!");
        navigate("/dashboard");
      })
      .catch((err) => {
        console.error("Помилка при бронюванні", err);
        alert("Помилка при бронюванні");
      });
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!room) return <p>Завантаження номеру...</p>;

  return (
    <div>
      <h2>Бронювання номеру: {room.name}</h2>
      <p>Ціна: {room.price} грн/день</p>
      <button onClick={handleBooking}>Підтвердити бронювання</button>
    </div>
  );
};

export default BookingPage;
