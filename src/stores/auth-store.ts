import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
	name: string;
	email: string;
	avatar?: string;
};

type AuthState = {
	user: User | null;
	isAuthenticated: boolean;
	signIn: (user: User) => void;
	updateUser: (updates: Partial<User>) => void;
	signOut: () => void;
};

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			isAuthenticated: false,
			signIn: (user) => set({ user, isAuthenticated: true }),
			updateUser: (updates) =>
				set((state) => ({
					user: state.user ? { ...state.user, ...updates } : null,
				})),
			signOut: () => set({ user: null, isAuthenticated: false }),
		}),
		{ name: "auth-storage" }
	)
);
