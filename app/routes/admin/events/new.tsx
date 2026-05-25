import { Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { EventForm } from "../../../components/admin/EventForm";
import { listLocationsAdmin } from "../../../server/events/admin";

export const Route = createFileRoute("/admin/events/new")({
  loader: async () => ({ locations: await listLocationsAdmin() }),
  component: NewEvent,
});

function NewEvent() {
  const { locations } = Route.useLoaderData();
  return (
    <div>
      <Title order={1} mb="lg" className="font-hepta-slab">
        New event
      </Title>
      <EventForm mode="create" locations={locations} />
    </div>
  );
}
