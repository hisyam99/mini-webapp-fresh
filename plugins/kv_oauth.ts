import { createGoogleOAuthConfig, createHelpers } from "@deno/kv-oauth";
import type { Plugin } from "$fresh/server.ts";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

const env = await load();



const { signIn, handleCallback, signOut, getSessionId } = createHelpers(
    createGoogleOAuthConfig({
        redirectUri: `${env.REDIRECT_URI}/callback`,
        scope:
            "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
    }),
);

async function getUserProfile(accessToken: string) {
    const response = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    );
    if (!response.ok) {
        throw new Error("Failed to fetch user profile");
    }
    return await response.json();
}

async function setUserProfile(sessionId: string, profile: any) {
    const kv = await Deno.openKv();
    await kv.set(["userProfiles", sessionId], profile);
}

export async function getUserProfileFromSession(sessionId: string) {
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
                const { response, sessionId, tokens } = await handleCallback(
                    req,
                );
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
                return await signOut(req);
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
