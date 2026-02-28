import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MultiSelect } from "@mantine/core";
import { searchEvents } from "../server/events/search";
import { getLocations } from "../server/locations";
import { Event } from "../components/Event";
import { IconCalendarOff } from "@tabler/icons-react";

type SearchParams = {
  locations: number[];
};

const loader = async ({ deps }: { deps: SearchParams }) => {
  const [events, locationsList] = await Promise.all([
    searchEvents({
      data: {
        locationIds: deps.locations.length ? deps.locations : undefined,
      },
    }),
    getLocations(),
  ]);
  return { events, locationsList };
};

const SearchContainer = () => {
  const navigate = useNavigate({ from: "/search" });
  const { locations } = Route.useSearch();
  const { events, locationsList } = Route.useLoaderData();

  const locationOptions = locationsList.map((loc) => ({
    value: String(loc.id),
    label: loc.name ?? "Unknown location",
  }));

  const handleLocationChange = (values: string[]) => {
    navigate({
      search: (prev) => ({
        ...prev,
        locations: values.map(Number),
      }),
    });
  };

  return (
    <div className="px-4 md:px-12 py-6">
      <h1 className="text-2xl md:text-3xl font-extrabold font-hepta-slab mb-6">
        Find Events
      </h1>

      <div className="flex flex-wrap gap-4 mb-8">
        <MultiSelect
          label="Location"
          placeholder="All locations"
          data={locationOptions}
          value={locations.map(String)}
          onChange={handleLocationChange}
          clearable
          searchable
          className="w-full max-w-sm"
        />
      </div>

      <div className="border-t border-gray-300 pt-4">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 md:py-24">
            <IconCalendarOff className="w-16 h-16 md:w-20 md:h-20 text-gray-400 mb-4" />
            <p className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
              No upcoming events found
            </p>
            <p className="text-sm md:text-base text-gray-500">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          events.map((event, index) => (
            <Event key={event.id} event={event} isFirst={index === 0} />
          ))
        )}
      </div>
    </div>
  );
};

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    const raw = search.locations;
    const locations = Array.isArray(raw)
      ? raw.map(Number).filter(Boolean)
      : raw
        ? [Number(raw)].filter(Boolean)
        : [];
    return { locations };
  },
  loaderDeps: ({ search: { locations } }) => ({ locations }),
  loader,
  component: SearchContainer,
});
