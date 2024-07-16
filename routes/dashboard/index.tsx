import { HandlerContext } from "$fresh/server.ts";
import { encodeBase58 } from "https://deno.land/std@0.224.0/encoding/base58.ts";
import { getSessionId } from "@deno/kv-oauth";
import { getUserProfileFromSession } from "../../plugins/kv_oauth.ts";

export const handler = async (
  req: Request,
  _ctx: HandlerContext,
): Promise<Response> => {
  const sessionId = await getSessionId(req);
  if (sessionId === undefined) {
    return new Response("Unauthorized", { status: 401 });
  }

  const profile = await getUserProfileFromSession(sessionId);
  if (!profile) {
    return new Response("Profile not found", { status: 404 });
  }

  const listId = encodeBase58(crypto.getRandomValues(new Uint8Array(8)));
  const url = new URL(req.url);
  return Response.redirect(`${url.origin}/dashboard/${listId}`, 302);
};
