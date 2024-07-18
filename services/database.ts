import { TodoList, TodoListItem } from "../shared/api.ts";
import { z } from "zod";

// Membuka koneksi ke database
export const db = await Deno.openKv();

// Mendefinisikan skema input menggunakan zod
export const inputSchema = z.array(z.object({
  id: z.string(),
  text: z.string().nullable(),
  completed: z.boolean(),
}));

// Mendefinisikan tipe dari skema input
export type InputSchema = z.infer<typeof inputSchema>;

// Fungsi untuk memuat daftar to-do berdasarkan ID dan konsistensi
export async function loadList(
  id: string,
  consistency: "strong" | "eventual",
): Promise<TodoList> {
  const out: TodoList = {
    items: [],
  };

  // Mendapatkan iterator dari database
  const it = db.list({ prefix: ["list", id] }, {
    reverse: true,
    consistency,
  });

  // Mengiterasi dan menambahkan item ke daftar keluaran
  for await (const entry of it) {
    const item = entry.value as TodoListItem;
    item.id = entry.key[entry.key.length - 1] as string;
    item.versionstamp = entry.versionstamp!;
    out.items.push(item);
  }

  return out;
}

// Fungsi untuk menulis item ke dalam database
export async function writeItems(
  listId: string,
  inputs: InputSchema,
): Promise<void> {
  const currentEntries = await db.getMany(
    inputs.map((input: InputSchema[number]) => ["list", listId, input.id]),
  );

  const op = db.atomic();

  inputs.forEach((input: InputSchema[number], i: number) => {
    if (input.text === null) {
      op.delete(["list", listId, input.id]);
    } else {
      const current = currentEntries[i].value as TodoListItem | null;
      const now = Date.now();
      const createdAt = current?.createdAt ?? now;

      const item: TodoListItem = {
        text: input.text,
        completed: input.completed,
        createdAt,
        updatedAt: now,
      };
      op.set(["list", listId, input.id], item);
    }
  });

  op.set(["list_updated", listId], true);
  await op.commit();
}
