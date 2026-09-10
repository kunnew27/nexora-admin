import { create } from "zustand";

export type UserRole = "Admin" | "Member" | "Viewer";
export type UserStatus = "Active" | "Invited" | "Suspended";

export type AppUser = {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	status: UserStatus;
	createdAt: string; // ISO date
};

type UsersState = {
	users: AppUser[];
	addUser: (user: Omit<AppUser, "id" | "createdAt">) => AppUser;
	updateUser: (id: string, updates: Partial<Omit<AppUser, "id">>) => void;
	deleteUser: (id: string) => void;
};

const seedUsers: AppUser[] = [
	{ id: "u-01", name: "Alex Morgan", email: "alex@company.com", role: "Admin", status: "Active", createdAt: "2025-11-02" },
	{ id: "u-02", name: "Maya Chen", email: "maya.chen@company.com", role: "Member", status: "Active", createdAt: "2025-12-14" },
	{ id: "u-03", name: "Diego Ramirez", email: "diego.r@company.com", role: "Member", status: "Active", createdAt: "2026-01-08" },
	{ id: "u-04", name: "Sara Lindqvist", email: "sara.l@company.com", role: "Viewer", status: "Invited", createdAt: "2026-02-19" },
	{ id: "u-05", name: "Tom Okafor", email: "tom.okafor@company.com", role: "Member", status: "Suspended", createdAt: "2026-01-27" },
	{ id: "u-06", name: "Priya Nair", email: "priya.nair@company.com", role: "Admin", status: "Active", createdAt: "2025-10-30" },
	{ id: "u-07", name: "Jonas Weber", email: "jonas.w@company.com", role: "Viewer", status: "Active", createdAt: "2026-03-05" },
	{ id: "u-08", name: "Hana Sato", email: "hana.sato@company.com", role: "Member", status: "Invited", createdAt: "2026-03-22" },
	{ id: "u-09", name: "Liam Dubois", email: "liam.dubois@company.com", role: "Member", status: "Active", createdAt: "2026-04-11" },
	{ id: "u-10", name: "Emma Rossi", email: "emma.rossi@company.com", role: "Viewer", status: "Suspended", createdAt: "2026-04-28" },
	{ id: "u-11", name: "Noah Ahmed", email: "noah.ahmed@company.com", role: "Member", status: "Active", createdAt: "2026-05-16" },
	{ id: "u-12", name: "Olga Petrova", email: "olga.p@company.com", role: "Admin", status: "Active", createdAt: "2026-06-01" },
];

export const useUsersStore = create<UsersState>((set) => ({
	users: seedUsers,
	addUser: (user) => {
		const created: AppUser = {
			...user,
			id: `u-${crypto.randomUUID().slice(0, 8)}`,
			createdAt: new Date().toISOString().slice(0, 10),
		};
		set((state) => ({ users: [created, ...state.users] }));
		return created;
	},
	updateUser: (id, updates) =>
		set((state) => ({
			users: state.users.map((user) =>
				user.id === id ? { ...user, ...updates } : user
			),
		})),
	deleteUser: (id) =>
		set((state) => ({ users: state.users.filter((user) => user.id !== id) })),
}));
