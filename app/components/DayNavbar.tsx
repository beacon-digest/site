import { Link, useNavigate } from "@tanstack/react-router";
import {
  addDays,
  differenceInWeeks,
  format,
  isToday,
  isSameMonth,
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

  // In desktop view, use weeks. In mobile view, use a reference date with selected date in the middle
  const baseDate = isMobile
    ? selectedDate
      ? addDays(parseISO(selectedDate), -1) // Selected date will be in the middle
      : startOfWeek(new Date())
    : startOfWeek(addDays(new Date(), weekOffset * 7));

  const daysToDisplay = isMobile ? 3 : 7;
  const lastDate = addDays(baseDate, daysToDisplay - 1);

  // Month/year label
  const monthLabel = isSameMonth(baseDate, lastDate)
    ? format(baseDate, "MMMM yyyy")
    : `${format(baseDate, "MMM")} – ${format(lastDate, "MMM yyyy")}`;

  const handlePreviousWeek = () => {
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
    const isTodayDate = isToday(date);

    return (
      <Link
        key={i}
        to={path}
        style={{ textDecoration: "none", width: "100%", minWidth: "80px" }}
      >
        <div
          className={`flex flex-col items-center justify-center min-h-[74px] rounded-lg cursor-pointer transition-all duration-200 ${
            isCurrentDay
              ? "bg-rose-700 text-white shadow-md"
              : "hover:bg-gray-100"
          }`}
        >
          <h2
            className={`text-center text-lg md:text-3xl mb-0 md:mb-1 font-extrabold ${
              isCurrentDay ? "text-white" : "text-gray-900"
            }`}
          >
            {format(date, "EEE")}
          </h2>

          <span
            className={`text-sm md:text-xl text-center w-full ${
              isCurrentDay ? "text-rose-100" : "text-gray-500"
            }`}
          >
            {format(date, "MMM d")}
          </span>

          {isTodayDate && !isCurrentDay && (
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1" />
          )}
        </div>
      </Link>
    );
  });

  return (
    <div className="relative py-4 md:py-8 px-1 w-full">
      <div className="text-center mb-2 md:mb-3">
        <span className="text-sm md:text-base font-semibold text-gray-500 tracking-wide uppercase">
          {monthLabel}
        </span>
      </div>

      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 pl-2 md:pl-4">
        <button
          onClick={handlePreviousWeek}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-150 text-gray-500 hover:text-gray-700"
          aria-label="Previous week"
        >
          <IconChevronLeft size={20} />
        </button>
      </div>

      <div
        className={`flex flex-nowrap overflow-x-auto scrollbar-hidden justify-center gap-4 ${isMobile ? "" : "md:grid md:grid-cols-7"} md:gap-8 w-full px-16 md:px-12`}
      >
        {dateLinks}
      </div>

      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 pr-2 md:pr-4">
        <button
          onClick={handleNextWeek}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-150 text-gray-500 hover:text-gray-700"
          aria-label="Next week"
        >
          <IconChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};
