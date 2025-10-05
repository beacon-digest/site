import { Anchor, Breadcrumbs, Group, Stack, Button } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
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
    <Stack className="w-full">
      <Breadcrumbs className="text-xs md:text-base">
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

        <span className="truncate max-w-[150px] md:max-w-none">
          {event.name}
        </span>
      </Breadcrumbs>

      <Group wrap="nowrap" align="center" className="w-full">
        <EmojiBox emoji={event.emoji ?? ""} />

        <Stack gap={4} style={{ flex: 1, minWidth: 0, maxWidth: "100%" }}>
          <span className="text-gray-700 text-sm md:text-md">
            {formatEventTime(event.start_at, event.end_at)}
          </span>

          <h2 className="text-xl md:text-[34px] font-extrabold line-clamp-2 leading-tight md:leading-9 overflow-hidden text-ellipsis">
            {event.name ?? "Untitled Event"}
          </h2>

          {event.url && (
            <Button
              component="a"
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              variant="light"
              size="xs"
              rightSection={<IconExternalLink size={12} />}
              className="self-start mt-2"
            >
              Website
            </Button>
          )}
        </Stack>
      </Group>
    </Stack>
  );
};
