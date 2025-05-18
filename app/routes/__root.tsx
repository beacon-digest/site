import { MantineProvider, createTheme } from "@mantine/core";
import type { QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import mantineCssUrl from "@mantine/core/styles.css?url";
import appCssUrl from "../styles/app.css?url";
import { Layout } from "../components/Layout";

const theme = createTheme({});

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Beacon Digest",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: mantineCssUrl,
      },
      {
        rel: "stylesheet",
        href: appCssUrl,
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Hepta+Slab:wght@800&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Libre+Franklin:wght500;600;800&display=swap",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <MantineProvider theme={theme}>
        <Layout>
          <Outlet />
        </Layout>
      </MantineProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
