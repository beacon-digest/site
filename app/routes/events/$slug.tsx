import { createFileRoute } from "@tanstack/react-router";
import { getEvent } from "../../server/events/show";

const loader = async ({ params }: { params: { slug: string } }) => ({
  event: await getEvent({ data: params.slug }),
});

const EventContainer = () => {
  const { event } = Route.useLoaderData();

  return (
    <div>
      <h1>{event.name}</h1>
      <p>{event.description}</p>
    </div>
  );
};

export const Route = createFileRoute("/events/$slug")({
  component: EventContainer,
  loader,
});
