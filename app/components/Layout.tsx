import type { ReactNode } from "react";
import { AppShell, Group } from "@mantine/core";
import { Link, useLocation } from "@tanstack/react-router";
import { IconSearch } from "@tabler/icons-react";
import { SearchBar } from "./SearchBar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const pathname = useLocation({ select: (l) => l.pathname });
  const isSearchPage = pathname === "/search";
  const isEventsActive =
    pathname === "/" ||
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/events");
  const isAboutActive = pathname === "/about";

  return (
    <AppShell
      withBorder
      header={{ height: { base: 60, md: 80 } }}
      styles={{
        header: {
          borderBottom: "1px solid var(--color-gray-200)",
          fontFamily: "var(--font-libre-franklin)",
        },
        main: {
          fontFamily: "var(--font-libre-franklin)",
        },
      }}
    >
      <AppShell.Header className="flex items-center gap-4 justify-between px-4 md:px-12">
        <Link to="/" className="shrink-0">
          <h1 className="text-xl md:text-2xl font-extrabold font-hepta-slab transition-colors duration-150 hover:text-rose-800">
            Beacon Digest
          </h1>
        </Link>

        <SearchBar />

        <Group gap="md" className="md:gap-xl shrink-0">
          <Link
            to="/"
            className={`text-xs md:text-sm font-semibold transition-colors duration-150 ${
              isEventsActive
                ? "text-rose-700"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Events
          </Link>

          <Link
            to="/about"
            className={`text-xs md:text-sm font-semibold transition-colors duration-150 ${
              isAboutActive
                ? "text-rose-700"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            About
          </Link>

          {/* Mobile-only search icon */}
          {!isSearchPage && (
            <Link to="/search" className="flex items-center md:hidden">
              <IconSearch size={18} />
            </Link>
          )}
        </Group>
      </AppShell.Header>
      <AppShell.Main id="main-scroll-container">{children}</AppShell.Main>
    </AppShell>
  );
}
