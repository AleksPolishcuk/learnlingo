import { Booking } from "@/types";

export type CalEventType =
  | "booking_pending"
  | "booking_confirmed"
  | "booking_completed"
  | "booking_cancelled";

export interface CalEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: CalEventType;
  bookingId: string;
  meta: {
    reason: string;
    phone: string;
    email: string;
    status: string;
    ad: string | null;
    student: string;
  };
}

const STATUS_TYPE: Record<string, CalEventType> = {
  pending: "booking_pending",
  confirmed: "booking_confirmed",
  completed: "booking_completed",
  cancelled: "booking_cancelled",
};

export function bookingsToEvents(
  bookings: Booking[],
  lessonDuration = 60,
): CalEvent[] {
  return bookings
    .filter((b) => !!b.scheduledAt)
    .map((b) => {
      const start = new Date(b.scheduledAt!);
      const end = new Date(start.getTime() + lessonDuration * 60_000);
      const student =
        typeof b.user === "object"
          ? `${b.user.name} ${b.user.surname}`.trim()
          : b.fullName;

      return {
        id: `booking-${b._id}`,
        title: student,
        start,
        end,
        type: STATUS_TYPE[b.teacherStatus] ?? "booking_pending",
        bookingId: b._id,
        meta: {
          reason: b.reason,
          phone: b.phone,
          email: b.email,
          status: b.teacherStatus,
          student,
          ad:
            typeof b.teacherAd === "object" && b.teacherAd
              ? `${b.teacherAd.name} ${b.teacherAd.surname}`
              : null,
        },
      };
    });
}

export function buildICS(bookings: Booking[], lessonDuration = 60): string {
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const now = fmt(new Date());

  const vevents = bookings
    .filter((b) => b.scheduledAt && b.teacherStatus !== "cancelled")
    .map((b) => {
      const start = new Date(b.scheduledAt!);
      const end = new Date(start.getTime() + lessonDuration * 60_000);
      const student =
        typeof b.user === "object"
          ? `${b.user.name} ${b.user.surname}`.trim()
          : b.fullName;
      return [
        "BEGIN:VEVENT",
        `UID:${b._id}@learnlingo`,
        `DTSTAMP:${now}`,
        `DTSTART:${fmt(start)}`,
        `DTEND:${fmt(end)}`,
        `SUMMARY:Lesson – ${student}`,
        `DESCRIPTION:Reason: ${b.reason}\\nStatus: ${b.teacherStatus}\\nEmail: ${b.email}`,
        "END:VEVENT",
      ].join("\r\n");
    });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LearnLingo//Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...vevents,
    "END:VCALENDAR",
  ].join("\r\n");
}
