import { useState, useEffect } from "react";
import { SegmentedControl, Box } from "@mantine/core";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { IconList, IconCalendar } from "@tabler/icons-react";
import { formatInTimeZone } from "date-fns-tz";

type ViewMode = "list" | "calendar";

interface ViewToggleProps {
  currentView: ViewMode;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ currentView }) => {
  const navigate = useNavigate();
  const location = useLocation();
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

  const handleToggle = (view: string) => {
    if (view === "calendar") {
      // Navigate to current month calendar view
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      navigate({
        to: "/calendar/$year/$month",
        params: { year: String(year), month: String(month) },
      });
    } else {
      navigate({
        to: "/",
      });
    }
  };

  // Hide on mobile
  if (isMobile) {
    return null;
  }

  return (
    <div className="flex justify-start mb-4 mt-2">
      <SegmentedControl
        value={currentView}
        onChange={handleToggle}
        size="sm"
        radius="xl"
        data={[
          {
            value: "list",
            label: (
              <Box className="flex items-center gap-1.5 px-1">
                <IconList size={16} stroke={1.5} />
                <span className="hidden md:inline text-sm">List</span>
              </Box>
            ),
          },
          {
            value: "calendar",
            label: (
              <Box className="flex items-center gap-1.5 px-1">
                <IconCalendar size={16} stroke={1.5} />
                <span className="hidden md:inline text-sm">Calendar</span>
              </Box>
            ),
          },
        ]}
        styles={{
          root: {
            backgroundColor: "transparent",
            border: "1px solid #e9ecef",
          },
          indicator: {
            backgroundColor: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          },
        }}
      />
    </div>
  );
};

