// src/pages/RoomsPage.tsx
import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";

const RoomsPage = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [sortedRooms, setSortedRooms] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none");
  const [capacityFilter, setCapacityFilter] = useState<string>("");

  const location = useLocation();
  const navigate = useNavigate();
  const { checkInDate, checkOutDate } = location.state || {};

  useEffect(() => {
    fetch("http://localhost:5000/rooms")
      .then((response) => response.json())
      .then((data) => {
        setRooms(data);
        setSortedRooms(data);
      })
      .catch((err) => {
        setError("Помилка при завантаженні номерів");
        console.error(err);
      });
  }, []);

  // Функція для порівняння дат
  const isRoomAvailable = (room: any, checkInDate: Date, checkOutDate: Date) => {
    const roomAvailableFrom = new Date(room.available_from).getTime();
    const roomAvailableTo = new Date(room.available_to).getTime();
    const checkInTime = checkInDate.getTime();
    const checkOutTime = checkOutDate.getTime();

    // Перевірка на доступність номера (немає перетину з іншими бронюваннями)
    return roomAvailableFrom <= checkInTime && roomAvailableTo >= checkOutTime;
  };

  const filterRoomsByAvailability = (rooms: any[]) => {
    if (checkInDate && checkOutDate) {
      return rooms.filter((room) => isRoomAvailable(room, checkInDate, checkOutDate));
    }
    return rooms;
  };

  const filteredRooms = filterRoomsByAvailability(sortedRooms);

  const sortRooms = (order: "asc" | "desc") => {
    const sorted = [...filteredRooms].sort((a, b) => {
      if (order === "asc") {
        return a.price - b.price;
      } else {
        return b.price - a.price;
      }
    });
    setSortedRooms(sorted);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOrder = e.target.value as "asc" | "desc" | "none";
    setSortOrder(selectedOrder);
    if (selectedOrder === "none") {
      setSortedRooms(rooms);
    } else {
      sortRooms(selectedOrder);
    }
  };

  const filterRoomsByCapacity = (rooms: any[]) => {
    if (capacityFilter) {
      return rooms.filter((room) => room.capacity === parseInt(capacityFilter));
    }
    return rooms;
  };

  const handleCapacityFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCapacityFilter(e.target.value);
  };

  const finalFilteredRooms = filterRoomsByCapacity(filteredRooms);

  const goBackToHomePage = () => {
    navigate("/"); // Перенаправлення на HomePage
  };

  return (
    <div>
      <h2>Номери</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div>
        <label htmlFor="sortOrder">Сортувати за ціною: </label>
        <select
          id="sortOrder"
          value={sortOrder}
          onChange={handleSortChange}
        >
          <option value="none" disabled={sortOrder !== "none"}>Обрати</option>
          <option value="asc">За зростанням</option>
          <option value="desc">За спаданням</option>
        </select>
      </div>

      <div>
        <label htmlFor="capacityFilter">Фільтрувати за місткістю: </label>
        <select
          id="capacityFilter"
          value={capacityFilter}
          onChange={handleCapacityFilterChange}
        >
          <option value="">Обрати місткість</option>
          <option value="1">1 особа</option>
          <option value="2">2 особи</option>
          <option value="3">3 особи</option>
          <option value="4">4 особи</option>
        </select>
      </div>

      <ul>
        {finalFilteredRooms.map((room) => (
          <li key={room.id}>
            <p>{room.name} - {room.price} грн/добу</p>
            <Link to={`/rooms/${room.id}`}>
              <button>Переглянути номер</button>
            </Link>
          </li>
        ))}
      </ul>

      {/* Кнопка для повернення на сторінку вибору дат */}
      <button onClick={goBackToHomePage}>Обрати інші дати</button>
    </div>
  );
};

export default RoomsPage;
