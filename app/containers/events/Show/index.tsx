import { Container } from "@mantine/core";
import { CalendarEvent } from "../../../../db/types/calendar-event";
import { EventHeader } from "./EventHeader";

interface EventShowProps {
  event: CalendarEvent;
}
export const EventShow: React.FC<EventShowProps> = ({ event }) => {
  return (
    <Container mt={20}>
      <EventHeader event={event} />
    </Container>
  );
};
