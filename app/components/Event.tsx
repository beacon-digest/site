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
    <Link
      to="/events/$slug"
      params={{ slug: `${event.id}-${event.slug}` }}
      className="group"
    >
      <div className="rounded-xl p-4 md:p-6 mb-3 md:mb-4 transition-all duration-200 ease-in-out hover:bg-gray-50 hover:shadow-sm">
        <div className="grid grid-cols-[auto_1fr] md:grid-cols-[auto_minmax(180px,1fr)_300px_auto] items-center gap-3 md:gap-6">
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

          <span className="hidden md:flex text-rose-700 text-base font-semibold items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full border border-rose-200 bg-rose-50 transition-all duration-200 group-hover:bg-rose-700 group-hover:text-white group-hover:border-rose-700">
            Learn more
            <IconArrowRight
              size={16}
              className="text-rose-700 group-hover:text-white transition-colors duration-200"
            />
          </span>
        </div>

        {/* Mobile-only location and learn more */}
        <div className="mt-3 flex flex-col gap-2 md:hidden">
          {event.location && (
            <>
              {event.location.name && (
                <div className="text-gray-800 text-sm">
                  {event.location.name}
                </div>
              )}

              {event.location.address && (
                <div className="text-gray-500 text-sm">
                  {event.location.address}
                </div>
              )}
            </>
          )}

          <span className="text-rose-700 text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full border border-rose-200 bg-rose-50 self-start mt-1">
            Learn more
            <IconArrowRight size={14} className="text-rose-700" />
          </span>
        </div>
      </div>
    </Link>
  );
};
