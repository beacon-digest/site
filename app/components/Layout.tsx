import type { ReactNode } from "react";
import { AppShell, Group } from "@mantine/core";

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
        <h1 className="text-2xl font-extrabold font-hepta-slab">
          Beacon Digest
        </h1>

        <Group gap="xl">
          <div className="text-sm font-semibold">Home</div>
          <div className="text-sm font-semibold">Events</div>
          <div className="text-sm font-semibold">About</div>
        </Group>
      </AppShell.Header>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
