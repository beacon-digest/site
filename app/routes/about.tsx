import { createFileRoute } from "@tanstack/react-router";
import { Container, Title, Text, Stack } from "@mantine/core";
import { titleMeta } from "../utils/meta";

export const Route = createFileRoute("/about")({
  component: AboutComponent,
  head: () => ({
    meta: titleMeta("About"),
  }),
});

function AboutComponent() {
  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Title order={1} size="h2" fw={800} className="font-hepta-slab">
          About Beacon Digest
        </Title>

        <Text size="lg" lh={1.6}>
          Beacon Digest is a non-profit community calendar. Our mission is to
          help residents of Beacon connect with each other and to help local
          businesses thrive. We believe that we're a stronger community
          together.
        </Text>

        <Text size="lg" lh={1.6}>
          The information on this site is maintained by volunteers. We do our
          best to keep it accurate, but we can't guarantee that it's always
          up-to-date. Follow the provided source links for the most up-to-date
          information.
        </Text>

        <Text size="lg" lh={1.6}>
          If you wish to submit an event, please{" "}
          <a
            href="https://calendar.beacondigest.com/submit-event"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700"
          >
            use this form
          </a>
          .
        </Text>
      </Stack>
    </Container>
  );
}
