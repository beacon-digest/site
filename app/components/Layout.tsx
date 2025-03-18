import { useState } from "react";
import type { ReactNode } from "react";
import {
  AppShell,
  Burger,
  Group,
  Title,
  Divider,
  NavLink,
  Text,
} from "@mantine/core";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [opened, setOpened] = useState(false);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header p="md">
        <Group justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={() => setOpened((o) => !o)}
              hiddenFrom="sm"
              size="sm"
            />
            <Title order={3}>Beacon Digest Calendar</Title>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section>
          <Text fw={500} size="sm" mb="xs">
            VIEWS
          </Text>
        </AppShell.Section>
        <Divider mb="sm" />
        <AppShell.Section grow>
          <NavLink label="Events" active />
          <NavLink label="Locations" />
        </AppShell.Section>
        <Divider my="sm" />
        <AppShell.Section>
          <NavLink label="Settings" />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
