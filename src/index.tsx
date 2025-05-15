import React from 'react';
import ReactDOM from 'react-dom/client';
import { Root } from './Root';  // Тепер ми використовуємо компонент Root
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Root />  {/* Обгортаємо Root, щоб забезпечити роутінг */}
  </React.StrictMode>
);

// Якщо хочеш почати вимірювати ефективність у додатку, передай функцію
// для запису результатів (наприклад: reportWebVitals(console.log))
// або надішли на аналітичний сервер. Детальніше: https://bit.ly/CRA-vitals
reportWebVitals();
