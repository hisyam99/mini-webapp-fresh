import { Head } from "$fresh/runtime.ts";
import { Handlers } from "$fresh/server.ts";
import TodoListView from "../../islands/TodoListView.tsx";
import {
  db,
  loadList,
  toggleListPrivacy,
  writeItems,
} from "../../services/database.ts";
import { TodoList } from "../../shared/api.ts";
import { getSessionId } from "@deno/kv-oauth";
import { getUserProfileFromSession } from "../../plugins/kv_oauth.ts";

// Handler untuk menangani permintaan GET dan POST ke halaman.
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

    // Mendapatkan listId dari parameter konteks.
    const listId = ctx.params.listId;
    const url = new URL(req.url);

    // Jika permintaan menggunakan WebSocket.
    if (req.headers.get("upgrade") === "websocket") {
      const { socket, response } = Deno.upgradeWebSocket(req);

      socket.onopen = () => {
        console.log(`WebSocket opened for list ${listId}`);
      };

      socket.onmessage = async (event) => {
        try {
          const mutations = JSON.parse(event.data);
          await writeItems(listId, mutations);
          const updatedData = await loadList(listId, "strong", sessionId);
          if (updatedData) {
            socket.send(JSON.stringify(updatedData));
          }
        } catch (error) {
          console.error(`Error processing message for list ${listId}:`, error);
        }
      };

      socket.onclose = () => {
        console.log(`WebSocket closed for list ${listId}`);
      };

      // Mengawasi perubahan pada list tertentu di database.
      const watcher = db.watch([["list_updated", listId]]);

      (async () => {
        for await (const _change of watcher) {
          try {
            const updatedData = await loadList(listId, "strong", sessionId);
            if (updatedData) {
              socket.send(JSON.stringify(updatedData));
            }
          } catch (error) {
            console.error(`Error sending update for list ${listId}:`, error);
          }
        }
      })();

      return response;
    }

    // Mendapatkan data daftar dengan konsistensi yang diminta.
    const startTime = Date.now();
    const data = await loadList(
      listId,
      url.searchParams.get("consistency") === "strong" ? "strong" : "eventual",
      sessionId,
    );
    const endTime = Date.now();

    if (!data) {
      return new Response("List not found or access denied", { status: 404 });
    }

    const res = await ctx.render({
      data,
      latency: endTime - startTime,
      sessionId,
    });
    res.headers.set("x-list-load-time", "" + (endTime - startTime));

    return res;
  },

  POST: async (req, ctx) => {
    const sessionId = await getSessionId(req);
    if (sessionId === undefined) {
      return new Response("Unauthorized", { status: 401 });
    }

    const listId = ctx.params.listId;
    const formData = await req.formData();
    if (formData.get("action") === "togglePrivacy") {
      const success = await toggleListPrivacy(listId, sessionId);
      if (success) {
        return Response.redirect(req.url, 302);
      } else {
        return new Response("Unauthorized", { status: 401 });
      }
    }

    return new Response("Invalid action", { status: 400 });
  },
};

// Komponen utama untuk halaman daftar tugas.
export default function Home(
  { data: { data, latency }, sessionId }: {
    data: { data: TodoList; latency: number };
    sessionId: string;
  },
) {
  return (
    <>
      {/* Menambahkan elemen <head> dengan judul halaman */}
      <Head>
        <title>Todo List</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        {/* Memanggil komponen TodoListView dengan properti initialData, latency, dan sessionId */}
        <TodoListView
          initialData={data}
          latency={latency}
          sessionId={sessionId}
        />
      </div>
    </>
  );
}
