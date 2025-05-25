import { createFileRoute } from "@tanstack/react-router";
import { Home } from "../../components/Home";
import { getEvents } from "../../server/events";

const loader = async ({ params }: { params: { date: string } }) => ({
  events: await getEvents({ data: params.date }),
});

const DateContainer = () => {
  const { date } = Route.useParams();
  const { events } = Route.useLoaderData();

  return <Home date={date} events={events} />;
};

export const Route = createFileRoute("/calendar/$date")({
  component: DateContainer,
  loader,
  beforeLoad: ({ params }) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(params.date)) {
      throw new Error(`Invalid date format: ${params.date}`);
    }
  },
});
