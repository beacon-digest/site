import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getAuth } from "@workos/authkit-tanstack-react-start";

export type AdminAuth = {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  organizationId: string | null;
  role: string | null;
  // null means WorkOS RBAC permissions are not configured (see hasPermission).
  permissions: string[] | null;
};

type RawAuth = {
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  organizationId?: string;
  role?: string;
  permissions?: string[];
};

const SIGN_IN_PATH = "/api/auth/sign-in";

/**
 * Server-only core. Returns the authenticated staff user, or null when the
 * visitor is signed out, not a member of the staff organization, or WorkOS is
 * not configured yet. Reads process.env, so it must only run on the server.
 */
export async function resolveAdminAuth(): Promise<AdminAuth | null> {
  let auth: RawAuth;
  try {
    auth = (await getAuth()) as RawAuth;
  } catch {
    // AuthKit middleware is not active (WorkOS env vars not set).
    return null;
  }

  if (!auth.user) return null;

  const staffOrgId = process.env.WORKOS_STAFF_ORG_ID;
  // Fail closed: without a configured staff org we cannot scope access.
  if (!staffOrgId || auth.organizationId !== staffOrgId) return null;

  return {
    user: {
      id: auth.user.id,
      email: auth.user.email,
      firstName: auth.user.firstName ?? null,
      lastName: auth.user.lastName ?? null,
    },
    organizationId: auth.organizationId ?? null,
    role: auth.role ?? null,
    permissions: auth.permissions ?? null,
  };
}

/** Loader-safe wrapper (callable during client-side navigation via RPC). */
export const getAdminAuth = createServerFn({ method: "GET" }).handler(
  async () => resolveAdminAuth(),
);

/** For route loaders: redirect to sign-in when the visitor is not a staff admin. */
export async function requireAdmin(
  returnPathname = "/admin",
): Promise<AdminAuth> {
  const auth = await getAdminAuth();
  if (!auth) {
    throw redirect({
      href: `${SIGN_IN_PATH}?returnPathname=${encodeURIComponent(returnPathname)}`,
    });
  }
  return auth;
}

/**
 * If WorkOS RBAC permissions are configured they are enforced; if the token has
 * no permissions claim (RBAC not set up yet) any staff member is allowed, so the
 * panel is usable before fine-grained roles are defined.
 */
export function hasPermission(auth: AdminAuth, permission: string): boolean {
  if (auth.permissions === null) return true;
  return auth.permissions.includes(permission);
}

/** For mutation server functions: throws (instead of redirecting) when unauthorized. */
export async function requireAdminPermission(
  permission: string,
): Promise<AdminAuth> {
  const auth = await resolveAdminAuth();
  if (!auth) throw new Error("Unauthorized");
  if (!hasPermission(auth, permission)) throw new Error("Forbidden");
  return auth;
}
