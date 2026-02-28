import type { ReactNode } from "react";
import { AppShell, Group } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { IconSearch } from "@tabler/icons-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
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
      <AppShell.Header className="flex items-center justify-between px-4 md:px-12">
        <Link to="/">
          <h1 className="text-xl md:text-2xl font-extrabold font-hepta-slab">
            Beacon Digest
          </h1>
        </Link>

        <Group gap="md" className="md:gap-xl">
          <Link to="/" className="text-xs md:text-sm font-semibold">
            Events
          </Link>

          <Link to="/about" className="text-xs md:text-sm font-semibold">
            About
          </Link>

          <Link to="/search" className="flex items-center gap-1 text-xs md:text-sm font-semibold">
            <IconSearch size={16} />
            <span className="hidden md:inline">Search</span>
          </Link>
        </Group>
      </AppShell.Header>
      <AppShell.Main id="main-scroll-container">{children}</AppShell.Main>
    </AppShell>
  );
}
