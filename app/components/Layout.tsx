import type { ReactNode } from "react";
import { AppShell, Group } from "@mantine/core";
import { Link, useLocation } from "@tanstack/react-router";
import { IconSearch } from "@tabler/icons-react";
import { SearchBar } from "./SearchBar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const isSearchPage = useLocation({ select: (l) => l.pathname }) === "/search";

  return (
    <AppShell
      withBorder
      header={{ height: { base: 60, md: 80 } }}
      styles={{
        header: {
          borderBottom: "1px solid var(--color-neutral-300)",
          fontFamily: "var(--font-libre-franklin)",
        },
        main: {
          fontFamily: "var(--font-libre-franklin)",
        },
      }}
    >
      <AppShell.Header className="flex items-center gap-4 justify-between px-4 md:px-12">
        <Link to="/" className="shrink-0">
          <h1 className="text-xl md:text-2xl font-extrabold font-hepta-slab">
            Beacon Digest
          </h1>
        </Link>

        <SearchBar />

        <Group gap="md" className="md:gap-xl shrink-0">
          <Link to="/" className="text-xs md:text-sm font-semibold">
            Events
          </Link>

          <Link to="/about" className="text-xs md:text-sm font-semibold">
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
