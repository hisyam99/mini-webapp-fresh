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
    // Mendapatkan sessionId dari request
    const sessionId = await getSessionId(req);
    if (sessionId === undefined) {
      // Redirect ke halaman signin jika sessionId tidak ditemukan
      return Response.redirect(`${new URL(req.url).origin}/signin`, 302);
    }

    // Mendapatkan profil pengguna dari session
    const profile = await getUserProfileFromSession(sessionId);
    if (!profile) {
      // Mengembalikan respons 404 jika profil tidak ditemukan
      return new Response("Profile not found", { status: 404 });
    }

    const listId = ctx.params.listId;
    const url = new URL(req.url);

    // Handler untuk WebSocket
    if (req.headers.get("upgrade") === "websocket") {
      const { socket, response } = Deno.upgradeWebSocket(req);

      socket.onopen = () => {
        console.log(`WebSocket opened for list ${listId}`);
      };

      socket.onmessage = async (event) => {
        try {
          const mutations = JSON.parse(event.data);
          await writeItems(listId, mutations);
          const updatedData = await loadList(listId, "strong");
          socket.send(JSON.stringify(updatedData));
        } catch (error) {
          console.error(`Error processing message for list ${listId}:`, error);
        }
      };

      socket.onclose = () => {
        console.log(`WebSocket closed for list ${listId}`);
      };

      const watcher = db.watch([["list_updated", listId]]);

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
    const data = await loadList(
      listId,
      url.searchParams.get("consistency") === "strong" ? "strong" : "eventual",
    );
    const endTime = Date.now();
    const res = await ctx.render({ data, latency: endTime - startTime });
    res.headers.set("x-list-load-time", "" + (endTime - startTime));
    return res;
  },
};

export default function Home(
  { data: { data, latency } }: { data: { data: TodoList; latency: number } },
) {
  return (
    <>
      <Head>
        <title>Daftar Tugas</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <TodoListView initialData={data} latency={latency} />
      </div>
    </>
  );
}
