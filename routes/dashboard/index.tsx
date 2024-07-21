import { HandlerContext } from "$fresh/server.ts";
import { getSessionId } from "@deno/kv-oauth";
import { createList } from "../../services/database.ts";
import { getUserProfileFromSession } from "../../plugins/kv_oauth.ts";

// Handler untuk menangani permintaan yang membuat daftar tugas baru.
export const handler = async (
  req: Request,
  _ctx: HandlerContext,
): Promise<Response> => {
  // Mendapatkan session ID dari permintaan.
  const sessionId = await getSessionId(req);

  if (sessionId === undefined) {
    // Jika session ID tidak ditemukan, alihkan ke halaman signin.
    return Response.redirect(`${new URL(req.url).origin}/signin`, 302);
  }

  // Mendapatkan profil pengguna berdasarkan session ID.
  const profile = await getUserProfileFromSession(sessionId);
  if (!profile) {
    // Jika profil tidak ditemukan, kembalikan respons dengan status 404.
    return new Response("Profile not found", { status: 404 });
  }

  // Membuat daftar tugas baru dan mendapatkan ID-nya.
  const listId = await createList(sessionId);
  const url = new URL(req.url);

  // Mengarahkan pengguna ke halaman dashboard dengan ID daftar tugas baru.
  return Response.redirect(`${url.origin}/dashboard/${listId}`, 302);
};
