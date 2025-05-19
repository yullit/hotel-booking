import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './Dashboard.scss';

const Dashboard = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [user, setUser] = useState<{
    first_name: string;
    last_name: string;
  } | null>(null);
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

    // Отримуємо бронювання користувача з деталями номерів та фото
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
    return formattedDate.toLocaleDateString("uk-UA"); // Форматуємо за допомогою української локалі
  };

return (
  <div className="dashboard-page">
    <div className="dashboard-wrapper">
      {error && <p className="error-text">{error}</p>}

      {user ? (
        <h2 className="greeting">
          Вітаємо, {user.first_name} {user.last_name}!
        </h2>
      ) : (
        <p>Завантаження...</p>
      )}

      <h3 className="section-title">Ваші бронювання:</h3>

      {bookings.length > 0 ? (
        <div className="booking-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-container">
              {booking.photo_url && (
                <div className="image-wrapper">
                  <img
                    src={`http://localhost:5000${booking.photo_url}`}
                    alt={booking.name}
                  />
                </div>
              )}

              <div className="info">
                <h3>{booking.name}</h3>
                <p className="description">{booking.description}</p>
                <p className="info-line"><strong>Кількість осіб:</strong> {booking.capacity}</p>
                <p className="info-line"><strong>Дата заїзду:</strong> {formatDate(booking.check_in)}</p>
                <p className="info-line"><strong>Дата виїзду:</strong> {formatDate(booking.check_out)}</p>
                <p className="info-line"><strong>Сума:</strong> {booking.total_amount || "Немає суми"} грн</p>
              </div>

              <div className="actions">
                <button onClick={() => handleCancelBooking(booking.id)}>
                  Скасувати бронювання
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-bookings">У вас немає бронювань</p>
      )}
    </div>
  </div>
);

};

export default Dashboard;
