import { HandlerContext } from "$fresh/server.ts";
import { encodeBase58 } from "https://deno.land/std@0.224.0/encoding/base58.ts";
import { getSessionId } from "@deno/kv-oauth";

export const handler = async (
  req: Request,
  _ctx: HandlerContext,
): Promise<Response> => {
  const sessionId = await getSessionId(req);
  if (sessionId === undefined) {
    return Response.redirect(`${new URL(req.url).origin}/signin?success_url=/dashboard`, 302);
  }

  const listId = encodeBase58(crypto.getRandomValues(new Uint8Array(8)));
  const url = new URL(req.url);
  return Response.redirect(`${url.origin}/dashboard/${listId}`, 302);
};
