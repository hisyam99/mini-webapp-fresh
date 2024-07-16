import { useEffect, useState } from "preact/hooks";

interface UserProfile {
    name?: string;
    email?: string;
    picture?: string;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/profile")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch profile");
                }
                return response.json();
            })
            .then((data) => setProfile(data))
            .catch((error) => setError(error.message));
    }, []);

    if (error) {
        return (
            <div class="flex items-center justify-center h-screen">
                <div class="text-red-500">Error: {error}</div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div class="flex items-center justify-center h-screen">
                <div class="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div class="flex items-center justify-center h-screen">
            <div class="card w-96 bg-base-100 shadow-xl">
                <figure>
                    {profile.picture && (
                        <img
                            src={profile.picture}
                            alt="User Profile"
                            class="w-24 h-24 rounded-full"
                        />
                    )}
                </figure>
                <div class="card-body">
                    <h2 class="card-title">{profile.name}</h2>
                    <p>{profile.email}</p>
                </div>
            </div>
        </div>
    );
}
