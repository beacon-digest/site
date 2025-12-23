import { createFileRoute } from "@tanstack/react-router";
import { Home } from "../../components/Home";
import { formatInTimeZone } from "date-fns-tz";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { getEvents, getDateRangeEvents } from "../../server/events";

const loader = async () => {
  const today = formatInTimeZone(new Date(), "America/New_York", "yyyy-MM-dd");
  const currentDate = new Date();

  // Calculate the calendar grid range (including adjacent month dates)
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 }); // Sunday

  const startDate = formatInTimeZone(
    calendarStart,
    "America/New_York",
    "yyyy-MM-dd"
  );
  const endDate = formatInTimeZone(
    calendarEnd,
    "America/New_York",
    "yyyy-MM-dd"
  );

  // Fetch events for the full calendar range
  const [events, calendarEvents] = await Promise.all([
    getEvents({ data: today }),
    getDateRangeEvents({ data: { startDate, endDate } }),
  ]);

  return {
    events,
    monthEvents: calendarEvents,
  };
};

const CalendarContainer = () => {
  const { events, monthEvents } = Route.useLoaderData();
  const today = formatInTimeZone(new Date(), "America/New_York", "yyyy-MM-dd");

  return <Home date={today} events={events} monthEvents={monthEvents} />;
};

export const Route = createFileRoute("/calendar/")({
  component: CalendarContainer,
  loader,
});
