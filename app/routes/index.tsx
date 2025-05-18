import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "../../convex/_generated/api";
import {
  Card,
  Title,
  Text,
  Group,
  Stack,
  Badge,
  Skeleton,
  Timeline,
  ThemeIcon,
} from "@mantine/core";

export const Route = createFileRoute("/")({
  component: Home,
});

// Helper function to format time
function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function Home() {
  // Use April 2025 date range to match our seed data
  // The getTimestamp function is similar to what's used in the seed.ts file
  const getTimestamp = (
    year: number,
    month: number,
    day: number,
    hour = 0,
    minute = 0
  ): number => {
    return new Date(year, month - 1, day, hour, minute).getTime();
  };

  // April 17-30, 2025 to match seed data
  const startDate = getTimestamp(2025, 4, 17);
  const endDate = getTimestamp(2025, 4, 30);

  const { data, isLoading } = useSuspenseQuery(
    convexQuery(api.events.getEventsByDateRange, {
      startDate,
      endDate,
    })
  );

  // For demo purposes, let's set a reference time in April 2025 to show some events as "past"
  // In a real app, you would use the current time: const now = Date.now();
  const referenceTime = getTimestamp(2025, 4, 18, 12, 0); // April 18, 2025 at noon

  return (
    <div className="p-4">
      {/* Tailwind CSS Test */}
      <div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg mb-4">
        This element should have a blue background if Tailwind CSS is working
      </div>

      <Title order={2} mb="md">
        Upcoming Events
      </Title>

      {isLoading ? (
        <Skeleton height={400} />
      ) : data && data.length > 0 ? (
        <Stack>
          {data.map((dateGroup) => {
            // Find the index of the first future event in this date group
            const activeIndex = dateGroup.events.findIndex(
              (event) => event.startDate > referenceTime
            );

            // If all events are in the past, set all as active
            // If all events are in the future, set none as active
            // Otherwise, set the active index to the first future event - 1
            const active =
              activeIndex === -1
                ? dateGroup.events.length - 1 // all events are in the past
                : activeIndex === 0
                  ? -1 // all events are in the future
                  : activeIndex - 1; // some past, some future

            return (
              <Card key={dateGroup.date} shadow="sm" p="lg" mb="md">
                <Title
                  order={4}
                  style={{
                    marginBottom: "1rem",
                  }}
                >
                  {dateGroup.displayDate}
                  <span className="text-sm text-red-500">
                    {dateGroup.events.length} events
                  </span>
                </Title>

                <Timeline
                  active={active}
                  bulletSize={24}
                  lineWidth={2}
                  color="blue"
                >
                  {dateGroup.events.map((event) => {
                    const isPast = event.startDate <= referenceTime;

                    return (
                      <Timeline.Item
                        key={event._id}
                        title={
                          <Group justify="space-between" wrap="nowrap">
                            <Text fw={500} size="lg">
                              {event.name}
                            </Text>
                            <Badge color={isPast ? "blue" : "gray"}>
                              {formatTime(event.startDate)}
                              {event.endDate &&
                                ` - ${formatTime(event.endDate)}`}
                            </Badge>
                          </Group>
                        }
                        bullet={
                          <ThemeIcon
                            size={22}
                            radius="xl"
                            color={isPast ? "blue" : "gray.3"}
                          >
                            <div style={{ width: 10, height: 10 }} />
                          </ThemeIcon>
                        }
                      >
                        {event.description && (
                          <Text size="sm" lineClamp={2} mb="xs">
                            {event.description}
                          </Text>
                        )}

                        <Group gap="xs">
                          {event.location && (
                            <Text size="sm" c="dimmed">
                              @ {event.location.name}
                            </Text>
                          )}

                          {event.url && (
                            <Text
                              component="a"
                              href={event.url}
                              target="_blank"
                              size="sm"
                              c="blue"
                            >
                              Link
                            </Text>
                          )}
                        </Group>
                      </Timeline.Item>
                    );
                  })}
                </Timeline>
              </Card>
            );
          })}
        </Stack>
      ) : (
        <Card shadow="sm" p="lg">
          <Text>No events found in the selected date range</Text>
        </Card>
      )}
    </div>
  );
}
