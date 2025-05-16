// Створення типу для номерів
export interface Room {
  id: number;
  name: string;
  price: number;
  description: string;
  capacity: number;
  available_from: string;
  available_to: string;
  is_deleted?: boolean;
}
