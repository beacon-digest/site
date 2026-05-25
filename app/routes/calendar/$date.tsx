import { createFileRoute } from "@tanstack/react-router";
import { Home } from "../../components/Home";
import { getEvents, getMonthEvents } from "../../server/events";
import { formatInTimeZone } from "date-fns-tz";
import { format, parseISO } from "date-fns";
import { titleMeta } from "../../utils/meta";

const loader = async ({ params }: { params: { date: string } }) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(params.date)) {
    throw new Error(`Invalid date format: ${params.date}`);
  }

  const dateObj = parseISO(params.date);
  const month = formatInTimeZone(dateObj, "America/New_York", "yyyy-MM");

  // Always fetch both - we'll filter in the component based on view mode
  const [events, monthEvents] = await Promise.all([
    getEvents({ data: params.date }),
    getMonthEvents({ data: month }),
  ]);

  return {
    events,
    monthEvents,
  };
};

const DateContainer = () => {
  const { date } = Route.useParams();
  const { events, monthEvents } = Route.useLoaderData();

  return <Home date={date} events={events} monthEvents={monthEvents} />;
};

export const Route = createFileRoute("/calendar/$date")({
  component: DateContainer,
  loader,
  head: ({ params }) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const page = dateRegex.test(params.date)
      ? `Events on ${format(parseISO(params.date), "EEEE, MMMM d, yyyy")}`
      : undefined;

    return { meta: titleMeta(page) };
  },
  beforeLoad: ({ params }) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(params.date)) {
      throw new Error(`Invalid date format: ${params.date}`);
    }
  },
});
