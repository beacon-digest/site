import { Button, Group } from "@mantine/core";
import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { requireAdmin } from "../../server/auth/require-admin";

export const Route = createFileRoute("/admin")({
  loader: async () => {
    const auth = await requireAdmin();
    return { auth };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { auth } = Route.useLoaderData();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen" style={{ fontFamily: "var(--font-libre-franklin)" }}>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-6">
          <Link to="/admin" className="text-lg font-extrabold font-hepta-slab">
            Beacon Digest Admin
          </Link>
          <Link to="/admin" className="text-sm font-semibold">
            Events
          </Link>
          <Link to="/admin/events/new" className="text-sm font-semibold">
            New event
          </Link>
        </div>
        <Group gap="sm">
          <span className="text-sm text-gray-600">{auth.user.email}</span>
          <Button
            size="xs"
            variant="default"
            onClick={() => signOut({ returnTo: "/" })}
          >
            Sign out
          </Button>
        </Group>
      </header>
      <main className="px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
