import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const RoomsPage = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [sortedRooms, setSortedRooms] = useState<any[]>([]); // Стан для відсортованих номерів
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none"); // Стан для збереження порядку сортування
  const [capacityFilter, setCapacityFilter] = useState<string>(""); // Стан для фільтрації по місткості

  useEffect(() => {
    fetch("http://localhost:5000/rooms")
      .then((response) => response.json())
      .then((data) => {
        setRooms(data);
        setSortedRooms(data); // Встановлюємо номери при першому завантаженні
      })
      .catch((err) => {
        setError("Помилка при завантаженні номерів");
        console.error(err);
      });
  }, []);

  // Функція для сортування номерів
  const sortRooms = (order: "asc" | "desc") => {
    const sorted = [...rooms].sort((a, b) => {
      if (order === "asc") {
        return a.price - b.price; // Сортуємо за зростанням
      } else {
        return b.price - a.price; // Сортуємо за спаданням
      }
    });
    setSortedRooms(sorted); // Оновлюємо відсортовані номери
  };

  // Обробник зміни сортування
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOrder = e.target.value as "asc" | "desc" | "none";
    setSortOrder(selectedOrder); // Оновлюємо стан для сортування

    if (selectedOrder === "none") {
      setSortedRooms(rooms); // Якщо "Обрати", не сортуємо номери
    } else {
      sortRooms(selectedOrder); // Сортуємо номери відповідно до вибраного порядку
    }
  };

  // Функція для фільтрації номерів за місткістю
  const filterRoomsByCapacity = (rooms: any[]) => {
    if (capacityFilter) {
      return rooms.filter(room => room.capacity === parseInt(capacityFilter));
    }
    return rooms;
  };

  // Обробник зміни фільтру за місткістю
  const handleCapacityFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCapacityFilter(e.target.value);
  };

  // Фільтруємо номери за місткістю перед сортуванням
  const filteredRooms = filterRoomsByCapacity(sortedRooms);

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
          <option value="none" disabled={sortOrder !== "none"}>Обрати</option> {/* Додаємо опцію "Обрати", що стає недоступною при виборі сортування */}
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
        {filteredRooms.map((room) => (
          <li key={room.id}>
            <p>{room.name} - {room.price} грн/добу</p>
            <Link to={`/rooms/${room.id}`}>
              <button>Переглянути номер</button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomsPage;
