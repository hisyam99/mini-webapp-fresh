import { useEffect, useState } from "preact/hooks";

// Interface untuk mendefinisikan struktur profil pengguna
interface UserProfile {
    name?: string; // Nama pengguna
    email?: string; // Email pengguna
    picture?: string; // URL gambar profil pengguna
}

// Komponen halaman profil pengguna
export default function ProfilePage() {
    // State untuk menyimpan data profil pengguna
    const [profile, setProfile] = useState<UserProfile | null>(null);
    // State untuk menyimpan pesan kesalahan jika ada
    const [error, setError] = useState<string | null>(null);

    // useEffect untuk mengambil data profil dari API ketika komponen dimuat
    useEffect(() => {
        fetch("/api/profile") // Mengambil data profil dari endpoint API
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch profile"); // Menangani kesalahan jika respons tidak OK
                }
                return response.json(); // Mengonversi respons menjadi format JSON
            })
            .then((data) => setProfile(data)) // Menyimpan data profil ke state
            .catch((error) => setError(error.message)); // Menyimpan pesan kesalahan ke state
    }, []); // Efek ini hanya dijalankan sekali saat komponen dimuat

    // Menampilkan pesan kesalahan jika ada
    if (error) {
        return (
            <div class="flex items-center justify-center h-screen">
                <div class="text-red-500">Error: {error}</div>
            </div>
        );
    }

    // Menampilkan pesan "Loading..." jika data profil belum tersedia
    if (!profile) {
        return (
            <div class="flex items-center justify-center h-screen">
                <div class="text-gray-500">Loading...</div>
            </div>
        );
    }

    // Menampilkan data profil pengguna jika berhasil diambil
    return (
        <div class="flex items-center justify-center h-screen">
            <div class="card w-96 bg-base-100 shadow-xl">
                <figure>
                    {profile.picture && (
                        <img
                            src={profile.picture} // URL gambar profil pengguna
                            alt="User Profile" // Alt text untuk gambar
                            class="w-24 h-24 rounded-full" // Gaya gambar profil
                        />
                    )}
                </figure>
                <div class="card-body">
                    <h2 class="card-title">{profile.name}</h2>{" "}
                    {/* Nama pengguna */}
                    <p>{profile.email}</p> {/* Email pengguna */}
                </div>
            </div>
        </div>
    );
}
