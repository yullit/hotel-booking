// src/components/RoomCard.tsx
import React from 'react';

const RoomCard = ({ room, onBook }: { room: { name: string; price: number; capacity: number }; onBook: (roomName: string) => void }) => {
  return (
    <div className="room-card">
      <h3>{room.name}</h3>
      <p>Ціна: {room.price} грн/ніч</p>
      <p>Макс. кількість осіб: {room.capacity}</p>
      <button onClick={() => onBook(room.name)}>Забронювати</button>
    </div>
  );
};

export default RoomCard;
