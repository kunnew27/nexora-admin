import { useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import type { DataTableColumn } from "@/components/data-table";
import { UserFormDrawer } from "@/components/user-form-drawer";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUsersStore } from "@/stores/users-store";
import type { AppUser, UserStatus } from "@/stores/users-store";
import { PencilIcon, PlusIcon, Trash2Icon, TriangleAlertIcon } from "lucide-react";

const statusVariant: Record<UserStatus, "secondary" | "outline" | "destructive"> = {
	Active: "secondary",
	Invited: "outline",
	Suspended: "destructive",
};

export default function UsersPage() {
	const users = useUsersStore((state) => state.users);
	const deleteUser = useUsersStore((state) => state.deleteUser);

	const [drawerOpen, setDrawerOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<AppUser | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);

	const openCreate = () => {
		setEditingUser(null);
		setDrawerOpen(true);
	};

	const openEdit = (user: AppUser) => {
		setEditingUser(user);
		setDrawerOpen(true);
	};

	const confirmDelete = () => {
		if (!deleteTarget) return;
		deleteUser(deleteTarget.id);
		toast.success("User deleted", {
			description: `${deleteTarget.name} no longer has access to the workspace.`,
		});
		setDeleteTarget(null);
	};

	const columns: DataTableColumn<AppUser>[] = [
		{
			key: "name",
			header: "User",
			sortable: true,
			cell: (user) => (
				<div className="flex items-center gap-3">
					<Avatar className="size-7">
						{user.name === "Alex Morgan" && (
							<AvatarImage src="https://github.com/shabanhr.png" alt={user.name} />
						)}
						<AvatarFallback className="text-xs">
							{user.name.charAt(0)}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0">
						<p className="truncate font-medium">{user.name}</p>
						<p className="truncate text-muted-foreground text-xs">{user.email}</p>
					</div>
				</div>
			),
		},
		{
			key: "role",
			header: "Role",
			sortable: true,
			className: "w-32",
			cell: (user) => <Badge variant="outline">{user.role}</Badge>,
		},
		{
			key: "status",
			header: "Status",
			sortable: true,
			className: "w-32",
			cell: (user) => <Badge variant={statusVariant[user.status]}>{user.status}</Badge>,
		},
		{
			key: "createdAt",
			header: "Joined",
			sortable: true,
			className: "w-32",
			cell: (user) => (
				<span className="text-muted-foreground tabular-nums">{user.createdAt}</span>
			),
		},
		{
			key: "actions",
			header: "Actions",
			className: "w-24 text-right",
			cell: (user) => (
				<div className="flex items-center justify-end gap-1">
					<Button
						aria-label={`Edit ${user.name}`}
						className="text-muted-foreground hover:text-foreground"
						onClick={() => openEdit(user)}
						size="icon-xs"
						variant="ghost"
					>
						<PencilIcon />
					</Button>
					<Button
						aria-label={`Delete ${user.name}`}
						className="text-muted-foreground hover:text-destructive"
						onClick={() => setDeleteTarget(user)}
						size="icon-xs"
						variant="ghost"
					>
						<Trash2Icon />
					</Button>
				</div>
			),
		},
	];

	return (
		<>
			<DataTable
				columns={columns}
				data={users}
				emptyMessage="No users found."
				searchPlaceholder="Search users…"
				searchValue={(user) => `${user.name} ${user.email} ${user.role} ${user.status}`}
				className="h-full"
				toolbar={
					<Button onClick={openCreate} size="sm">
						<PlusIcon data-icon="inline-start" />
						Add user
					</Button>
				}
			/>
			<UserFormDrawer onOpenChange={setDrawerOpen} open={drawerOpen} user={editingUser} />
			<AlertDialog
				onOpenChange={(open) => !open && setDeleteTarget(null)}
				open={deleteTarget !== null}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogMedia className="bg-destructive/10 text-destructive">
							<TriangleAlertIcon />
						</AlertDialogMedia>
						<AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
						<AlertDialogDescription>
							This permanently removes the account and revokes workspace
							access. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-white hover:bg-destructive/90"
							onClick={confirmDelete}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
