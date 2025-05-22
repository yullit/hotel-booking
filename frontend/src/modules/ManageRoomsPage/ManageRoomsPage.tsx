import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios, { AxiosResponse, AxiosError } from "axios";
import { Room } from "../../types/Room";
import "./ManageRoomsPage.scss";

const ManageRoomsPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [formState, setFormState] = useState<Room | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
        photo_url: "",
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

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formState?.name.trim()) errors.name = "Введіть назву номера";
    if (!formState?.description.trim()) errors.description = "Введіть опис номера";
    if (!formState?.capacity) errors.capacity = "Вкажіть кількість осіб";
    if (!formState?.price) errors.price = "Вкажіть ціну";
    if (!formState?.available_from) errors.available_from = "Оберіть дату початку";
    if (!formState?.available_to) errors.available_to = "Оберіть дату завершення";
    if (formState?.id === 0 && !selectedPhoto) errors.photo = "Оберіть фото";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const confirmSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!formState || !token) return;

    const formData = new FormData();
    if (selectedPhoto) {
      formData.append("photo", selectedPhoto);
    }

    try {
      const { id, name, description, capacity, price, available_from, available_to } = formState;
      const isEdit = id && id !== 0;

      let response: AxiosResponse<Room>;

      if (isEdit) {
        response = await axios.put(
          `http://localhost:5000/rooms/${id}`,
          { name, description, capacity, price, available_from, available_to },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        response = await axios.post(
          "http://localhost:5000/rooms",
          { name, description, capacity, price, available_from, available_to },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      let updatedRoomData = response.data;

      if (selectedPhoto && response.data.id) {
        await axios.post(
          `http://localhost:5000/upload-photo/${response.data.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const updatedRoom = await axios.get(`http://localhost:5000/rooms/${response.data.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        updatedRoomData = updatedRoom.data;
      }

      if (isEdit) {
        setRooms(rooms.map((room) => room.id === response.data.id ? updatedRoomData : room));
      } else {
        setRooms([...rooms, updatedRoomData]);
      }

      setShowConfirm(false);
      setFormState({
        id: 0,
        name: "",
        description: "",
        capacity: 1,
        price: 0,
        available_from: "",
        available_to: "",
        photo_url: "",
      });

      setSelectedPhoto(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      setSuccessMessage(isEdit ? "Номер оновлено успішно!" : "Номер додано успішно!");
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (error) {
      setError("Не вдалося зберегти зміни");
      console.error(error);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setShowConfirm(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if ((name === "capacity" || name === "price") && !/^[0-9]*$/.test(value)) return;
    if (formState) {
      setFormState({ ...formState, [name]: value });
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      setFieldErrors({ ...fieldErrors, photo: "" });
    }
  };

  const handleDeleteConfirm = async () => {
    const token = localStorage.getItem("token");
    if (!token || roomToDelete === null) return;
    try {
      await axios.delete(`http://localhost:5000/rooms/${roomToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(rooms.filter((room) => room.id !== roomToDelete));
      setShowDeleteConfirm(false);
      setRoomToDelete(null);
    } catch (error) {
      setError("Не вдалося видалити номер");
      console.error(error);
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString("uk-UA");

  return (
    <>
      {successMessage && <div className="floating-message">{successMessage}</div>}
      <div className="manage-rooms-page">
        {error && <div className="error">{error}</div>}
        <div className="form-section">
          <h2>{formState?.id && formState.id !== 0 ? "Редагувати номер" : "Додати новий номер"}</h2>
          <form onSubmit={handleFormSubmit}>
            {[
              { name: "name", label: "Назва номера" },
              { name: "description", label: "Опис номера" },
              { name: "capacity", label: "Кількість осіб" },
              { name: "price", label: "Ціна" },
              { name: "available_from", label: "Доступний з", type: "date" },
              { name: "available_to", label: "Доступний до", type: "date" },
            ].map(({ name, label, type = "text" }) => (
              <div className="form-group" key={name}>
                <label htmlFor={name}>{label}:</label>
                <input
                  type={type}
                  name={name}
                  id={name}
                  value={(formState as any)?.[name] || ""}
                  onChange={handleInputChange}
                />
                {fieldErrors[name] && <div className="field-error">{fieldErrors[name]}</div>}
              </div>
            ))}
            <div className="form-group">
              <label htmlFor="photo">Завантажити фото:</label>
              <input type="file" id="photo" onChange={handlePhotoChange} ref={fileInputRef} />
              {fieldErrors.photo && <div className="field-error">{fieldErrors.photo}</div>}
            </div>
            <button type="submit">{formState?.id ? "Зберегти зміни" : "Додати номер"}</button>
          </form>
        </div>

        {showConfirm && (
          <div className="confirm-overlay">
            <div className="confirm-modal">
              <p>{formState?.id ? "Підтвердити редагування номера?" : "Підтвердити додавання номера?"}</p>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={confirmSubmit}>Так</button>
                <button className="keep-btn" onClick={() => setShowConfirm(false)}>Скасувати</button>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="confirm-overlay">
            <div className="confirm-modal">
              <p>Ви впевнені, що хочете видалити номер?</p>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={handleDeleteConfirm}>Так</button>
                <button className="keep-btn" onClick={() => { setShowDeleteConfirm(false); setRoomToDelete(null); }}>Скасувати</button>
              </div>
            </div>
          </div>
        )}

        <div className="room-list-section">
          <h3>Доступні номери:</h3>
          <ul>
            {rooms.map((room) => (
              <li key={room.id}>
                {room.photo_url && (
                  <img src={`http://localhost:5000${room.photo_url}`} alt="Room" />
                )}
                <div className="details">
                  <div className="info">
                    <p><strong>Назва:</strong> {room.name}</p>
                    <p><strong>Ціна за добу:</strong> {room.price} грн</p>
                    <p><strong>Кількість осіб:</strong> {room.capacity}</p>
                    <p><strong>Опис:</strong> {room.description}</p>
                    <p><strong>Доступний з:</strong> {formatDate(room.available_from)}</p>
                    <p><strong>Доступний до:</strong> {formatDate(room.available_to)}</p>
                  </div>
                  <div className="actions">
                    <button onClick={() => {
                      setFormState(room);
                      setSelectedPhoto(null);
                      setFieldErrors({});
                    }}>Редагувати</button>
                    <button onClick={() => {
                      setRoomToDelete(room.id);
                      setShowDeleteConfirm(true);
                    }}>Видалити</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default ManageRoomsPage;
