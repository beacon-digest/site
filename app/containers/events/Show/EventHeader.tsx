import { Group, Stack } from "@mantine/core";
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
      <nav className="flex items-center gap-1.5 text-xs md:text-sm text-gray-400 mb-4 md:mb-6">
        <Link
          to="/"
          className="hover:text-gray-600 transition-colors duration-150"
        >
          Home
        </Link>
        <span className="text-gray-300">/</span>
        <Link
          to="/calendar/$date"
          params={{ date: toISODateString(event.start_at ?? new Date()) }}
          className="hover:text-gray-600 transition-colors duration-150"
        >
          {format(event.start_at ?? new Date(), "MMMM d, yyyy")}
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-500 truncate max-w-[150px] md:max-w-none">
          {event.name}
        </span>
      </nav>

      <Group wrap="nowrap" align="center" className="w-full">
        <EmojiBox emoji={event.emoji ?? ""} />

        <Stack gap={4} style={{ flex: 1, minWidth: 0, maxWidth: "100%" }}>
          <span className="text-gray-700 text-sm md:text-md">
            {formatEventTime(event.start_at, event.end_at)}
          </span>

          <h2 className="text-xl md:text-[34px] font-extrabold line-clamp-2 leading-tight md:leading-11 overflow-hidden text-ellipsis">
            {event.name ?? "Untitled Event"}
          </h2>

          {event.url && (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-700 hover:text-rose-800 border border-rose-200 px-3 py-1 rounded-full hover:bg-rose-50 transition-all duration-200 mt-2 self-start"
            >
              Website
              <IconExternalLink size={12} />
            </a>
          )}
        </Stack>
      </Group>
    </Stack>
  );
};
