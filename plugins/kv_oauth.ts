import { createClerkOAuthConfig, createHelpers } from "@hisyam99/kv-oauth";
import type { Plugin } from "$fresh/server.ts";

const { signIn, handleCallback, signOut, getSessionId } = createHelpers(
  createClerkOAuthConfig({
    redirectUri: "http://localhost:8000/callback",
    scope:
        "email profile public_metadata",
}),
);

async function getUserProfile(accessToken: string) {
  const response = await fetch("https://polished-bullfrog-50.clerk.accounts.dev/oauth/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }
  return await response.json();
}

async function setUserProfile(sessionId: string, profile: any) {
  const kv = await Deno.openKv();
  await kv.set(["userProfiles", sessionId], profile);
}

async function getUserProfileFromSession(sessionId: string) {
  const kv = await Deno.openKv();
  const result = await kv.get(["userProfiles", sessionId]);
  return result.value as { name?: string } | null;
}

export default {
  name: "kv-oauth",
  routes: [
    {
      path: "/signin",
      async handler(req) {
        return await signIn(req);
      },
    },
    {
      path: "/callback",
      async handler(req) {
        const { response, sessionId, tokens } = await handleCallback(req);
        if (tokens.accessToken && sessionId) {
          const profile = await getUserProfile(tokens.accessToken);
          await setUserProfile(sessionId, profile);
        }
        return response;
      },
    },
    {
        path: "/signout",
        async handler(req) {
            const signOutResponse = await signOut(req);
            
            // Dapatkan URL untuk redirect setelah logout
            const returnTo = new URL("/", req.url).toString();
            
            // URL endpoint logout Clerk
            const clerkLogoutUrl = new URL("https://polished-bullfrog-50.clerk.accounts.dev/v1/logout");
            clerkLogoutUrl.searchParams.set("redirect_url", returnTo);

            // Buat response baru dengan status 302 (redirect)
            const response = new Response(null, {
            status: 302,
            headers: new Headers(signOutResponse.headers)
            });

            // Set header Location untuk redirect
            response.headers.set("Location", clerkLogoutUrl.toString());

            return response;
      },
    },
    {
      path: "/protected",
      async handler(req) {
        const sessionId = await getSessionId(req);
        if (sessionId === undefined) {
          return new Response("Unauthorized", { status: 401 });
        }
        const profile = await getUserProfileFromSession(sessionId);
        if (!profile) {
          return new Response("Profile not found", { status: 404 });
        }
        return new Response(
          `Welcome, ${profile.name || "User"}! You are allowed.`,
        );
      },
    },
    {
      path: "/profile",
      async handler(req) {
        const sessionId = await getSessionId(req);
        if (sessionId === undefined) {
          return new Response("Unauthorized", { status: 401 });
        }
        const profile = await getUserProfileFromSession(sessionId);
        if (!profile) {
          return new Response("Profile not found", { status: 404 });
        }
        return new Response(JSON.stringify(profile), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  ],
} as Plugin;