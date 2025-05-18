import { DayNavbar } from "./DayNavbar";
import { Event } from "./Event";

interface HomeProps {
  date?: string;
}

export const Home: React.FC<HomeProps> = ({ date }) => {
  return (
    <div className="px-12">
      <DayNavbar selectedDate={date} />

      <Event
        emoji="👒"
        title="Beacon Flea Market"
        location="South Chestnut & Henry St"
        time="8:00 AM - 3:00 PM"
      />
      <Event
        emoji="📚"
        title="Storytime"
        location="Sibling"
        address="500 Main St"
        time="9:00 AM"
      />
      <Event
        emoji="🧣"
        title="Knit a Sampler Scart (First Class)"
        location="Beetle and Fred"
        address="217 Main St"
        time="10:00 AM - 12:00 PM"
      />
      <Event
        emoji="🧑‍🌾"
        title="Beacon Farmers' Market"
        location="DMV Parking Lot"
        address="223 Main St"
        time="10:00 AM - 2:00 PM"
      />
      <Event
        emoji="🚸"
        title="ARF 1k Kids Fun Run (Ages 3-10)"
        location="Memorial Park"
        time="10:00 AM"
      />
      <Event
        emoji="🐕"
        title="ARF 5k Run & Walk with the Dogs"
        location="Memorial Park"
        time="10:00 AM"
      />
      <Event
        emoji="🥏"
        title="Beacon Glades Disc Golf Sunday Doubles"
        location="Beacon Glades"
        address="724 Wolcott Ave"
        time="11:00 AM"
      />
    </div>
  );
};
