import { formatInTimeZone } from "date-fns-tz";
import type { CalendarEvent } from "../../db/types/calendar-event";

const TIME_ZONE = "America/New_York";

export function groupEventsByDate(events: CalendarEvent[]) {
  const groups: { date: string; events: CalendarEvent[] }[] = [];
  let currentDate = "";

  for (const event of events) {
    const dateKey = event.start_at
      ? formatInTimeZone(event.start_at, TIME_ZONE, "yyyy-MM-dd")
      : "unknown";
    const dateLabel = event.start_at
      ? formatInTimeZone(event.start_at, TIME_ZONE, "EEEE, MMMM d")
      : "Date TBD";

    if (dateKey !== currentDate) {
      currentDate = dateKey;
      groups.push({ date: dateLabel, events: [event] });
    } else {
      groups[groups.length - 1].events.push(event);
    }
  }

  return groups;
}
