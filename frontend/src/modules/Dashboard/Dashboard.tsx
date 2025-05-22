import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.scss";

const Dashboard = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [user, setUser] = useState<{ first_name: string; last_name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canceledBookingId, setCanceledBookingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    if (decodedToken.role === "manager") {
      navigate("/manage-rooms");
    }

    fetch("http://localhost:5000/user", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(() => setError("Помилка при отриманні даних користувача"));

    fetch("http://localhost:5000/user/bookings", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBookings(data);
        else setError("Невірний формат даних");
      })
      .catch(() => setError("Помилка при отриманні бронювань"));
  }, [navigate]);

  const handleCancelBooking = async (bookingId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/user/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setCanceledBookingId(bookingId);
        setTimeout(() => {
          setBookings((prev) => prev.filter((b) => b.id !== bookingId));
          setCanceledBookingId(null);
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Не вдалося скасувати бронювання");
      }
    } catch {
      setError("Помилка при скасуванні бронювання");
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("uk-UA");

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

        {bookings.length > 0 && (
          <h3 className="section-title">Ваші бронювання:</h3>
        )}

        {bookings.length > 0 ? (
          <div className="booking-list">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-container">
                <div className="image-wrapper">
                  <img src={`http://localhost:5000${booking.photo_url}`} alt={booking.name} />
                  {canceledBookingId === booking.id && (
                    <div className="floating-message">Бронювання скасовано успішно!</div>
                  )}
                </div>

                <div className="info">
                  <h3 className="room-name">{booking.name}</h3>
                  <p className="info-line"><strong>Кількість осіб:</strong> {booking.capacity}</p>
                  <p className="info-line"><strong>Дата заїзду:</strong> {formatDate(booking.check_in)}</p>
                  <p className="info-line"><strong>Дата виїзду:</strong> {formatDate(booking.check_out)}</p>
                  <p className="info-line"><strong>Сума:</strong> {booking.total_amount || "Немає суми"} грн</p>
                </div>

                <div className="actions">
                  <button onClick={() => {
                    setShowConfirm(true);
                    setBookingToCancel(booking.id);
                  }}>
                    Скасувати бронювання
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-bookings no-bookings-clean">
            Наразі у вас немає жодного бронювання.
            <br />
            Не проґавте шанс відпочити! Перегляньте наші найкращі пропозиції та
            оберіть ідеальний номер вже зараз.
          </p>
        )}
      </div>

      {showConfirm && bookingToCancel && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <p>Ви впевнені, що хочете скасувати бронювання?</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => {
                handleCancelBooking(bookingToCancel);
                setShowConfirm(false);
                setBookingToCancel(null);
              }}>
                Так, скасувати
              </button>
              <button className="keep-btn" onClick={() => {
                setShowConfirm(false);
                setBookingToCancel(null);
              }}>
                Залишити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
