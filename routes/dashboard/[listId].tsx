import { Head } from "$fresh/runtime.ts";
import { Handlers } from "$fresh/server.ts";
import TodoListView from "../../islands/TodoListView.tsx";
import { db, loadList, writeItems } from "../../services/database.ts";
import { TodoList } from "../../shared/api.ts";
import { getSessionId } from "@deno/kv-oauth";
import { getUserProfileFromSession } from "../../plugins/kv_oauth.ts";

// Definisi handler untuk menangani permintaan GET
export const handler: Handlers = {
  GET: async (req, ctx) => {
    // Mendapatkan session ID dari request
    const sessionId = await getSessionId(req);
    if (sessionId === undefined) {
      // Redirect ke halaman signin jika session ID tidak ditemukan
      return Response.redirect(`${new URL(req.url).origin}/signin`, 302);
    }

    // Mendapatkan profil pengguna dari session
    const profile = await getUserProfileFromSession(sessionId);
    if (!profile) {
      // Mengembalikan respons 404 jika profil tidak ditemukan
      return new Response("Profile not found", { status: 404 });
    }

    // Mendapatkan list ID dari parameter URL
    const listId = ctx.params.listId;
    const url = new URL(req.url);

    // Handler untuk permintaan WebSocket
    if (req.headers.get("upgrade") === "websocket") {
      const { socket, response } = Deno.upgradeWebSocket(req);

      // Ketika WebSocket terbuka
      socket.onopen = () => {
        console.log(`WebSocket opened for list ${listId}`);
      };

      // Ketika pesan diterima melalui WebSocket
      socket.onmessage = async (event) => {
        try {
          // Menguraikan data mutasi dari pesan
          const mutations = JSON.parse(event.data);
          // Menulis item baru ke daftar
          await writeItems(listId, mutations);
          // Memuat data yang diperbarui dari daftar
          const updatedData = await loadList(listId, "strong");
          // Mengirimkan data yang diperbarui kembali melalui WebSocket
          socket.send(JSON.stringify(updatedData));
        } catch (error) {
          console.error(`Error processing message for list ${listId}:`, error);
        }
      };

      // Ketika WebSocket ditutup
      socket.onclose = () => {
        console.log(`WebSocket closed for list ${listId}`);
      };

      // Membuat pengawas perubahan pada database
      const watcher = db.watch([["list_updated", listId]]);

      // Mengirimkan data yang diperbarui setiap kali terjadi perubahan
      (async () => {
        for await (const _change of watcher) {
          try {
            const updatedData = await loadList(listId, "strong");
            socket.send(JSON.stringify(updatedData));
          } catch (error) {
            console.error(`Error sending update for list ${listId}:`, error);
          }
        }
      })();

      return response;
    }

    // Handler untuk permintaan GET biasa
    const startTime = Date.now();
    // Memuat data daftar dengan konsistensi sesuai parameter query
    const data = await loadList(
      listId,
      url.searchParams.get("consistency") === "strong" ? "strong" : "eventual",
    );
    const endTime = Date.now();

    // Merender tampilan dengan data yang dimuat
    const res = await ctx.render({ data, latency: endTime - startTime });
    // Menetapkan header untuk waktu pemuatan daftar
    res.headers.set("x-list-load-time", "" + (endTime - startTime));

    return res;
  },
};

// Komponen halaman utama yang menampilkan daftar tugas
export default function Home(
  { data: { data, latency } }: { data: { data: TodoList; latency: number } },
) {
  return (
    <>
      <Head>
        <title>Todo List</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        {/* Menampilkan komponen TodoListView dengan data awal dan latensi */}
        <TodoListView initialData={data} latency={latency} />
      </div>
    </>
  );
}
