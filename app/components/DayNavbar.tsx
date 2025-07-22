import { ActionIcon, Group, Paper, rem } from "@mantine/core";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  addDays,
  differenceInWeeks,
  format,
  isToday,
  parseISO,
  startOfWeek,
} from "date-fns";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useState } from "react";

interface DayNavbarProps {
  selectedDate: string;
}

export const DayNavbar: React.FC<DayNavbarProps> = ({ selectedDate }) => {
  const navigate = useNavigate();

  const calculateInitialOffset = () => {
    if (!selectedDate) return 0;

    try {
      const selected = parseISO(selectedDate);
      const currentWeekStart = startOfWeek(new Date());
      const selectedWeekStart = startOfWeek(selected);

      return differenceInWeeks(selectedWeekStart, currentWeekStart);
    } catch {
      return 0;
    }
  };

  const [weekOffset, setWeekOffset] = useState(calculateInitialOffset);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const baseDate = startOfWeek(addDays(new Date(), weekOffset * 7));
  const daysToDisplay = 7;

  const handlePreviousWeek = () => {
    setWeekOffset((prev) => prev - 1);

    // Navigate to previous week's Saturday (last day of previous week)
    const previousWeekSaturday = addDays(baseDate, -1);
    const formattedDate = format(previousWeekSaturday, "yyyy-MM-dd");

    navigate({ to: "/calendar/$date", params: { date: formattedDate } });
  };

  const handleNextWeek = () => {
    setWeekOffset((prev) => prev + 1);

    // Navigate to next week's Sunday (first day of next week)
    const nextWeekSunday = addDays(baseDate, 7);
    const formattedDate = format(nextWeekSunday, "yyyy-MM-dd");

    navigate({ to: "/calendar/$date", params: { date: formattedDate } });
  };

  const dateLinks = Array.from({ length: daysToDisplay }, (_, i) => {
    const date = addDays(baseDate, i);
    const formattedDate = format(date, "yyyy-MM-dd");
    const path = isToday(date) ? "/" : `/calendar/${formattedDate}`;

    const isCurrentDay = formattedDate === selectedDate;

    return (
      <Link key={i} to={path} style={{ textDecoration: "none", width: "100%" }}>
        <Paper
          p="xs"
          onMouseEnter={() => setHoveredDay(formattedDate)}
          onMouseLeave={() => setHoveredDay(null)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isCurrentDay
              ? "#e9ecef"
              : hoveredDay === formattedDate
                ? "#f8f9fa"
                : "white",
            width: { base: "80px", md: "auto" },
            maxWidth: { base: "none", md: "120px" },
            margin: "0 auto",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
          }}
        >
          <h2 className="text-center text-lg md:text-3xl mb-0 md:mb-1 font-extrabold">
            {format(date, "EEE")}
          </h2>

          <span className="text-neutral-500 text-sm md:text-xl">
            {format(date, "MMM d")}
          </span>
        </Paper>
      </Link>
    );
  });

  return (
    <div className="relative py-4 md:py-8 px-1 w-full">
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
        <ActionIcon
          variant="subtle"
          onClick={handlePreviousWeek}
          size={{ base: "md", md: "lg" }}
          className="flex-shrink-0"
        >
          <IconChevronLeft />
        </ActionIcon>
      </div>

      <div className="flex flex-nowrap overflow-x-auto scrollbar-hidden md:grid md:grid-cols-7 md:gap-8 w-full px-2 md:px-8">
        {dateLinks}
      </div>

      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
        <ActionIcon
          variant="subtle"
          onClick={handleNextWeek}
          size={{ base: "md", md: "lg" }}
          className="flex-shrink-0"
        >
          <IconChevronRight />
        </ActionIcon>
      </div>
    </div>
  );
};
