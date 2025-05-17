import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [user, setUser] = useState<{ first_name: string; last_name: string } | null>(null);
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

    // Отримуємо дані користувача
    fetch("http://localhost:5000/user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setUser(data); // Зберігаємо ім'я та прізвище користувача
      })
      .catch((err) => {
        setError("Помилка при отриманні даних користувача");
        console.error(err);
      });

    // Отримуємо бронювання користувача з деталями номерів
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
          setError("Невірний формат даних");
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
        `http://localhost:5000/user/bookings/${bookingId}`,
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

  // Функція для форматування дати
  const formatDate = (date: string) => {
    const formattedDate = new Date(date);
    return formattedDate.toLocaleDateString('uk-UA'); // Форматуємо за допомогою української локалі
  };

  return (
    <div>
      <h1>Особистий кабінет</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {user ? (
        <h1>Вітаємо, {user.first_name} {user.last_name}</h1>
      ) : (
        <p>Завантаження...</p>
      )}

      <h2>Ваші бронювання</h2>
      <ul>
        {Array.isArray(bookings) ? (
          bookings.map((booking) => (
            <li key={booking.id}>
              <p>Номер: {booking.name}</p>
              <p>Опис: {booking.description}</p>
              <p>Ціна: {booking.price} грн/день</p>
              <p>Місткість: {booking.capacity} осіб</p>
              <p>Дата заїзду: {formatDate(booking.check_in)}</p>
              <p>Дата виїзду: {formatDate(booking.check_out)}</p>
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
