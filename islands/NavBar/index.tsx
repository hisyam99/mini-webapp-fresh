import { ThemeChanger } from "../../islands/ThemeChanger.tsx";
import LoginModal from "../LoginModal.tsx";
import { useEffect, useState } from "preact/hooks";

// Interface untuk tipe data profil pengguna
interface UserProfile {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
}

// Komponen NavBar untuk menampilkan bilah navigasi
export default function NavBar() {
    // Status profil pengguna dan status loading
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Mengambil data profil pengguna dari API saat komponen dimuat
    useEffect(() => {
        setIsLoading(true);
        fetch("/api/profile")
            .then((res) => res.json())
            .then((data: UserProfile) => setProfile(data))
            .catch((err) => console.error("Error fetching profile:", err))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="drawer drawer-end z-10">
            {/* Checkbox untuk mengendalikan sidebar drawer */}
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />

            <div className="drawer-content">
                {/* Konten bilah navigasi */}
                <div className="navbar bg-base-100 shadow-lg">
                    <div className="flex-1">
                        {/* Logo atau nama aplikasi yang dapat diklik untuk kembali ke beranda */}
                        <a
                            href="/"
                            className="btn btn-ghost normal-case text-xl"
                        >
                            mini-webapp
                        </a>
                    </div>

                    {/* Bagian untuk menampilkan informasi pengguna atau tombol login */}
                    {isLoading
                        ? (
                            <div>Loading...</div> // Menampilkan pesan saat data sedang dimuat
                        )
                        : profile
                        ? (
                            // Menampilkan avatar pengguna jika profil berhasil diambil
                            <div className="dropdown dropdown-end">
                                <label
                                    tabIndex={0}
                                    className="btn btn-ghost btn-circle avatar"
                                >
                                    <div className="w-10 rounded-full">
                                        <img
                                            src={profile.picture}
                                            alt={profile.name}
                                        />
                                    </div>
                                </label>
                                <ul
                                    tabIndex={0}
                                    className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                                >
                                    {/* Menu dropdown untuk profil pengguna dan logout */}
                                    <li>
                                        <a href="/profile">Profile</a>
                                    </li>
                                    <li>
                                        <a href="/signout?success_url=/">
                                            Logout
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        )
                        : (
                            <LoginModal /> // Menampilkan modal login jika profil tidak ada
                        )}

                    {/* Tombol untuk membuka sidebar pada layar kecil */}
                    <div className="flex-none lg:hidden">
                        <label
                            htmlFor="my-drawer-4"
                            className="btn btn-square btn-ghost"
                            aria-label="Open Menu"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16m-7 6h7"
                                />
                            </svg>
                        </label>
                    </div>

                    {/* Tema changer yang hanya ditampilkan pada layar besar */}
                    <div className="flex-none hidden lg:flex">
                        <ul className="menu menu-horizontal px-1 space-x-4 items-center">
                            <ThemeChanger />
                        </ul>
                    </div>
                </div>
            </div>

            {/* Sidebar drawer */}
            <div className="drawer-side">
                <label
                    htmlFor="my-drawer-4"
                    aria-label="Close Sidebar"
                    className="drawer-overlay"
                >
                </label>
                <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content space-y-2">
                    <div className="ml-2 py-2">
                        <ThemeChanger />
                    </div>
                </ul>
            </div>
        </div>
    );
}
