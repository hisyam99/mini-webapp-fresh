import { Head } from "$fresh/runtime.ts";
import { Handlers } from "$fresh/server.ts";
import { getSessionId } from "@deno/kv-oauth";
import { getUserProfileFromSession } from "../../../plugins/kv_oauth.ts";
import { getUserLists } from "../../../services/database.ts";
import UserListHistory from "../../../islands/UserListHistory.tsx";

// Handler untuk menangani permintaan GET ke halaman.
export const handler: Handlers = {
    GET: async (req, ctx) => {
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

        // Mendapatkan daftar tugas pengguna berdasarkan session ID.
        const lists = await getUserLists(sessionId);
        // Merender halaman dengan data lists dan profile.
        return ctx.render({ lists, profile });
    },
};

export default function HistoryPage(
    { data }: {
        data: {
            lists: Array<{ id: string; createdAt: number; isPublic: boolean }>;
            profile: { name?: string };
        };
    },
) {
    return (
        <>
            {/* Menambahkan elemen <head> dengan judul halaman */}
            <Head>
                <title>Riwayat Daftar Tugas Anda</title>
            </Head>
            <div class="p-4 mx-auto max-w-screen-md">
                {/* Menampilkan judul halaman */}
                <h1 class="text-2xl font-bold mb-4">Your Todo List History</h1>
                {/* Memanggil komponen UserListHistory dengan properti lists dan profile */}
                <UserListHistory lists={data.lists} profile={data.profile} />
            </div>
        </>
    );
}
