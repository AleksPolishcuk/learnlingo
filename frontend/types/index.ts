export interface Review {
  reviewer_name: string;
  reviewer_rating: number;
  comment: string;
}

export interface Teacher {
  _id: string;
  name: string;
  surname: string;
  languages: string[];
  levels: string[];
  rating: number;
  reviews: Review[];
  price_per_hour: number;
  lessons_done: number;
  avatar_url: string;
  lesson_info: string;
  conditions: string[];
  experience: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "client" | "business";
  languages: string[];
  lesson_info?: string;
  conditions?: string;
  description?: string;
  favorites: string[];
  createdAt: string;
}

export interface Booking {
  _id: string;
  user: string;
  teacher: Teacher;
  reason: string;
  fullName: string;
  email: string;
  phone: string;
  status: "active" | "cancelled";
  scheduledAt?: string;
  createdAt: string;
}

export interface TeacherFilters {
  language: string;
  level: string;
  price: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}
