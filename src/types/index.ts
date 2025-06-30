export interface Habit {
  id: string;
  name: string;
  streak: number;
  history: string[]; // Stores dates in 'YYYY-MM-DD' format
  completion: number; // Percentage
  completedToday: boolean;
}
