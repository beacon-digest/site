import { useState, useEffect } from "react";
import { TextInput } from "@mantine/core";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { IconSearch } from "@tabler/icons-react";

export function SearchBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSearchPage = location.pathname === "/search";

  // Parse q from URL when on the search page so the input stays in sync
  const urlQ = isSearchPage
    ? (new URLSearchParams(location.search).get("q") ?? "")
    : "";

  const [value, setValue] = useState(urlQ);

  useEffect(() => {
    setValue(urlQ);
  }, [urlQ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/search", search: (prev) => ({ ...prev, q: value }) });
  };

  if (isSearchPage) return null;

  return (
    <form onSubmit={handleSubmit} className="hidden md:flex flex-1 max-w-sm">
      <TextInput
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        placeholder="Search events..."
        leftSection={<IconSearch size={16} />}
        size="sm"
        radius="xl"
        className="w-full"
      />
    </form>
  );
}
