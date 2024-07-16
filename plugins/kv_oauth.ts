import {
    createFacebookOAuthConfig,
    createGoogleOAuthConfig,
    createHelpers,
} from "@deno/kv-oauth";
import type { Plugin } from "$fresh/server.ts";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

const _env = await load();

const googleOAuthConfig = createGoogleOAuthConfig({
    redirectUri: `${Deno.env.get("REDIRECT_URI")}/google/callback`,
    scope:
        "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
});

const facebookOAuthConfig = createFacebookOAuthConfig({
    redirectUri: `${Deno.env.get("REDIRECT_URI")}/facebook/callback`,
    scope: "public_profile,email",
});

const googleHelpers = createHelpers(googleOAuthConfig);
const facebookHelpers = createHelpers(facebookOAuthConfig);

async function getUserProfile(
    provider: "google" | "facebook",
    accessToken: string,
) {
    let url;
    if (provider === "google") {
        url = "https://www.googleapis.com/oauth2/v2/userinfo";
    } else {
        url = "https://graph.facebook.com/me?fields=id,name,email";
    }

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    if (!response.ok) {
        throw new Error("Failed to fetch user profile");
    }
    return await response.json();
}

async function setUserProfile(sessionId: string, profile: string) {
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
            path: "/signin/google",
            async handler(req) {
                return await googleHelpers.signIn(req);
            },
        },
        {
            path: "/signin/facebook",
            async handler(req) {
                return await facebookHelpers.signIn(req);
            },
        },
        {
            path: "/google/callback",
            async handler(req) {
                const { response, sessionId, tokens } = await googleHelpers
                    .handleCallback(req);
                if (tokens.accessToken && sessionId) {
                    const profile = await getUserProfile(
                        "google",
                        tokens.accessToken,
                    );
                    await setUserProfile(sessionId, profile);
                }
                return response;
            },
        },
        {
            path: "/facebook/callback",
            async handler(req) {
                const { response, sessionId, tokens } = await facebookHelpers
                    .handleCallback(req);
                if (tokens.accessToken && sessionId) {
                    const profile = await getUserProfile(
                        "facebook",
                        tokens.accessToken,
                    );
                    await setUserProfile(sessionId, profile);
                }
                return response;
            },
        },
        {
            path: "/signout",
            async handler(req) {
                return await googleHelpers.signOut(req);
            },
        },
        {
            path: "/protected",
            async handler(req) {
                const sessionId = await googleHelpers.getSessionId(req) ||
                    await facebookHelpers.getSessionId(req);
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
            path: "/api/profile",
            async handler(req) {
                const sessionId = await googleHelpers.getSessionId(req) ||
                    await facebookHelpers.getSessionId(req);
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
