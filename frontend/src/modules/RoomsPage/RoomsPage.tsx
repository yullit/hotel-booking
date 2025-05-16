import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Room } from "../../types/Room"; // Імпортуємо тип Room

const RoomsPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]); // Тип для rooms
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:5000/rooms", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Rooms data:", data); // Перевірка отриманих даних
        setRooms(data);
      })
      .catch((err) => console.error("Помилка при отриманні кімнат:", err));
  }, [navigate]);

  // Обробник для бронювання
  const handleBooking = async (roomId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const checkIn = "2025-06-01"; // Тут можна отримати значення з форми
    const checkOut = "2025-06-07"; // Тут можна отримати значення з форми

    try {
      const response = await fetch("http://localhost:5000/user/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomId, checkIn, checkOut }),
      });

      if (response.ok) {
        const booking = await response.json();
        console.log("Booking successful", booking);
        alert("Бронювання успішно створено!");
      } else {
        const error = await response.json();
        alert("Помилка при бронюванні: " + error.message);
      }
    } catch (err) {
      console.error("Error while booking", err);
      alert("Помилка при бронюванні");
    }
  };

  return (
    <div>
      <h2>Номери</h2>
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            <p>
              {room.name} - {room.price} грн/день
            </p>
            <button onClick={() => handleBooking(room.id)}>Забронювати</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomsPage;
