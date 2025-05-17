import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";  // Імпортуємо Stripe Elements

const BookingPage = () => {
  const { id } = useParams();  // Отримуємо ID номера
  const navigate = useNavigate();
  const location = useLocation(); // Отримуємо state з RoomDetailsPage
  const { checkInDate, checkOutDate } = location.state || {};
  const [room, setRoom] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState<number>(0); // Загальна ціна
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (id) {
      fetch(`http://localhost:5000/rooms/${id}`)
        .then((response) => response.json())
        .then((data) => setRoom(data))
        .catch((err) => {
          setError("Помилка при завантаженні номеру");
          console.error(err);
        });
    }
  }, [id, navigate]);

  // Функція для обчислення кількості днів між датами
  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Перетворюємо мілісекунди на дні
    return diffDays;
  };

  // Обчислюємо загальну суму
  useEffect(() => {
    if (checkInDate && checkOutDate && room) {
      const days = calculateDays(checkInDate, checkOutDate);
      setTotalPrice(room.price * days); // Множимо ціну за день на кількість днів
    }
  }, [checkInDate, checkOutDate, room]);

  const handlePayment = async () => {
    if (!stripe || !elements) {
      // Якщо Stripe або Elements ще не ініціалізовані, не робимо нічого
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // Запит на створення Payment Intent
      const response = await fetch("http://localhost:5000/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: totalPrice }),  // amount - це ціна номера
      });

      const { clientSecret } = await response.json(); // Отримуємо clientSecret

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setError("Не вдалося отримати дані картки");
        return;
      }

      // Завершення платежу через Stripe Elements
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement, // Збираємо дані картки
        },
      });

      if (error) {
        setError(error.message || "Помилка при обробці платежу"); // Якщо є помилка при оплаті
      } else if (paymentIntent.status === "succeeded") {
        // Якщо оплата пройшла успішно
        const token = localStorage.getItem("token");
        fetch("http://localhost:5000/user/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            roomId: id,
            checkIn: checkInDate,
            checkOut: checkOutDate,
          }), // Передаємо дату бронювання
        })
          .then(() => {
            alert("Бронювання успішно створено!");
            navigate("/dashboard");  // Перенаправляємо користувача в особистий кабінет
          })
          .catch((err) => {
            setError("Помилка при створенні бронювання");
            console.error(err);
          });
      }
    } catch (err) {
      setError("Помилка при обробці платежу");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!room) return <p>Завантаження номеру...</p>;

  return (
    <div>
      <h2>Бронювання номеру: {room.name}</h2>
      <p>Ціна: {room.price} грн/день</p>
      <p>Загальна сума до оплати: {totalPrice} грн</p>
      <div>
        {/* Форма для введення платіжних даних */}
        <CardElement />
      </div>
      <button onClick={handlePayment} disabled={loading}>
        {loading ? "Зачекайте..." : "Оплатити та підтвердити бронювання"}
      </button>
    </div>
  );
};

export default BookingPage;
