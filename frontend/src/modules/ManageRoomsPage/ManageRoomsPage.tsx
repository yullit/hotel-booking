import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios, { AxiosResponse, AxiosError } from "axios";
import { Room } from "../../types/Room";
import './ManageRoomsPage.scss';

const ManageRoomsPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [formState, setFormState] = useState<Room | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null); // Для фото
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId?: string }>();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    if (decodedToken.role !== "manager") {
      navigate("/rooms");
    }

    if (roomId) {
      axios
        .get(`http://localhost:5000/rooms/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response: AxiosResponse<Room>) => {
          setFormState(response.data);
        })
        .catch((error: AxiosError) => {
          setError("Не вдалося завантажити номер для редагування");
          console.error(error);
        });
    } else {
      setFormState({
        id: 0,
        name: "",
        description: "",
        capacity: 1,
        price: 0,
        available_from: "",
        available_to: "",
        photo_url: "", // Додано фото_url для нових номерів
      });
    }

    axios
      .get("http://localhost:5000/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response: AxiosResponse<Room[]>) => {
        setRooms(response.data);
      })
      .catch((error: AxiosError) => {
        setError("Не вдалося завантажити номери");
        console.error(error);
      });
  }, [navigate, roomId]);

const handleFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const token = localStorage.getItem("token");

  if (!formState || !token) return;

  const formData = new FormData();
  if (selectedPhoto) {
    formData.append("photo", selectedPhoto); // Додаємо фото до FormData
    console.log('FormData перед відправкою:', formData); // Перевірка
  }

  try {
    let response: AxiosResponse<Room>;
    const { id, name, description, capacity, price, available_from, available_to } = formState;

    // Створення або редагування номера
    if (id && id !== 0) {
      // Редагування номера
      response = await axios.put(
        `http://localhost:5000/rooms/${id}`,
        { name, description, capacity, price, available_from, available_to },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else {
      // Додавання нового номера
      response = await axios.post(
        "http://localhost:5000/rooms",
        { name, description, capacity, price, available_from, available_to },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    // Якщо фото додається, відправляємо його на сервер
    if (selectedPhoto && response.data.id) {
      await axios.post(
        `http://localhost:5000/upload-photo/${response.data.id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );

      // Оновлюємо список номерів з новим фото
      setRooms((prevRooms) => {
        return prevRooms.map((room) =>
          room.id === response.data.id ? { ...room, photo_url: `/uploads/rooms/${response.data.id}.png` } : room
        );
      });
    }

    // Очищаємо форму і оновлюємо стан
    setFormState(null);
    setRooms([...rooms, response.data]); // Оновлення списку номерів
    window.location.reload(); // Оновлюємо сторінку

  } catch (error) {
    setError("Не вдалося зберегти зміни");
    console.error(error);
  }
};


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "capacity" || name === "price") {
      if (!/^\d*$/.test(value)) return;
    }

    if (formState) {
      setFormState({ ...formState, [name]: value });
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedPhoto(file); // Оновлюємо вибране фото
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      await axios.delete(`http://localhost:5000/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRooms(rooms.filter((room) => room.id !== id));
    } catch (error) {
      setError("Не вдалося видалити номер");
      console.error(error);
    }
  };

  const formatDate = (date: string) => {
    const formattedDate = new Date(date);
    return formattedDate.toLocaleDateString("uk-UA");
  };

return (
  <div className="manage-rooms-page">
    {error && <div className="error">{error}</div>}

    <div className="form-section">
      <h2>{formState?.id && formState.id !== 0 ? "Редагувати номер" : "Додати новий номер"}</h2>


      <form onSubmit={handleFormSubmit}>
        <div className="form-group">
          <label htmlFor="name">Назва номера:</label>
          <input
            type="text"
            name="name"
            value={formState?.name || ""}
            onChange={handleInputChange}
            id="name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Опис номера:</label>
          <input
            type="text"
            name="description"
            value={formState?.description || ""}
            onChange={handleInputChange}
            id="description"
          />
        </div>

        <div className="form-group">
          <label htmlFor="capacity">Місткість:</label>
          <input
            type="text"
            name="capacity"
            value={formState?.capacity || ""}
            onChange={handleInputChange}
            id="capacity"
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Ціна:</label>
          <input
            type="text"
            name="price"
            value={formState?.price || ""}
            onChange={handleInputChange}
            id="price"
          />
        </div>

        <div className="form-group">
          <label htmlFor="available_from">Доступний з:</label>
          <input
            type="date"
            name="available_from"
            value={formState?.available_from || ""}
            onChange={handleInputChange}
            id="available_from"
          />
        </div>

        <div className="form-group">
          <label htmlFor="available_to">Доступний до:</label>
          <input
            type="date"
            name="available_to"
            value={formState?.available_to || ""}
            onChange={handleInputChange}
            id="available_to"
          />
        </div>

        <div className="form-group">
          <label htmlFor="photo">Завантажити фото:</label>
          <input type="file" id="photo" onChange={handlePhotoChange} />
        </div>

        <button type="submit">
          {formState?.id ? "Зберегти зміни" : "Додати номер"}
        </button>
      </form>
    </div>

    <div className="room-list-section">
      <h3>Доступні номери:</h3>
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            <p><strong>Назва:</strong> {room.name}</p>
            <p><strong>Ціна:</strong> {room.price} грн</p>
            <p><strong>Місткість:</strong> {room.capacity}</p>
            <p><strong>Опис:</strong> {room.description}</p>
            <p><strong>Доступний з:</strong> {formatDate(room.available_from)}</p>
            <p><strong>Доступний до:</strong> {formatDate(room.available_to)}</p>

            {room.photo_url && (
              <img src={`http://localhost:5000${room.photo_url}`} alt="Room" />
            )}

            <div className="actions">
              <button onClick={() => setFormState(room)}>Редагувати</button>
              <button onClick={() => handleDelete(room.id)}>Видалити</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
);


};

export default ManageRoomsPage;
