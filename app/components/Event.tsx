import { EmojiBox } from "./EmojiBox";
import { IconArrowRight } from "@tabler/icons-react";
import { CalendarEvent } from "../../db/types/calendar-event";
import { Link } from "@tanstack/react-router";

interface EventProps {
  event: CalendarEvent;
}

export const Event: React.FC<EventProps> = ({ event }) => {
  const formatTime = (startAt: Date | null, endAt: Date | null) => {
    if (!startAt) return "Time TBD";

    const formatOptions: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };

    const startTime = startAt.toLocaleTimeString("en-US", formatOptions);
    const endTime = endAt?.toLocaleTimeString("en-US", formatOptions);

    return endTime ? `${startTime} - ${endTime}` : startTime;
  };
  return (
    <Link to="/events/$slug" params={{ slug: event.slug! }}>
      <div className="border-t border-gray-300 py-10">
        <div className="grid grid-cols-[auto_1fr_300px_auto] items-center gap-10">
          <EmojiBox emoji={event.emoji ?? ""} />

          <div className="flex flex-col gap-0">
            <span className="text-gray-700 text-md">
              {formatTime(event.start_at, event.end_at)}
            </span>

            <h2 className="text-[34px] font-extrabold line-clamp-2 leading-12">
              {event.name ?? "Untitled Event"}
            </h2>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="text-gray-800 text-xl">Cool place</div>
            <div className="text-gray-500 text-xl">123 Rad Street</div>
          </div>

          <a
            href="#"
            className="text-red-600 text-xl flex items-center gap-1 whitespace-nowrap"
          >
            Learn more
            <IconArrowRight className="text-black" />
          </a>
        </div>
      </div>
    </Link>
  );
};
