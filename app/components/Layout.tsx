import type { ReactNode } from "react";
import { AppShell, Group } from "@mantine/core";
import { Link } from "@tanstack/react-router";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <AppShell
      withBorder
      header={{ height: 80 }}
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
      <AppShell.Header className="flex items-center justify-between px-12">
        <Link to="/">
          <h1 className="text-2xl font-extrabold font-hepta-slab">
            Beacon Digest
          </h1>
        </Link>

        <Group gap="xl">
          <Link to="/" className="text-sm font-semibold">
            Events
          </Link>

          <div className="text-sm font-semibold">About</div>
        </Group>
      </AppShell.Header>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
