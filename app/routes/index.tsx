import { createFileRoute } from "@tanstack/react-router";
import { Home } from "../components/Home";
import { format } from "date-fns";
import { getEvents } from "../server/events";

const loader = async () => ({
  events: await getEvents({ data: format(new Date(), "yyyy-MM-dd") }),
});

const IndexContainer = () => {
  const { events } = Route.useLoaderData();

  return <Home date={format(new Date(), "yyyy-MM-dd")} events={events} />;
};

export const Route = createFileRoute("/")({
  component: IndexContainer,
  loader,
});
