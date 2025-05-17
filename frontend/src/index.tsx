import React from "react";
import ReactDOM from "react-dom/client";
import { Elements } from "@stripe/react-stripe-js";  // Імпортуємо Elements
import { loadStripe } from "@stripe/stripe-js";  // Імпортуємо функцію для завантаження Stripe
import { Root } from './Root';  // Правильний шлях до Root
import reportWebVitals from './reportWebVitals';  // Правильний шлях до reportWebVitals

// Завантажуємо публічний ключ Stripe
const stripePromise = loadStripe('pk_test_51RPYrSEPREzaboeVjfhyPpIlM9UMasYWFsAJ9My8NAAFwSQbXQ8OBUkrHioWU0skZ5KaIByuY6cvaRRp4N1ij5p800ZQLUQG7U');  // Заміни на свій публічний ключ

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Elements stripe={stripePromise}>  {/* Обгортаємо Root в Elements для Stripe */}
      <Root />  {/* Обгортаємо Root, щоб забезпечити роутінг */}
    </Elements>
  </React.StrictMode>
);

// Якщо хочеш почати вимірювати ефективність у додатку, передай функцію
// для запису результатів (наприклад: reportWebVitals(console.log))
// або надішли на аналітичний сервер. Детальніше: https://bit.ly/CRA-vitals
reportWebVitals();
