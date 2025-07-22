import { Container } from "@mantine/core";
import { CalendarEvent } from "../../../../db/types/calendar-event";
import { EventHeader } from "./EventHeader";
import { EventLocation } from "./EventLocation";

interface EventShowProps {
  event: CalendarEvent;
}
export const EventShow: React.FC<EventShowProps> = ({ event }) => {
  return (
    <Container
      mt={10}
      px="xs"
      size="md"
      mx="auto"
      className="md:mt-20 md:px-md w-full"
    >
      <EventHeader event={event} />

      {event.description && (
        <>
          <div
            className="event-description my-5 md:my-10 text-sm md:text-base prose max-w-none"
            dangerouslySetInnerHTML={{ __html: event.description }}
          />
        </>
      )}

      {event.location && <EventLocation location={event.location} />}
    </Container>
  );
};
