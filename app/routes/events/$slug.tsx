import { createFileRoute } from "@tanstack/react-router";
import { getEvent } from "../../server/events/show";
import { EventShow } from "../../containers/events/Show";

const loader = async ({ params }: { params: { slug: string } }) => {
  // Extract ID from the combined slug parameter (format: "152-beacon-flea-market")
  const idMatch = params.slug.match(/^(\d+)-/);

  if (!idMatch) {
    throw new Error(
      "Invalid event URL format. Expected format: /events/id-slug",
    );
  }

  const eventId = parseInt(idMatch[1], 10);

  return {
    event: await getEvent({ data: eventId }),
  };
};

const EventContainer = () => {
  const { event } = Route.useLoaderData();

  return <EventShow event={event} />;
};

export const Route = createFileRoute("/events/$slug")({
  component: EventContainer,
  loader,
});
