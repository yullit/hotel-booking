import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Room } from "../../types/Room"; // Імпортуємо тип Room

const ManageRoomsPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const decodedToken = JSON.parse(atob(token.split(".")[1])); // Декодуємо токен
    if (decodedToken.role !== "manager") {
      navigate("/rooms"); // Якщо не менеджер, перенаправляємо на сторінку з номерами
    }

    fetch("http://localhost:5000/rooms", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setRooms(data))
      .catch((err) => setError("Помилка при отриманні даних"));
  }, [navigate]);

  const handleDelete = (roomId: number) => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5000/rooms/${roomId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then(() => setRooms(rooms.filter((room) => room.id !== roomId))) 
      .catch((err) => setError("Помилка при видаленні номера"));
  };

  return (
    <div>
      <h2>Управління номерами</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            <p>
              {room.name} - {room.price} грн/день
            </p>
            <button onClick={() => handleDelete(room.id)}>Видалити</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageRoomsPage;
