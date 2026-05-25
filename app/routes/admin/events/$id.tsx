import { Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { EventForm } from "../../../components/admin/EventForm";
import {
  getEventByIdAdmin,
  listLocationsAdmin,
} from "../../../server/events/admin";

export const Route = createFileRoute("/admin/events/$id")({
  loader: async ({ params }) => {
    const id = Number(params.id);
    const [event, locations] = await Promise.all([
      getEventByIdAdmin({ data: id }),
      listLocationsAdmin(),
    ]);
    return { event, locations };
  },
  component: EditEvent,
});

function EditEvent() {
  const { event, locations } = Route.useLoaderData();
  return (
    <div>
      <Title order={1} mb="lg" className="font-hepta-slab">
        Edit event
      </Title>
      <EventForm mode="edit" initial={event} locations={locations} />
    </div>
  );
}
