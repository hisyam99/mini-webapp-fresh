import { useEffect, useState } from "preact/hooks";
import { themeChange } from "theme-change";

export function ThemeChanger() {
    const themeValues: string[] = [
        "light",
        "dark",
        "cupcake",
        "bumblebee",
        "emerald",
        "corporate",
        "synthwave",
        "retro",
        "cyberpunk",
        "valentine",
        "halloween",
        "garden",
        "forest",
        "aqua",
        "lofi",
        "pastel",
        "fantasy",
        "wireframe",
        "black",
        "luxury",
        "dracula",
        "cmyk",
        "autumn",
        "business",
        "acid",
        "lemonade",
        "night",
        "coffee",
        "winter",
        "dim",
        "nord",
        "sunset",
    ];

    const themeFromLocalStorage = localStorage.getItem("theme") || "auto";
    const [theme, setTheme] = useState<string>(themeFromLocalStorage);

    const handleChangeTheme = (event: Event) => {
        const target = event.target as HTMLSelectElement;
        const newTheme = target.value;
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
    };

    useEffect(() => {
        themeChange(false);
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    return (
        <div>
            <select
                className="select select-primary select-sm"
                value={theme}
                onChange={handleChangeTheme}
                data-choose-theme
            >
                <option disabled>Pilih tema</option>
                <option value="auto" className="text-primary">Sistem</option>
                {themeValues.map((value) => (
                    <option
                        key={value.toLowerCase()}
                        value={value.toLowerCase()}
                    >
                        {value}
                    </option>
                ))}
            </select>
        </div>
    );
}
