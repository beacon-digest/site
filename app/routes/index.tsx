import { createFileRoute } from "@tanstack/react-router";
import { Home } from "../components/Home";
import { formatInTimeZone } from "date-fns-tz";
import { getEvents } from "../server/events";

const loader = async () => {
  const today = formatInTimeZone(new Date(), "America/New_York", "yyyy-MM-dd");

  // Index route only shows list view, so only fetch today's events
  const events = await getEvents({ data: today });

  return {
    events,
  };
};

const IndexContainer = () => {
  const { events } = Route.useLoaderData();
  const today = formatInTimeZone(new Date(), "America/New_York", "yyyy-MM-dd");

  return <Home date={today} events={events} monthEvents={[]} />;
};

export const Route = createFileRoute("/")({
  component: IndexContainer,
  loader,
});
