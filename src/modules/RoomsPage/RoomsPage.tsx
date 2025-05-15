// src/modules/RoomsPage/RoomsPage.tsx
import React, { useState } from 'react';
import RoomCard from '../../components/RoomCard/RoomCard';

const RoomsPage = () => {
  const [bookedRooms, setBookedRooms] = useState<string[]>([]);

  const rooms = [
    { id: 1, name: 'Apartment Classic', price: 226, capacity: 2 },
    { id: 2, name: 'Apartment Superior', price: 262, capacity: 2 },
    { id: 3, name: 'Apartment Deluxe', price: 280, capacity: 2 },
    { id: 4, name: 'Apartment Superior Suite', price: 370, capacity: 3 },
    { id: 5, name: 'Apartment Deluxe 3-persons', price: 339, capacity: 3 },
  ];

  const handleBooking = (roomName: string) => {
    setBookedRooms((prev) => [...prev, roomName]);
  };

  return (
    <div className="rooms-page">
      <h1>Номери</h1>
      <div className="room-list">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} onBook={handleBooking} />
        ))}
      </div>

      <div>
        <h2>Заброньовані номери:</h2>
        <ul>
          {bookedRooms.map((room, index) => (
            <li key={index}>{room}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RoomsPage;
