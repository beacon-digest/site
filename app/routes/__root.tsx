import { MantineProvider, createTheme } from "@mantine/core";
import type { QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import { AuthKitProvider } from "@workos/authkit-tanstack-react-start/client";
import type { ReactNode } from "react";
import mantineCssUrl from "@mantine/core/styles.css?url";
import appCssUrl from "../styles/app.css?url";
import { Layout } from "../components/Layout";
import { ScrollToTop } from "../components/ScrollToTop";

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
        name: "google",
        content: "notranslate",
      },
      {
        title: "Beacon Digest",
      },
      {
        property: "og:title",
        content: "Beacon Digest",
      },
      {
        property: "og:description",
        content: "Beacon, NY - Free community calendar",
      },
      {
        property: "og:image",
        content: "/og-image.png",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "Beacon Digest",
      },
      {
        name: "twitter:description",
        content: "Beacon, NY - Free community calendar",
      },
      {
        name: "twitter:image",
        content: "/og-image.png",
      },
    ],
    links: [
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon.png",
      },
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
  const isAdmin = useRouterState({
    select: (s) => s.location.pathname.startsWith("/admin"),
  });

  return (
    <RootDocument>
      <MantineProvider theme={theme}>
        <ScrollToTop />
        {isAdmin ? (
          <AuthKitProvider>
            <Outlet />
          </AuthKitProvider>
        ) : (
          <Layout>
            <Outlet />
          </Layout>
        )}
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
