import { z } from "zod";
import { encodeBase58 } from "https://deno.land/std@0.224.0/encoding/base58.ts";

// Membuka koneksi ke database KV Deno.
export const db = await Deno.openKv();

// Interface untuk TodoList yang mendefinisikan struktur dari sebuah daftar tugas.
export interface TodoList {
  items: TodoListItem[];
  isPublic: boolean;
  ownerId: string;
}

// Interface untuk TodoListItem yang mendefinisikan struktur dari sebuah item tugas.
export interface TodoListItem {
  id?: string;
  versionstamp?: string;
  text: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

// Skema validasi input menggunakan Zod.
export const inputSchema = z.array(z.object({
  id: z.string(),
  text: z.string().nullable(),
  completed: z.boolean(),
}));

// Tipe data yang dihasilkan dari skema validasi input.
export type InputSchema = z.infer<typeof inputSchema>;

// Fungsi untuk memuat daftar tugas berdasarkan ID, konsistensi, dan ID pengguna.
export async function loadList(
  id: string,
  consistency: "strong" | "eventual",
  userId: string,
): Promise<TodoList | null> {
  const listInfo = await db.get<{ isPublic: boolean; ownerId: string }>([
    "listInfo",
    id,
  ]);

  // Mengembalikan null jika daftar tidak ditemukan atau pengguna tidak memiliki akses.
  if (!listInfo.value) {
    return null;
  }

  if (!listInfo.value.isPublic && listInfo.value.ownerId !== userId) {
    return null;
  }

  const out: TodoList = {
    items: [],
    isPublic: listInfo.value.isPublic,
    ownerId: listInfo.value.ownerId,
  };

  // Mengambil item dari daftar berdasarkan ID dengan konsistensi yang ditentukan.
  const it = db.list({ prefix: ["list", id] }, {
    reverse: true,
    consistency,
  });

  for await (const entry of it) {
    const item = entry.value as TodoListItem;
    item.id = entry.key[entry.key.length - 1] as string;
    item.versionstamp = entry.versionstamp!;
    out.items.push(item);
  }

  return out;
}

// Fungsi untuk menulis item ke dalam daftar berdasarkan ID daftar dan input yang diberikan.
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
      // Menghapus item jika teksnya null.
      op.delete(["list", listId, input.id]);
    } else {
      const current = currentEntries[i].value as TodoListItem | null;
      const now = Date.now();
      const createdAt = current?.createdAt ?? now;

      // Menambahkan atau memperbarui item di dalam daftar.
      const item: TodoListItem = {
        text: input.text,
        completed: input.completed,
        createdAt,
        updatedAt: now,
      };
      op.set(["list", listId, input.id], item);
    }
  });

  // Menandai daftar sebagai diperbarui.
  op.set(["list_updated", listId], true);
  await op.commit();
}

// Fungsi untuk mendapatkan daftar-daftar tugas milik pengguna berdasarkan ID pengguna.
export async function getUserLists(
  userId: string,
): Promise<{ id: string; createdAt: number; isPublic: boolean }[]> {
  const lists = [];
  const it = db.list({ prefix: ["userLists", userId] });
  for await (const entry of it) {
    if (
      typeof entry.value === "object" && entry.value !== null &&
      "createdAt" in entry.value && "isPublic" in entry.value
    ) {
      lists.push({
        id: entry.key[2] as string,
        createdAt: entry.value.createdAt as number,
        isPublic: entry.value.isPublic as boolean,
      });
    }
  }
  return lists.sort((a, b) => b.createdAt - a.createdAt);
}

// Fungsi untuk membuat daftar tugas baru untuk pengguna yang diberikan ID pemilik.
export async function createList(ownerId: string): Promise<string> {
  const listId = encodeBase58(crypto.getRandomValues(new Uint8Array(8)));
  const now = Date.now();
  await db.atomic()
    .set(["listInfo", listId], { isPublic: false, ownerId, createdAt: now })
    .set(["userLists", ownerId, listId], { createdAt: now, isPublic: false })
    .commit();
  return listId;
}

// Fungsi untuk mengubah status privasi dari daftar tugas berdasarkan ID daftar dan ID pengguna.
export async function toggleListPrivacy(
  listId: string,
  userId: string,
): Promise<boolean> {
  const listInfo = await db.get<
    { isPublic: boolean; ownerId: string; createdAt: number }
  >(["listInfo", listId]);

  if (!listInfo.value || listInfo.value.ownerId !== userId) {
    return false;
  }

  const newIsPublic = !listInfo.value.isPublic;
  await db.atomic()
    .set(["listInfo", listId], { ...listInfo.value, isPublic: newIsPublic })
    .set(["userLists", userId, listId], {
      createdAt: listInfo.value.createdAt,
      isPublic: newIsPublic,
    })
    .commit();
  return true;
}
