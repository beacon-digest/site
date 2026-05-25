import { Badge, Button, Group, Table, Title } from "@mantine/core";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { formatInTimeZone } from "date-fns-tz";
import {
  deleteEventAdmin,
  listEventsAdmin,
} from "../../server/events/admin";

const TIME_ZONE = "America/New_York";

export const Route = createFileRoute("/admin/")({
  loader: async () => listEventsAdmin(),
  component: AdminEvents,
});

const statusColor: Record<string, string> = {
  published: "green",
  pending: "yellow",
  rejected: "red",
};

function AdminEvents() {
  const { events, total } = Route.useLoaderData();
  const router = useRouter();

  const handleDelete = async (id: number, name: string | null) => {
    if (
      !window.confirm(
        `Delete "${name ?? "this event"}"? This cannot be undone.`,
      )
    ) {
      return;
    }
    await deleteEventAdmin({ data: id });
    await router.invalidate();
  };

  return (
    <div>
      <Group justify="space-between" mb="lg">
        <Title order={1} className="font-hepta-slab">
          Events ({total})
        </Title>
        <Button component={Link} to="/admin/events/new">
          New event
        </Button>
      </Group>

      {events.length === 0 ? (
        <p className="text-gray-600">No events yet.</p>
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Starts</Table.Th>
              <Table.Th>Location</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {events.map((event) => (
              <Table.Tr key={event.id}>
                <Table.Td>
                  {event.emoji ? `${event.emoji} ` : ""}
                  {event.name ?? "(untitled)"}
                </Table.Td>
                <Table.Td>
                  {event.start_at
                    ? formatInTimeZone(
                        new Date(event.start_at),
                        TIME_ZONE,
                        "MMM d, yyyy h:mm a",
                      )
                    : "—"}
                </Table.Td>
                <Table.Td>{event.location_name ?? "—"}</Table.Td>
                <Table.Td>
                  <Badge color={statusColor[event.status] ?? "gray"}>
                    {event.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs" justify="flex-end">
                    <Button
                      size="xs"
                      variant="light"
                      component={Link}
                      to="/admin/events/$id"
                      params={{ id: String(event.id) }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      color="red"
                      onClick={() => handleDelete(event.id, event.name)}
                    >
                      Delete
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </div>
  );
}
