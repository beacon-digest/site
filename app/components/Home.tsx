import { CalendarEvent } from "../../db/types/calendar-event";
import { DayNavbar } from "./DayNavbar";
import { Event } from "../components/Event";

interface HomeProps {
  date: string;
  events: CalendarEvent[];
}

export const Home: React.FC<HomeProps> = ({ date, events }) => (
  <div className="px-12">
    <DayNavbar selectedDate={date} />

    {events.map((event) => (
      <Event
        key={event.id}
        emoji={event.emoji ?? ""}
        title={event.name ?? ""}
        location={"Cool place"}
        address={"123 Rad Street"}
        time={"8:00 AM - 3:00 PM"}
      />
    ))}
  </div>
);
