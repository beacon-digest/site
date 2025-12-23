import { useMemo } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import type { CalendarEvent } from "../../db/types/calendar-event";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isToday,
  isSameMonth,
  isSameDay,
  addDays,
  parseISO,
} from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { ActionIcon, Button, Paper } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { formatEventTime } from "../utils/events";

interface CalendarViewProps {
  currentDate: string; // YYYY-MM-DD format
  events: CalendarEvent[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentDate,
  events: initialEvents,
}) => {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as {
    year?: string;
    month?: string;
  };

  const currentDateObj = parseISO(currentDate);

  // Calculate display month from route params or current date
  const displayMonth =
    params.year && params.month
      ? new Date(
          Number.parseInt(params.year, 10),
          Number.parseInt(params.month, 10) - 1,
          1
        )
      : startOfMonth(currentDateObj);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    for (const event of initialEvents) {
      if (event.start_at) {
        const eventDate = formatInTimeZone(
          event.start_at,
          "America/New_York",
          "yyyy-MM-dd"
        );
        if (!grouped[eventDate]) {
          grouped[eventDate] = [];
        }
        grouped[eventDate].push(event);
      }
    }
    return grouped;
  }, [initialEvents]);

  // Get calendar grid dates
  const calendarDates = useMemo(() => {
    const monthStart = startOfMonth(displayMonth);
    const monthEnd = endOfMonth(displayMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 }); // Sunday

    const dates: Date[] = [];
    let currentDate = calendarStart;
    while (currentDate <= calendarEnd) {
      dates.push(currentDate);
      currentDate = addDays(currentDate, 1);
    }
    return dates;
  }, [displayMonth]);

  const handlePreviousMonth = () => {
    const prevMonth = subMonths(displayMonth, 1);
    const year = prevMonth.getFullYear();
    const month = prevMonth.getMonth() + 1;
    navigate({
      to: "/calendar/$year/$month",
      params: { year: String(year), month: String(month) },
    });
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(displayMonth, 1);
    const year = nextMonth.getFullYear();
    const month = nextMonth.getMonth() + 1;
    navigate({
      to: "/calendar/$year/$month",
      params: { year: String(year), month: String(month) },
    });
  };

  const handleToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    navigate({
      to: "/calendar/$year/$month",
      params: { year: String(year), month: String(month) },
    });
  };

  const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="w-full mb-10">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold">
          {format(displayMonth, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-2">
          <ActionIcon
            variant="subtle"
            onClick={handlePreviousMonth}
            size="md"
            className="md:!size-lg"
          >
            <IconChevronLeft />
          </ActionIcon>
          <Button
            variant="subtle"
            size="sm"
            onClick={handleToday}
            className="px-3"
          >
            Today
          </Button>
          <ActionIcon
            variant="subtle"
            onClick={handleNextMonth}
            size="md"
            className="md:!size-lg"
          >
            <IconChevronRight />
          </ActionIcon>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 md:gap-4 mb-2">
        {dayHeaders.map((day) => (
          <div
            key={day}
            className="text-center text-sm md:text-base font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 md:gap-4">
        {calendarDates.map((date) => {
          const dateKey = format(date, "yyyy-MM-dd");
          const dayEvents = eventsByDate[dateKey] || [];
          const isCurrentMonth = isSameMonth(date, displayMonth);
          const isCurrentDay = isToday(date);
          const isSelectedDay = isSameDay(date, currentDateObj);

          return (
            <Paper
              key={dateKey}
              p="xs"
              className={`min-h-[100px] md:min-h-[150px] border ${
                isCurrentMonth ? "bg-white" : "bg-gray-50"
              } ${isSelectedDay ? "border-2 border-blue-500" : "border-gray-200"}`}
            >
              <div
                className={`text-sm md:text-base font-semibold mb-1 ${
                  isCurrentDay
                    ? "text-blue-600"
                    : isCurrentMonth
                      ? "text-gray-900"
                      : "text-gray-400"
                }`}
              >
                {format(date, "d")}
              </div>
              <div className="space-y-1">
                {dayEvents.map((event) => {
                  const eventTime = formatEventTime(
                    event.start_at,
                    event.end_at
                  );
                  const eventSlug = `${event.id}-${event.slug}`;
                  return (
                    <Link
                      key={event.id}
                      to="/events/$slug"
                      params={{ slug: eventSlug }}
                      className="block text-xs hover:bg-gray-100 rounded px-1 py-0.5"
                    >
                      <div className="flex items-start gap-1">
                        <span className="flex-shrink-0">
                          {event.emoji || "📅"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-gray-600 truncate">
                            {eventTime}
                          </div>
                          <div className="line-clamp-2 font-medium">
                            {event.name || "Untitled Event"}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </Paper>
          );
        })}
      </div>
    </div>
  );
};
