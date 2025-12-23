import { EmojiBox } from "./EmojiBox";
import { IconArrowRight } from "@tabler/icons-react";
import type { CalendarEvent } from "../../db/types/calendar-event";
import { Link } from "@tanstack/react-router";
import { formatEventTime } from "../utils/events";

interface EventProps {
  event: CalendarEvent;
  isFirst?: boolean;
}

export const Event: React.FC<EventProps> = ({ event, isFirst = false }) => {
  return (
    <Link to="/events/$slug" params={{ slug: `${event.id}-${event.slug}` }}>
      <div
        className={`${isFirst ? "" : "border-t"} border-gray-300 pb-6 md:pb-10 pt-2`}
      >
        <div className="grid grid-cols-[auto_1fr] md:grid-cols-[auto_minmax(180px,1fr)_300px_auto] items-center gap-4 md:gap-10">
          <EmojiBox emoji={event.emoji ?? ""} />

          <div className="flex flex-col gap-0 min-w-0 overflow-hidden">
            <span className="text-gray-700 text-sm md:text-md">
              {formatEventTime(event.start_at, event.end_at)}
            </span>

            <h2 className="text-xl md:text-[34px] font-extrabold line-clamp-2 leading-tight md:leading-12 overflow-hidden text-ellipsis">
              {event.name ?? "Untitled Event"}
            </h2>
          </div>

          <div className="hidden md:flex flex-col gap-1.5 min-w-0 overflow-hidden">
            {event.location && (
              <>
                {event.location.name && (
                  <div className="text-gray-800 text-lg md:text-xl overflow-hidden text-ellipsis">
                    {event.location.name}
                  </div>
                )}

                {event.location.address && (
                  <div className="text-gray-500 text-lg md:text-xl overflow-hidden text-ellipsis">
                    {event.location.address}
                  </div>
                )}
              </>
            )}
          </div>

          <span className="hidden md:flex text-red-600 text-xl items-center gap-1 whitespace-nowrap">
            Learn more
            <IconArrowRight className="text-black" />
          </span>
        </div>

        {/* Mobile-only location and learn more */}
        <div className="mt-4 flex flex-col gap-2 md:hidden">
          {event.location && (
            <>
              {event.location.name && (
                <div className="text-gray-800 text-base">
                  {event.location.name}
                </div>
              )}

              {event.location.address && (
                <div className="text-gray-500 text-base">
                  {event.location.address}
                </div>
              )}
            </>
          )}

          <span className="text-red-600 text-base flex items-center gap-1 whitespace-nowrap mt-2">
            Learn more
            <IconArrowRight className="text-black" size={18} />
          </span>
        </div>
      </div>
    </Link>
  );
};
