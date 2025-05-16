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

  return (
    <div>
      <h2>Номери</h2>
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            <p>
              {room.name} - {room.price} грн/день
            </p>
            <button>Забронювати</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomsPage;
