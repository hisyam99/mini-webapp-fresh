import { HandlerContext } from "$fresh/server.ts";
import { encodeBase58 } from "https://deno.land/std@0.224.0/encoding/base58.ts";
import { getSessionId } from "@deno/kv-oauth";

// Fungsi handler untuk menangani permintaan HTTP
export const handler = async (
  req: Request,
  _ctx: HandlerContext,
): Promise<Response> => {
  // Mendapatkan ID sesi dari permintaan
  const sessionId = await getSessionId(req);

  // Jika ID sesi tidak ditemukan, arahkan pengguna ke halaman login
  if (sessionId === undefined) {
    return Response.redirect(`${new URL(req.url).origin}/login`, 302);
  }

  // Membuat ID daftar yang unik menggunakan encoding Base58
  const listId = encodeBase58(crypto.getRandomValues(new Uint8Array(8)));
  const url = new URL(req.url);

  // Mengarahkan pengguna ke halaman dasbor dengan ID daftar yang baru dibuat
  return Response.redirect(`${url.origin}/dashboard/${listId}`, 302);
};
