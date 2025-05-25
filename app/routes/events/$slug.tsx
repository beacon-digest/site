import { createFileRoute } from "@tanstack/react-router";
import { getEvent } from "../../server/events/show";
import { EventShow } from "../../containers/events/Show";

const loader = async ({ params }: { params: { slug: string } }) => ({
  event: await getEvent({ data: params.slug }),
});

const EventContainer = () => {
  const { event } = Route.useLoaderData();

  return <EventShow event={event} />;
};

export const Route = createFileRoute("/events/$slug")({
  component: EventContainer,
  loader,
});
