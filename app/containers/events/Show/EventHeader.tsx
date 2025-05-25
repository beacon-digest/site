import { Anchor, Breadcrumbs, Group, Stack } from "@mantine/core";
import { CalendarEvent } from "../../../../db/types/calendar-event";
import { EmojiBox } from "../../../components/EmojiBox";
import { formatEventTime } from "../../../utils/events";
import { Link } from "@tanstack/react-router";
import { toISODateString } from "../../../utils/date";
import { format } from "date-fns";

interface EventHeaderProps {
  event: CalendarEvent;
}

export const EventHeader: React.FC<EventHeaderProps> = ({ event }) => {
  return (
    <Stack>
      <Breadcrumbs>
        <Link to="/">
          <Anchor>Home</Anchor>
        </Link>
        <Link
          to="/calendar/$date"
          params={{ date: toISODateString(event.start_at ?? new Date()) }}
        >
          <Anchor>
            {format(event.start_at ?? new Date(), "MMMM d, yyyy")}
          </Anchor>
        </Link>
        <span>{event.name}</span>
      </Breadcrumbs>

      <Group>
        <EmojiBox emoji={event.emoji ?? ""} />

        <Stack gap={4}>
          <span className="text-gray-700 text-md">
            {formatEventTime(event.start_at, event.end_at)}
          </span>

          <h2 className="text-[34px] font-extrabold line-clamp-2 leading-12">
            {event.name ?? "Untitled Event"}
          </h2>
        </Stack>
      </Group>
    </Stack>
  );
};
