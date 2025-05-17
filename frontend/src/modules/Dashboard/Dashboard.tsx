import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/login");
    return;
  }

  const decodedToken = JSON.parse(atob(token.split(".")[1])); // Декодуємо токен
  if (decodedToken.role === "manager") {
    navigate("/manage-rooms"); // Перенаправляємо на сторінку для менеджера
  }

  fetch("http://localhost:5000/user/bookings", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (Array.isArray(data)) {
        setBookings(data); // Якщо відповідь є масивом
      } else {
        setError("Невірний формат даних");  // Якщо дані мають неправильний формат
      }
    })
    .catch((err) => {
      setError("Помилка при отриманні бронювань");
      console.error(err);
    });
}, [navigate]);


  const handleCancelBooking = async (bookingId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:5000/user/bookings/${bookingId}`, // Перевірте правильність URL
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setBookings(bookings.filter((booking) => booking.id !== bookingId));
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Не вдалося скасувати бронювання");
      }
    } catch (err) {
      setError("Помилка при скасуванні бронювання");
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Особистий кабінет</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <h2>Ваші бронювання</h2>
      <ul>
        {Array.isArray(bookings) ? (
          bookings.map((booking) => (
            <li key={booking.id}>
              <p>Номер: {booking.roomName}</p>
              <p>Дата заїзду: {booking.check_in}</p>
              <p>Дата виїзду: {booking.check_out}</p>
              <button onClick={() => handleCancelBooking(booking.id)}>
                Скасувати бронювання
              </button>
            </li>
          ))
        ) : (
          <p>Немає бронювань</p>
        )}
      </ul>
    </div>
  );
};

export default Dashboard;
