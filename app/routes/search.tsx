import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MultiSelect, TextInput } from "@mantine/core";
import { IconSearch, IconCalendarOff } from "@tabler/icons-react";
import { searchEvents } from "../server/events/search";
import { getLocations } from "../server/locations";
import { Event } from "../components/Event";

type SearchParams = {
  q: string;
  locations: number[];
};

const loader = async ({ deps }: { deps: SearchParams }) => {
  const [events, locationsList] = await Promise.all([
    searchEvents({
      data: {
        q: deps.q || undefined,
        locationIds: deps.locations.length ? deps.locations : undefined,
      },
    }),
    getLocations(),
  ]);
  return { events, locationsList };
};

const SearchContainer = () => {
  const navigate = useNavigate({ from: "/search" });
  const { q, locations } = Route.useSearch();
  const { events, locationsList } = Route.useLoaderData();

  const [queryValue, setQueryValue] = useState(q);

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ search: (prev) => ({ ...prev, q: queryValue }) });
  };

  const handleLocationChange = (values: string[]) => {
    navigate({
      search: (prev) => ({
        ...prev,
        locations: values.map(Number),
      }),
    });
  };

  const locationOptions = locationsList.map((loc) => ({
    value: String(loc.id),
    label: loc.name ?? "Unknown location",
  }));

  return (
    <div className="px-4 md:px-12 py-6">
      <h1 className="text-2xl md:text-3xl font-extrabold font-hepta-slab mb-6">
        Find Events
      </h1>

      <div className="flex flex-wrap gap-4 mb-8">
        <form onSubmit={handleQuerySubmit} className="w-full max-w-sm">
          <TextInput
            value={queryValue}
            onChange={(e) => setQueryValue(e.currentTarget.value)}
            placeholder="Search events..."
            leftSection={<IconSearch size={16} />}
            radius="xl"
            autoFocus
          />
        </form>

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
    const rawLocations = search.locations;
    const locations = Array.isArray(rawLocations)
      ? rawLocations.map(Number).filter(Boolean)
      : rawLocations
        ? [Number(rawLocations)].filter(Boolean)
        : [];
    return {
      q: typeof search.q === "string" ? search.q : "",
      locations,
    };
  },
  loaderDeps: ({ search: { q, locations } }) => ({ q, locations }),
  loader,
  component: SearchContainer,
});
