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

    navigate({ to: `/${formattedDate}` });
  };

  const handleNextWeek = () => {
    setWeekOffset((prev) => prev + 1);

    // Navigate to next week's Sunday (first day of next week)
    const nextWeekSunday = addDays(baseDate, 7);
    const formattedDate = format(nextWeekSunday, "yyyy-MM-dd");

    navigate({ to: `/${formattedDate}` });
  };

  const dateLinks = Array.from({ length: daysToDisplay }, (_, i) => {
    const date = addDays(baseDate, i);
    const formattedDate = format(date, "yyyy-MM-dd");
    const path = isToday(date) ? "/" : `/calendar/${formattedDate}`;

    const isCurrentDay = formattedDate === selectedDate;

    return (
      <Link key={i} to={path} style={{ textDecoration: "none" }}>
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
            minWidth: rem(100),
            cursor: "pointer",
            transition: "background-color 0.2s ease",
          }}
        >
          <h2 className="text-center text-3xl mb-1 font-extrabold">
            {format(date, "EEE")}
          </h2>

          <span className="text-neutral-500 text-xl">
            {format(date, "MMM d")}
          </span>
        </Paper>
      </Link>
    );
  });

  return (
    <Group justify="space-between" className="py-8">
      <ActionIcon variant="subtle" onClick={handlePreviousWeek} size="lg">
        <IconChevronLeft />
      </ActionIcon>

      {dateLinks}

      <ActionIcon variant="subtle" onClick={handleNextWeek} size="lg">
        <IconChevronRight />
      </ActionIcon>
    </Group>
  );
};
