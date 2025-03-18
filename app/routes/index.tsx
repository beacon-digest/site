import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "../../convex/_generated/api";
import { Pill, Card, Title, Text, Group } from "@mantine/core";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { data } = useSuspenseQuery(convexQuery(api.events.get, { limit: 10 }));

  return (
    <div className="p-4">
      <Title order={2} mb="md">
        Upcoming Events
      </Title>
      <Card shadow="sm" p="lg">
        {data && data.length > 0 ? (
          <div className="space-y-4">
            {data.map((event) => (
              <div key={event._id} className="border-b pb-4">
                <Group justify="space-between" mb="xs">
                  <Text fw={500}>{event.name}</Text>
                  {event.createdAt && (
                    <Text size="sm" c="dimmed">
                      {new Date(event.createdAt).toLocaleDateString()}
                    </Text>
                  )}
                </Group>
                <Pill>Calendar</Pill>
              </div>
            ))}
          </div>
        ) : (
          <Text>No events found</Text>
        )}
      </Card>
    </div>
  );
}
