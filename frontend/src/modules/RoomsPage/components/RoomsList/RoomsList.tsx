import { useState, useEffect } from "react";
import { Room } from "../../../../types/Room"; // Імпортуємо тип

const RoomsList = () => {
  const [rooms, setRooms] = useState<Room[]>([]); // Використовуємо тип Room для стану

  useEffect(() => {
    // Запит до бекенду для отримання кімнат
    fetch("http://localhost:5000/rooms")  // Це твій бекенд
      .then((response) => response.json())  // Обробка JSON
      .then((data) => setRooms(data))  // Збереження отриманих даних
      .catch((error) => console.error("Помилка при отриманні кімнат:", error));  // Логування помилки
  }, []); // Пустий масив залежностей - це означає, що запит виконується один раз після рендеру компонента

  return (
    <div>
      <h2>Список кімнат</h2>
      <ul>
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <li key={room.id}>
              {room.name} - {room.price} грн
            </li>
          ))
        ) : (
          <p>Немає доступних кімнат</p>
        )}
      </ul>
    </div>
  );
};

export default RoomsList;
