import { ThemeChanger } from "../../islands/ThemeChanger.tsx";
import LoginModal from "../LoginModal.tsx"; // Import komponen LoginModal
import { useEffect, useState } from "preact/hooks";

interface UserProfile {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
}

export default function NavBar() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
                <div className="navbar bg-base-100 shadow-lg">
                    <div className="flex-1">
                        <a href="/" className="btn btn-ghost normal-case text-xl">
                            mini-webapp
                        </a>
                    </div>
                    {isLoading ? (
                        <div>Loading...</div>
                    ) : profile ? (
                        <div className="dropdown dropdown-end">
                            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                                <div className="w-10 rounded-full">
                                    <img src={profile.picture} alt={profile.name} />
                                </div>
                            </label>
                            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                <li><a href="/profile">Profile</a></li>
                                <li><a href="/signout?success_url=/">Logout</a></li>
                            </ul>
                        </div>
                    ) : (
                        <LoginModal />
                    )}
                    <div className="flex-none lg:hidden">
                        <label htmlFor="my-drawer-4" className="btn btn-square btn-ghost" aria-label="Open Menu">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        </label>
                    </div>
                    <div className="flex-none hidden lg:flex">
                        <ul className="menu menu-horizontal px-1 space-x-4 items-center">
                            <ThemeChanger />
                        </ul>
                    </div>
                </div>
            </div>
            <div className="drawer-side">
                <label htmlFor="my-drawer-4" aria-label="Close Sidebar" className="drawer-overlay"></label>
                <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content space-y-2">
                    <div className="ml-2 py-2">
                        <ThemeChanger />
                    </div>
                </ul>
            </div>
        </div>
    );
}
