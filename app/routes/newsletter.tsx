import { createFileRoute } from "@tanstack/react-router";
import { Container, Title, Text, Stack } from "@mantine/core";
import { EmailSignup } from "../components/EmailSignup";

export const Route = createFileRoute("/newsletter")({
  component: NewsletterComponent,
});

function NewsletterComponent() {
  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Title order={1} size="h2" fw={800} className="font-hepta-slab">
          Weekly Newsletter
        </Title>

        <Text size="lg" lh={1.6}>
          Get a weekly email with upcoming events in Beacon, NY. We send one
          email per week with the best events for the week ahead — no spam,
          unsubscribe anytime.
        </Text>

        <EmailSignup />
      </Stack>
    </Container>
  );
}
