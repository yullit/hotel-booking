import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios, { AxiosResponse, AxiosError } from "axios"; // Додаємо типи для axios
import { Room } from "../../types/Room"; // Тип для номера

const ManageRoomsPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [formState, setFormState] = useState<Room | null>(null); // Для форми додавання/редагування
  const [user, setUser] = useState<{
    first_name: string;
    last_name: string;
  } | null>(null); // Для імені та прізвища менеджера
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId?: string }>(); // Отримуємо параметр roomId з URL

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

    // Отримуємо дані менеджера (ім'я та прізвище)
    axios
      .get("http://localhost:5000/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response: AxiosResponse) => {
        setUser(response.data); // Зберігаємо ім'я та прізвище менеджера
      })
      .catch((error: AxiosError) => {
        setError("Помилка при отриманні даних користувача");
        console.error(error);
      });

    // Якщо roomId є, то ми редагуємо існуючий номер
    if (roomId) {
      axios
        .get(`http://localhost:5000/rooms/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response: AxiosResponse<Room>) => {
          // Типізуємо response
          setFormState(response.data); // Завантажуємо номер для редагування
        })
        .catch((error: AxiosError) => {
          // Типізуємо error
          setError("Не вдалося завантажити номер для редагування");
          console.error(error);
        });
    } else {
      // Якщо roomId немає, це для додавання нового номера
      setFormState({
        id: 0,
        name: "",
        description: "",
        capacity: 1,
        price: 0,
        available_from: "",
        available_to: "",
      });
    }

    // Отримання всіх номерів для перегляду
    axios
      .get("http://localhost:5000/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response: AxiosResponse<Room[]>) => {
        // Типізуємо response
        setRooms(response.data);
      })
      .catch((error: AxiosError) => {
        // Типізуємо error
        setError("Не вдалося завантажити номери");
        console.error(error);
      });
  }, [navigate, roomId]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!formState || !token) return;

    try {
      const {
        id,
        name,
        description,
        capacity,
        price,
        available_from,
        available_to,
      } = formState;
      let response: AxiosResponse<Room>;

      if (id && id !== 0) {
        // Якщо є id, редагуємо номер
        response = await axios.put(
          `http://localhost:5000/rooms/${id}`,
          { name, description, capacity, price, available_from, available_to },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Оновлюємо відповідний номер у списку
        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.id === id ? { ...room, ...response.data } : room
          )
        );
      } else {
        // Якщо id немає, додаємо новий номер
        response = await axios.post(
          "http://localhost:5000/rooms",
          { name, description, capacity, price, available_from, available_to },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setRooms([...rooms, response.data]);
      }

      // Очищаємо форму після збереження
      setFormState(null);
    } catch (error) {
      setError("Не вдалося зберегти зміни");
      console.error(error);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Перевірка для полів, де ми хочемо лише цифри
    if (name === "capacity" || name === "price") {
      // Дозволяємо вводити лише цифри
      if (!/^\d*$/.test(value)) return;
    }

    if (formState) {
      setFormState({ ...formState, [name]: value });
    }
  };

  return (
    <div>
      {user ? (
        <h1>
          Вітаємо, {user.first_name} {user.last_name}!
        </h1> // Вітання для менеджера
      ) : (
        <p>Завантаження...</p>
      )}

      {roomId ? (
        <h1>Редагувати номер</h1>
      ) : (
        <h2>Ви можете керувати номерами готелю:</h2> // Назва сторінки замість "Додати новий номер"
      )}

      {error && <div className="error">{error}</div>}

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

        <button type="submit">
          {formState?.id ? "Зберегти зміни" : "Додати номер"}
        </button>
      </form>

      <h3>Доступні номери:</h3>
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            <p>
              <strong>Назва:</strong> {room.name}
            </p>
            <p>
              <strong>Ціна:</strong> {room.price} грн
            </p>
            <p>
              <strong>Місткість:</strong> {room.capacity}
            </p>
            <p>
              <strong>Опис:</strong> {room.description}
            </p>
            <p>
              <strong>Доступний з:</strong> {room.available_from}
            </p>
            <p>
              <strong>Доступний до:</strong> {room.available_to}
            </p>
            <button onClick={() => setFormState(room)}>Редагувати</button>
            <button onClick={() => handleDelete(room.id)}>Видалити</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageRoomsPage;
