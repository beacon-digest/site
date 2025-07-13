import { Container } from "@mantine/core";
import { CalendarEvent } from "../../../../db/types/calendar-event";
import { EventHeader } from "./EventHeader";
import { GoogleMap } from "../../../components/GoogleMap";

interface EventShowProps {
  event: CalendarEvent;
}
export const EventShow: React.FC<EventShowProps> = ({ event }) => {
  return (
    <Container mt={20}>
      <EventHeader event={event} />

      {event.description && (
        <>
          <div
            className="event-description my-10"
            dangerouslySetInnerHTML={{ __html: event.description }}
          />
        </>
      )}

      {event.location && (
        <GoogleMap
          address={event.location.address}
          locationName={event.location.name}
          height="400px"
        />
      )}
    </Container>
  );
};
