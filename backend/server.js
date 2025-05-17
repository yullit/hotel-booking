const express = require("express");
const bodyParser = require("body-parser");
const { Client } = require("pg");
const jwt = require("jsonwebtoken"); // Для авторизації
const bcrypt = require("bcryptjs"); // Для хешування паролів
const cors = require("cors"); // Імпортуємо cors
require("dotenv").config(); // Завантажуємо змінні середовища з .env
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Використовуємо ключ з .env

const app = express();
app.use(bodyParser.json());

// Додаємо CORS middleware для дозволу запитів з інших доменів
app.use(cors()); // Це дозволяє запити з будь-якого домену

// Підключення до бази даних
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "hotel_booking",
  password: "1981",
  port: 5432,
});

client.connect(); // Підключення до PostgreSQL

// Middleware для перевірки ролі
const verifyRole = (role) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Беремо токен з заголовка

    if (!token) {
      return res.status(401).send({ message: "Токен не надано" }); // Якщо токен відсутній
    }

    try {
      const decoded = jwt.verify(token, "secretkey"); // Перевіряємо токен
      if (decoded.role !== role) {
        return res.status(403).send({ message: "Доступ заборонено" }); // Якщо роль не співпадає
      }
      req.user = decoded; // Додаємо інформацію про користувача в запит
      next();
    } catch (err) {
      console.error(err);
      return res.status(401).send({ message: "Невірний токен" }); // Якщо токен некоректний
    }
  };
};

// Реєстрація користувача
app.post("/register", async (req, res) => {
  const { username, email, password, firstName, lastName, role = "client" } = req.body; // Роль за замовчуванням - 'client'

  try {
    // Перевірка, чи існує користувач з таким ім'ям або email
    const checkUser = await client.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (checkUser.rows.length > 0) {
      return res
        .status(400)
        .send("Користувач з таким ім'ям або email вже існує");
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Хешуємо пароль

    const result = await client.query(
      "INSERT INTO users (username, email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [username, email, hashedPassword, firstName, lastName, role] // Додаємо ім'я та прізвище
    );

    const newUser = result.rows[0];

    // Генерація JWT токена
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      "secretkey",
      { expiresIn: "1h" }
    );

    // Повертаємо токен разом з даними користувача
    res.status(201).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send("Помилка при реєстрації");
  }
});


// Авторизація користувача (логін)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await client.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(400).send({ message: "Невірний email або пароль" });
    }

    const user = result.rows[0];

    // Перевірка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send({ message: "Невірний email або пароль" });
    }

    // Генерація JWT токена
    const token = jwt.sign({ userId: user.id, role: user.role }, "secretkey", {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (err) {
    console.error("Помилка на сервері:", err);
    res.status(500).send({ message: "Помилка при авторизації" });
  }
});

// Отримання всіх кімнат (для користувачів)
app.get("/rooms", async (req, res) => {
  try {
    const result = await client.query(
      "SELECT id, name, description, capacity, price, available_from, available_to FROM rooms WHERE is_deleted = false"
    );
    res.json(result.rows); // Відправляємо список доступних кімнат
  } catch (err) {
    console.error("Помилка при отриманні кімнат:", err);
    res.status(500).send({ message: "Помилка при отриманні кімнат" });
  }
});

// Створення нового бронювання
app.post("/user/bookings", async (req, res) => {
  const { roomId, checkIn, checkOut } = req.body;
  const token = req.headers.authorization.split(" ")[1];

  if (!token) return res.status(401).send({ message: "Токен не надано" });

  try {
    const decoded = jwt.verify(token, "secretkey");
    const userId = decoded.userId; // Отримуємо ID користувача з токену

    const result = await client.query(
      "INSERT INTO bookings (user_id, room_id, check_in, check_out) VALUES ($1, $2, $3, $4) RETURNING *",
      [userId, roomId, checkIn, checkOut]
    );
    res.status(201).json(result.rows[0]); // Повертаємо дані бронювання
  } catch (err) {
    console.error("Помилка при створенні бронювання:", err);
    res.status(500).send({ message: "Помилка при бронюванні" });
  }
});

// Отримання бронювань користувача
app.get("/user/bookings", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).send({ message: "Токен не надано" });

  try {
    const decoded = jwt.verify(token, "secretkey");
    const userId = decoded.userId;

    const result = await client.query(
      "SELECT b.id, r.name as roomName, b.check_in, b.check_out FROM bookings b JOIN rooms r ON b.room_id = r.id WHERE b.user_id = $1",
      [userId]
    );
    res.json(result.rows); // Повертаємо список бронювань користувача
  } catch (err) {
    console.error("Помилка при отриманні бронювань:", err);
    res.status(500).send({ message: "Помилка при отриманні бронювань" });
  }
});

// Отримання конкретної кімнати (по id)
app.get("/rooms/:id", async (req, res) => {
  const { id } = req.params; // Отримуємо id з параметрів маршруту
  try {
    const result = await client.query(
      "SELECT * FROM rooms WHERE id = $1 AND is_deleted = false",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send({ message: "Номер не знайдено" });
    }
    res.json(result.rows[0]); // Повертаємо знайдений номер
  } catch (err) {
    console.error("Помилка при отриманні номеру:", err);
    res.status(500).send({ message: "Помилка при отриманні номеру" });
  }
});

// Скасування бронювання
app.delete("/user/bookings/:bookingId", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1]; // Беремо токен з заголовка
  const { bookingId } = req.params; // Беремо bookingId з параметрів

  if (!token) return res.status(401).send({ message: "Токен не надано" });

  try {
    const decoded = jwt.verify(token, "secretkey");
    const userId = decoded.userId;

    // Перевіряємо, чи належить це бронювання користувачу
    const result = await client.query(
      "SELECT * FROM bookings WHERE id = $1 AND user_id = $2",
      [bookingId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send({
        message: "Бронювання не знайдено або не належить цьому користувачу",
      });
    }

    // Видаляємо бронювання
    await client.query("DELETE FROM bookings WHERE id = $1", [bookingId]);

    res.status(200).send({ message: "Бронювання скасовано" });
  } catch (err) {
    console.error("Помилка при скасуванні бронювання:", err);
    res.status(500).send({ message: "Помилка при скасуванні бронювання" });
  }
});

// Додавання нового номера
app.post("/rooms", verifyRole("manager"), async (req, res) => {
  const { name, description, capacity, price, available_from, available_to } =
    req.body;

  try {
    const result = await client.query(
      "INSERT INTO rooms (name, description, capacity, price, available_from, available_to, is_deleted) VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING *",
      [name, description, capacity, price, available_from, available_to]
    );
    res.status(201).json(result.rows[0]); // Повертаємо дані нового номера
  } catch (err) {
    console.error(err);
    res.status(500).send("Помилка при додаванні номера");
  }
});

// Редагування номера
app.put("/rooms/:id", verifyRole("manager"), async (req, res) => {
  const { id } = req.params;
  const { name, description, capacity, price, available_from, available_to } =
    req.body;

  try {
    const result = await client.query(
      "UPDATE rooms SET name = $1, description = $2, capacity = $3, price = $4, available_from = $5, available_to = $6 WHERE id = $7 RETURNING *",
      [name, description, capacity, price, available_from, available_to, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ message: "Номер не знайдений" });
    }

    res.json(result.rows[0]); // Повертаємо оновлені дані номера
  } catch (err) {
    console.error(err);
    res.status(500).send("Помилка при редагуванні номера");
  }
});

// Видалення номера
app.delete("/rooms/:id", verifyRole("manager"), async (req, res) => {
  const { id } = req.params;

  try {
    const result = await client.query(
      "UPDATE rooms SET is_deleted = true WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ message: "Номер не знайдений" });
    }

    res.status(200).send({ message: "Номер видалено" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Помилка при видаленні номера");
  }
});

//Оплата
app.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body; // amount - це сума, яку користувач має заплатити

  const token = req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).send({ message: "Токен не надано" });

  try {
    const decoded = jwt.verify(token, "secretkey"); // Перевіряємо токен користувача
    const userId = decoded.userId;

    // Створюємо Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Сума в копійках (Stripe працює з копійками)
      currency: "uah", // Вибір валюти
    });

    // Повертаємо client_secret для використання на фронтенді
    res.send({
      clientSecret: paymentIntent.client_secret, // Це потрібно для підтвердження платежу на фронтенді
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Помилка при створенні Payment Intent" });
  }
});




// Отримання даних користувача (ім'я та прізвище)
app.get("/user", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send({ message: "Токен не надано" });
  }

  try {
    const decoded = jwt.verify(token, "secretkey");
    const userId = decoded.userId;

    const result = await client.query(
      "SELECT first_name, last_name FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ message: "Користувача не знайдено" });
    }

    const user = result.rows[0];
    console.log("User data:", user); // Додаємо лог для перевірки
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Помилка при отриманні даних користувача" });
  }
});

// Запуск сервера
app.listen(5000, () => {
  console.log("Сервер працює на порту 5000");
});
