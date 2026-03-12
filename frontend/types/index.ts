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

export interface TeacherAd {
  _id: string;
  owner: { _id: string; name: string; email: string } | string;
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _isAd?: boolean;
}

export type AnyTeacher = Teacher | TeacherAd;

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

export type TeacherStatus = "pending" | "confirmed" | "cancelled";

export interface Booking {
  _id: string;
  user: string | User;
  teacher?: Teacher | null;
  teacherAd?: TeacherAd | null;
  reason: string;
  fullName: string;
  email: string;
  phone: string;
  status?: "active" | "cancelled";
  teacherStatus: TeacherStatus;
  cancelledBy?: "student" | "teacher" | null;
  teacherMessage?: string;
  scheduledAt?: string;
  createdAt: string;
}

export interface TeacherFilters {
  language: string;
  level: string;
  price: string;
  sortBy: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}
