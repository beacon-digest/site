import { createFileRoute } from "@tanstack/react-router";
import { Home } from "../../../components/Home";
import { formatInTimeZone } from "date-fns-tz";
import { format, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { getEvents, getDateRangeEvents } from "../../../server/events";
import { titleMeta } from "../../../utils/meta";

const loader = async ({ params }: { params: { year: string; month: string } }) => {
  const year = Number.parseInt(params.year, 10);
  const month = Number.parseInt(params.month, 10);

  // Validate year and month
  if (isNaN(year) || year < 2000 || year > 2100) {
    throw new Error(`Invalid year: ${params.year}`);
  }
  if (isNaN(month) || month < 1 || month > 12) {
    throw new Error(`Invalid month: ${params.month}`);
  }

  // Get the first day of the month for the date
  const firstDayOfMonth = formatInTimeZone(
    new Date(year, month - 1, 1),
    "America/New_York",
    "yyyy-MM-dd"
  );

  // Calculate the calendar grid range (including adjacent month dates)
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 }); // Sunday
  
  const startDate = formatInTimeZone(calendarStart, "America/New_York", "yyyy-MM-dd");
  const endDate = formatInTimeZone(calendarEnd, "America/New_York", "yyyy-MM-dd");

  // Fetch events for the full calendar range
  const [events, calendarEvents] = await Promise.all([
    getEvents({ data: firstDayOfMonth }),
    getDateRangeEvents({ data: { startDate, endDate } }),
  ]);

  return {
    events,
    monthEvents: calendarEvents,
    year,
    month,
  };
};

const MonthContainer = () => {
  const { year, month } = Route.useParams();
  const { events, monthEvents } = Route.useLoaderData();
  
  // Use today's date (not the first day of the viewed month)
  // This ensures only today's date is highlighted, not the first day of the viewed month
  const date = formatInTimeZone(new Date(), "America/New_York", "yyyy-MM-dd");

  return <Home date={date} events={events} monthEvents={monthEvents} />;
};

export const Route = createFileRoute("/calendar/$year/$month")({
  component: MonthContainer,
  loader,
  head: ({ params }) => {
    const year = Number.parseInt(params.year, 10);
    const month = Number.parseInt(params.month, 10);
    const page =
      !isNaN(year) && !isNaN(month) && month >= 1 && month <= 12
        ? format(new Date(year, month - 1, 1), "MMMM yyyy")
        : undefined;

    return { meta: titleMeta(page) };
  },
  beforeLoad: ({ params }) => {
    const year = Number.parseInt(params.year, 10);
    const month = Number.parseInt(params.month, 10);

    if (isNaN(year) || year < 2000 || year > 2100) {
      throw new Error(`Invalid year: ${params.year}`);
    }
    if (isNaN(month) || month < 1 || month > 12) {
      throw new Error(`Invalid month: ${params.month}`);
    }
  },
});

