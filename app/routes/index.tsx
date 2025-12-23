import { createFileRoute } from "@tanstack/react-router";
import { Home } from "../components/Home";
import { formatInTimeZone } from "date-fns-tz";
import { getEvents } from "../server/events";

const loader = async () => ({
  events: await getEvents({
    data: formatInTimeZone(new Date(), "America/New_York", "yyyy-MM-dd"),
  }),
});

const IndexContainer = () => {
  const { events } = Route.useLoaderData();

  return (
    <Home
      date={formatInTimeZone(new Date(), "America/New_York", "yyyy-MM-dd")}
      events={events}
    />
  );
};

export const Route = createFileRoute("/")({
  component: IndexContainer,
  loader,
});
