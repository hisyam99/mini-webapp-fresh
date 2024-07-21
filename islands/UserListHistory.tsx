import { useState } from "preact/hooks";

// Interface ListItem mendefinisikan struktur objek list dengan tiga properti: id, createdAt, dan isPublic.
interface ListItem {
    id: string;
    createdAt: number;
    isPublic: boolean;
}

// Komponen UserListHistory menerima dua properti: lists (array dari ListItem) dan profile (objek yang mungkin memiliki properti name).
export default function UserListHistory(
    { lists, profile }: { lists: ListItem[]; profile: { name?: string } },
) {
    // Menggunakan hook useState untuk mengatur state currentPage dengan nilai awal 1.
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Menentukan jumlah item per halaman.

    // Memotong daftar list berdasarkan halaman saat ini.
    const paginatedLists = lists.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );
    // Menghitung total halaman yang dibutuhkan.
    const totalPages = Math.ceil(lists.length / itemsPerPage);

    return (
        <div class="bg-base-100 shadow-xl rounded-lg p-6">
            {/* Menampilkan salam selamat datang dengan nama profil atau "User" jika nama tidak ada. */}
            <h2 class="text-2xl font-bold mb-4">
                Welcome, {profile.name || "User"}!
            </h2>
            <p class="mb-4">Here's a history of your todo lists:</p>
            <ul class="space-y-4">
                {/* Memetakan setiap item dalam paginatedLists ke dalam elemen <li>. */}
                {paginatedLists.map((list) => (
                    <li key={list.id} class="border-b pb-2">
                        <div class="flex justify-between items-center">
                            <a
                                href={`/dashboard/${list.id}`}
                                class="text-primary hover:underline"
                            >
                                List {list.id}
                            </a>
                            <span
                                class={`badge ${
                                    list.isPublic
                                        ? "badge-success"
                                        : "badge-error"
                                }`}
                            >
                                {list.isPublic ? "Public" : "Private"}
                            </span>
                        </div>
                        <p class="text-sm text-gray-500">
                            Created on:{" "}
                            {new Date(list.createdAt).toLocaleString()}
                        </p>
                    </li>
                ))}
            </ul>
            {/* Menampilkan navigasi halaman jika total halaman lebih dari 1. */}
            {totalPages > 1 && (
                <div class="flex justify-center mt-6 space-x-2">
                    {/* Tombol untuk halaman sebelumnya */}
                    <button
                        onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        class="btn btn-primary"
                    >
                        Previous
                    </button>
                    {/* Menampilkan informasi halaman saat ini */}
                    <span class="px-4 py-2">
                        Page {currentPage} of {totalPages}
                    </span>
                    {/* Tombol untuk halaman berikutnya */}
                    <button
                        onClick={() =>
                            setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages)
                            )}
                        disabled={currentPage === totalPages}
                        class="btn btn-primary"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
