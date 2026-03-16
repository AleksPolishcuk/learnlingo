"use client";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { CalEvent } from "@/utils/calendar.Utils";
import styles from "../page.module.css";

import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: { "en-US": enUS },
});

const TYPE_CLASS: Record<string, string> = {
  booking_pending: styles.evPending,
  booking_confirmed: styles.evConfirmed,
  booking_completed: styles.evCompleted,
};

const TYPE_ICON: Record<string, string> = {
  booking_pending: "🟡",
  booking_confirmed: "✅",
  booking_completed: "🎓",
};

interface Props {
  events: CalEvent[];
  view: "week" | "month" | "day";
  onView: (v: "week" | "month" | "day") => void;
  date: Date;
  onNavigate: (d: Date) => void;
  onEventClick: (e: CalEvent) => void;
}

export default function CalendarWidget({
  events,
  view,
  onView,
  date,
  onNavigate,
  onEventClick,
}: Props) {
  return (
    <Calendar
      localizer={localizer}
      events={events}
      view={view}
      views={[Views.MONTH, Views.WEEK, Views.DAY]}
      onView={onView as any}
      date={date}
      onNavigate={onNavigate}
      defaultView={Views.WEEK}
      step={30}
      timeslots={2}
      min={new Date(0, 0, 0, 7, 0)}
      max={new Date(0, 0, 0, 22, 0)}
      onSelectEvent={(ev) => onEventClick(ev as CalEvent)}
      eventPropGetter={(ev) => ({
        className: TYPE_CLASS[(ev as CalEvent).type] ?? "",
      })}
      dayPropGetter={(d) =>
        new Date().toDateString() === d.toDateString() ? { className: "" } : {}
      }
      components={{
        event: ({ event }: { event: CalEvent }) => (
          <div className={styles.eventCell} title={event.title}>
            <span className={styles.eventIcon}>
              {TYPE_ICON[event.type] ?? "📅"}
            </span>
            <span className={styles.eventTitle}>{event.title}</span>
          </div>
        ),
      }}
      popup
      style={{ height: "100%" }}
    />
  );
}
