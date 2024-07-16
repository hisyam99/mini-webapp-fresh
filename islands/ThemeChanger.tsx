import { useEffect, useState } from "preact/hooks";
import { themeChange } from "theme-change";

interface ThemeOption {
    value: string;
    label: string;
}

export function ThemeChanger() {
    const themeValues: ThemeOption[] = [
        { value: "auto", label: "System Theme" },
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
        { value: "cupcake", label: "Cupcake" },
        { value: "bumblebee", label: "Bumblebee" },
        { value: "emerald", label: "Emerald" },
        { value: "corporate", label: "Corporate" },
        { value: "synthwave", label: "Synthwave" },
        { value: "retro", label: "Retro" },
        { value: "cyberpunk", label: "Cyberpunk" },
        { value: "valentine", label: "Valentine" },
        { value: "halloween", label: "Halloween" },
        { value: "garden", label: "Garden" },
        { value: "forest", label: "Forest" },
        { value: "aqua", label: "Aqua" },
        { value: "lofi", label: "Lo-Fi" },
        { value: "pastel", label: "Pastel" },
        { value: "fantasy", label: "Fantasy" },
        { value: "wireframe", label: "Wireframe" },
        { value: "black", label: "Black" },
        { value: "luxury", label: "Luxury" },
        { value: "dracula", label: "Dracula" },
        { value: "cmyk", label: "CMYK" },
        { value: "autumn", label: "Autumn" },
        { value: "business", label: "Business" },
        { value: "acid", label: "Acid" },
        { value: "lemonade", label: "Lemonade" },
        { value: "night", label: "Night" },
        { value: "coffee", label: "Coffee" },
        { value: "winter", label: "Winter" },
        { value: "dim", label: "Dim" },
        { value: "nord", label: "Nord" },
        { value: "sunset", label: "Sunset" },
    ];

    const themeFromLocalStorage = localStorage.getItem("theme") || "auto";
    const [theme, setTheme] = useState<string>(themeFromLocalStorage);

    const handleThemeChange = (newTheme: string): void => {
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
    };

    useEffect(() => {
        themeChange(false);
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    return (
        <div class="dropdown dropdown-end dropdown-bottom">
            <div tabIndex={0} role="button" class="btn btn-ghost">
                <div class="flex items-center space-x-2">
                    <p>Theme</p>
                    <svg
                        width="12px"
                        height="12px"
                        class="inline-block fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 2048 2048"
                    >
                        <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z">
                        </path>
                    </svg>
                </div>
            </div>
            <ul
                tabIndex={0}
                class="dropdown-content z-[1] max-h-60 w-52 overflow-y-auto rounded-box bg-base-300 p-2 shadow-2xl"
            >
                {themeValues.map((themeOption) => (
                    <li key={themeOption.value}>
                        <input
                            type="radio"
                            name="theme-dropdown"
                            class="theme-controller btn btn-ghost btn-sm btn-block justify-start"
                            aria-label={themeOption.label}
                            value={themeOption.value}
                            onChange={() =>
                                handleThemeChange(themeOption.value)}
                            checked={theme === themeOption.value}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}
