import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

const media = window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme(theme: Theme) {
	const isDark = theme === "dark" || (theme === "system" && media.matches);
	document.documentElement.classList.toggle("dark", isDark);
}

type ThemeState = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
};

export const useThemeStore = create<ThemeState>()(
	persist(
		(set) => ({
			theme: "system",
			setTheme: (theme) => {
				applyTheme(theme);
				set({ theme });
			},
		}),
		{
			name: "theme",
			onRehydrateStorage: () => (state) => {
				if (state) applyTheme(state.theme);
			},
		}
	)
);

// Follow OS changes while in "system" mode.
media.addEventListener("change", () => applyTheme(useThemeStore.getState().theme));
