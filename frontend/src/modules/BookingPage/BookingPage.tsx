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

  const [cardNumberError, setCardNumberError] = useState<string | null>(null);
  const [cardExpiryError, setCardExpiryError] = useState<string | null>(null);
  const [cardCvcError, setCardCvcError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [cardNumberComplete, setCardNumberComplete] = useState(false);
  const [cardExpiryComplete, setCardExpiryComplete] = useState(false);
  const [cardCvcComplete, setCardCvcComplete] = useState(false);

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
        return "Термін дії картки вже минув.";
      case "Your card's security code is incomplete.":
      case "Your card’s security code is incomplete.":
        return "Код CVV неповний.";
      case "Your card has insufficient funds.":
        return "Недостатньо коштів на картці. Спробуйте іншу картку.";
      case "Your card was declined.":
        return "Картку відхилено. Спробуйте іншу або зверніться до банку.";
      default:
        return "Оплата відхилена: недостатньо коштів на картці.";
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMessage(null);
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: totalPrice }),
      });

      const { clientSecret } = await response.json();
      const cardElement = elements.getElement(CardNumberElement);
      if (!cardElement) {
        setErrorMessage("Не вдалося отримати дані картки");
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: { card: cardElement } }
      );

      if (error) {
        setErrorMessage(translateCardError(error.message || ""));
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
              "Бронювання успішне!<br/> Ви будете перенаправлені в особистий кабінет"
            );
            setPaymentSuccess(true);
            setTimeout(() => navigate("/dashboard"), 6000);
          })
          .catch(() => setErrorMessage("Помилка при створенні бронювання"));
      }
    } catch {
      setErrorMessage("Помилка при обробці платежу");
    } finally {
      setLoading(false);
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!room) return <p>Завантаження номеру...</p>;

  return (
    <div className="booking-page">
      <div className="booking-container">
        <h2>Бронювання номеру</h2>
        <p className="room-name">{room.name}</p>

        <p className="total-price">Загальна сума до оплати: {totalPrice} грн</p>

        <form className="payment-form" onSubmit={handlePayment} noValidate>
          <label htmlFor="card-number">Номер картки:</label>
          <div className="card-element-wrapper">
            <CardNumberElement
              id="card-number"
              onChange={(e) => {
                setCardNumberComplete(e.complete);
                setCardNumberError(e.error ? translateCardError(e.error.message) : null);
              }}
              options={{ showIcon: true, disableLink: true }}
            />
          </div>
          {cardNumberError && <p className="card-error">{cardNumberError}</p>}

          <label htmlFor="card-expiry">Термін дії:</label>
          <div className="card-element-wrapper">
            <CardExpiryElement
              id="card-expiry"
              onChange={(e) => {
                setCardExpiryComplete(e.complete);
                setCardExpiryError(e.error ? translateCardError(e.error.message) : null);
              }}
            />
          </div>
          {cardExpiryError && <p className="card-error">{cardExpiryError}</p>}

          <label htmlFor="card-cvc">CVV:</label>
          <div className="card-element-wrapper">
            <CardCvcElement
              id="card-cvc"
              onChange={(e) => {
                setCardCvcComplete(e.complete);
                setCardCvcError(e.error ? translateCardError(e.error.message) : null);
              }}
            />
          </div>
          {cardCvcError && <p className="card-error">{cardCvcError}</p>}

          <button
            type="submit"
            disabled={
              loading ||
              !stripe ||
              !elements ||
              !cardNumberComplete ||
              !cardExpiryComplete ||
              !cardCvcComplete ||
              !!cardNumberError ||
              !!cardExpiryError ||
              !!cardCvcError
            }
          >
            {loading ? "Зачекайте..." : "Оплатити та підтвердити бронювання"}
          </button>

          {errorMessage && (
            <p className="card-error" style={{ marginTop: "10px", textAlign: "center" }}>
              {errorMessage}
            </p>
          )}
        </form>

        {paymentSuccess && successMessage && (
          <div
  className="floating-message success-floating"
  dangerouslySetInnerHTML={{ __html: successMessage || "" }}
></div>

        )}
      </div>
    </div>
  );
};

export default BookingPage;
