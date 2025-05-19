import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import "./BookingPage.scss";

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { checkInDate, checkOutDate } = location.state || {};
  const [room, setRoom] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [cardError, setCardError] = useState<string | null>(null); // ⚡ нове
  const [cardComplete, setCardComplete] = useState(false); // чи картка повністю введена

  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
        .then((res) => res.json())
        .then((data) => setRoom(data))
        .catch(() => setError("Помилка при завантаженні номеру"));
    }
  }, [id, navigate]);

  useEffect(() => {
    if (checkInDate && checkOutDate && room) {
      const days = Math.ceil(
        (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      setTotalPrice(room.price * days);
    }
  }, [checkInDate, checkOutDate, room]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/create-payment-intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount: totalPrice }),
        }
      );

      const { clientSecret } = await response.json();
      const cardElement = elements.getElement(CardNumberElement);
      if (!cardElement) {
        setError("Не вдалося отримати дані картки");
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: { card: cardElement },
        }
      );

      if (error) {
        setError(error.message || "Помилка при оплаті");
      } else if (paymentIntent.status === "succeeded") {
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
            totalAmount: totalPrice,
          }),
        })
          .then(() => {
            setSuccessMessage(
              "Бронювання успішно створено! Ви будете перенаправлені..."
            );
            setPaymentSuccess(true);
            setTimeout(() => navigate("/dashboard"), 3000);
          })
          .catch(() => setError("Помилка при створенні бронювання"));
      }
    } catch {
      setError("Помилка при обробці платежу");
    } finally {
      setLoading(false);
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!room) return <p>Завантаження номеру...</p>;

  const translateCardError = (message: string) => {
    switch (message) {
      case "Your card number is incomplete.":
        return "Номер картки неповний.";
      case "Your card number is invalid.":
        return "Номер картки недійсний.";

      case "Your card's expiration date is incomplete.":
      case "Your card’s expiration date is incomplete.":
        return "Термін дії картки неповний.";

      case "Your card's expiration year is in the past.":
      case "Your card’s expiration year is in the past.":
        return "Рік завершення дії картки вже минув.";

      case "Your card's security code is incomplete.":
      case "Your card’s security code is incomplete.":
        return "Код CVV неповний.";

      default:
        return message;
    }
  };

  return (
    <div className="booking-page">
      <div className="booking-container">
        <h2>Бронювання номеру: {room.name}</h2>
        <p className="total-price">Загальна сума до оплати: {totalPrice} грн</p>

        <form className="payment-form" onSubmit={handlePayment} noValidate>
          <label htmlFor="card-number">Номер картки:</label>
          <div className="card-element-wrapper">
            <CardNumberElement
              id="card-number"
              onChange={(e) => {
                setCardComplete(e.complete);
                if (e.error) {
                  setCardError(translateCardError(e.error.message));
                } else {
                  setCardError(null);
                }
              }}
              options={{ showIcon: true, disableLink: true }}
            />
          </div>

          <label htmlFor="card-expiry">Термін дії:</label>
          <div className="card-element-wrapper">
            <CardExpiryElement
              id="card-expiry"
              onChange={(e) => {
                if (e.error) {
                  setCardError(translateCardError(e.error.message));
                } else {
                  setCardError(null);
                }
              }}
            />
          </div>

          <label htmlFor="card-cvc">CVV:</label>
          <div className="card-element-wrapper">
            <CardCvcElement
              id="card-cvc"
              onChange={(e) => {
                if (e.error) {
                  setCardError(translateCardError(e.error.message));
                } else {
                  setCardError(null);
                }
              }}
            />
          </div>

          {cardError && <p className="card-error">{cardError}</p>}

          <button
            type="submit"
            disabled={
              loading || !stripe || !elements || !!cardError || !cardComplete
            }
          >
            {loading ? "Зачекайте..." : "Оплатити та підтвердити бронювання"}
          </button>
        </form>

        {paymentSuccess && successMessage && (
          <p className="success-message">{successMessage}</p>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
