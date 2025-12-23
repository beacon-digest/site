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
import { useState, useEffect } from "react";

interface DayNavbarProps {
  selectedDate: string;
}

export const DayNavbar: React.FC<DayNavbarProps> = ({ selectedDate }) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're in mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add event listener for resize
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Reset date range when view type changes (mobile/desktop)
  useEffect(() => {
    setWeekOffset(calculateInitialOffset());
  }, [isMobile, selectedDate]);

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

  // In desktop view, use weeks. In mobile view, use a reference date with selected date in the middle
  const baseDate = isMobile
    ? selectedDate
      ? addDays(parseISO(selectedDate), -1) // Selected date will be in the middle
      : startOfWeek(new Date())
    : startOfWeek(addDays(new Date(), weekOffset * 7));

  const daysToDisplay = isMobile ? 3 : 7;

  const handlePreviousWeek = () => {
    // Calculate the navigation target based on screen size
    const step = isMobile ? 3 : 7;

    if (!isMobile) {
      setWeekOffset((prev) => prev - 1);
    }

    // For mobile, move 3 days back; for desktop, move to previous week's start
    const previousDate = isMobile
      ? addDays(baseDate, -3)
      : addDays(baseDate, -7);

    const formattedDate = format(previousDate, "yyyy-MM-dd");
    navigate({ to: "/calendar/$date", params: { date: formattedDate } });
  };

  const handleNextWeek = () => {
    // Calculate the navigation target based on screen size
    const step = isMobile ? 3 : 7;

    if (!isMobile) {
      setWeekOffset((prev) => prev + 1);
    }

    // For mobile, move 3 days forward; for desktop, move to next week's start
    const nextDate = isMobile ? addDays(baseDate, 3) : addDays(baseDate, 7);

    const formattedDate = format(nextDate, "yyyy-MM-dd");
    navigate({ to: "/calendar/$date", params: { date: formattedDate } });
  };

  // Use baseDate directly as we've already calculated it properly above
  const dateLinks = Array.from({ length: daysToDisplay }, (_, i) => {
    const date = addDays(baseDate, i);
    const formattedDate = format(date, "yyyy-MM-dd");
    const path = isToday(date) ? "/" : `/calendar/${formattedDate}`;

    const isCurrentDay = formattedDate === selectedDate;

    return (
      <Link
        key={i}
        to={path}
        style={{ textDecoration: "none", width: "100%", minWidth: "80px" }}
      >
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
            width: { base: "100px", md: "auto" },
            maxWidth: { base: "none", md: "120px" },
            margin: "0 auto",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
            minHeight: "74px",
            border: isCurrentDay ? "1px solid #dee2e6" : "none",
            borderRadius: "8px",
          }}
        >
          <h2 className="text-center text-lg md:text-3xl mb-0 md:mb-1 font-extrabold">
            {format(date, "EEE")}
          </h2>

          <span className="text-neutral-500 text-sm md:text-xl text-center w-full">
            {format(date, "MMM d")}
          </span>
        </Paper>
      </Link>
    );
  });

  return (
    <div className="relative py-4 md:py-8 px-1 w-full">
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 pl-2 md:pl-4">
        <ActionIcon
          variant="subtle"
          onClick={handlePreviousWeek}
          size={{ base: "md", md: "lg" }}
          className="flex-shrink-0"
        >
          <IconChevronLeft />
        </ActionIcon>
      </div>

      <div
        className={`flex flex-nowrap overflow-x-auto scrollbar-hidden justify-center gap-4 ${isMobile ? "" : "md:grid md:grid-cols-7"} md:gap-8 w-full px-16 md:px-12`}
      >
        {dateLinks}
      </div>

      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 pr-2 md:pr-4">
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
