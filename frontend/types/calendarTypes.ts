export interface WeeklySlot {
  _id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface SpecialSlot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface BlockedRange {
  _id: string;
  startDate: string;
  endDate: string;
  label: string;
}

export interface Availability {
  _id: string;
  teacher: string;
  weeklySlots: WeeklySlot[];
  specialSlots: SpecialSlot[];
  blockedRanges: BlockedRange[];
  lessonDuration: number;
  timezone: string;
}

export type CalEventType =
  | "booking_pending"
  | "booking_confirmed"
  | "booking_completed"
  | "booking_cancelled"
  | "available"
  | "blocked";

export interface CalEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: CalEventType;
  bookingId?: string;
  meta?: Record<string, any>;
}
