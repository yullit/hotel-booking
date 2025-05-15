import React from "react";
import RoomsList from "./components/RoomsList/RoomsList";  // Імпортуємо компонент RoomsList

const RoomsPage = () => {
  return (
    <div>
      <h1>Сторінка кімнат</h1>
      <RoomsList />  {/* Додаємо компонент для відображення кімнат */}
    </div>
  );
};

export default RoomsPage;
