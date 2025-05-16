import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const RoomsPage = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/rooms")
      .then((response) => response.json())
      .then((data) => setRooms(data))
      .catch((err) => {
        setError("Помилка при завантаженні номерів");
        console.error(err);
      });
  }, []);

  return (
    <div>
      <h2>Номери</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            <p>{room.name} - {room.price} грн/день</p>
            <Link to={`/book/${room.id}`}>
              <button>Забронювати</button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomsPage;
