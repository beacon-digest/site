import { createStart } from "@tanstack/react-start";
import { authkitMiddleware } from "@workos/authkit-tanstack-react-start";

// The AuthKit middleware validates WorkOS configuration on every request and
// throws if it is missing. Only register it once WorkOS env vars are present so
// the public site keeps working before the admin panel is configured.
const workosConfigured = Boolean(
  process.env.WORKOS_CLIENT_ID && process.env.WORKOS_API_KEY,
);

export const startInstance = createStart(() => ({
  requestMiddleware: workosConfigured ? [authkitMiddleware()] : [],
}));
