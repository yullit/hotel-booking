import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { App } from "./App"; // Залишай так, якщо App знаходиться в тій самій папці
import HomePage from "./modules/HomePage/HomePage";
import RoomsPage from "./modules/RoomsPage/RoomsPage";
import ContactsPage from "./modules/ContactsPage/ContactsPage";
import AuthPage from "./modules/AuthPage/AuthPage";
import Dashboard from "./modules/Dashboard/Dashboard";
import NotFoundPage from "./modules/NotFoundPage/NotFoundPage";
import ManageRoomsPage from "./modules/ManageRoomsPage/ManageRoomsPage";

export const Root = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} >
          <Route index element={<HomePage />} />
          <Route path="home" element={<Navigate to="/" replace />} />
          <Route path="rooms" element={<RoomsPage />} />
          <Route path="manage-rooms" element={<ManageRoomsPage />} /> 
          <Route path="manage-rooms/:roomId" element={<ManageRoomsPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="login" element={<AuthPage />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
};
