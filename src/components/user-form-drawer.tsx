import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useUsersStore } from "@/stores/users-store";
import type { AppUser, UserRole, UserStatus } from "@/stores/users-store";
import { userFormSchema } from "@/lib/validators";

type UserFormDrawerProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** When set, the drawer edits this user instead of creating one. */
	user?: AppUser | null;
};

type FieldErrors = Partial<Record<"name" | "email", string>>;

export function UserFormDrawer({ open, onOpenChange, user }: UserFormDrawerProps) {
	const addUser = useUsersStore((state) => state.addUser);
	const updateUser = useUsersStore((state) => state.updateUser);

	const isEdit = Boolean(user);

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<UserRole>("Member");
	const [status, setStatus] = useState<UserStatus>("Invited");
	const [errors, setErrors] = useState<FieldErrors>({});

	// Fresh (or prefilled) form every time the drawer opens.
	useEffect(() => {
		if (open) {
			setName(user?.name ?? "");
			setEmail(user?.email ?? "");
			setRole(user?.role ?? "Member");
			setStatus(user?.status ?? "Invited");
			setErrors({});
		}
	}, [open, user]);

	const handleSave = (event: FormEvent) => {
		event.preventDefault();

		const parsed = userFormSchema.safeParse({ name, email, role, status });
		if (!parsed.success) {
			const flattened = parsed.error.flatten().fieldErrors;
			setErrors({
				name: flattened.name?.[0],
				email: flattened.email?.[0],
			});
			toast.error("Please fix the highlighted fields.", {
				description: Object.values(flattened).flat()[0],
			});
			return;
		}

		setErrors({});
		const values = parsed.data;

		if (user) {
			updateUser(user.id, values);
			toast.success("Changes saved", {
				description: `${values.name}'s account was updated.`,
			});
		} else {
			addUser(values);
			toast.success("User created", {
				description: `An invite was sent to ${values.email}.`,
			});
		}
		onOpenChange(false);
	};

	return (
		<Sheet onOpenChange={onOpenChange} open={open}>
			<SheetContent side="right">
				<SheetHeader className="select-none border-b">
					<SheetTitle>{isEdit ? "Edit user" : "New user"}</SheetTitle>
					<SheetDescription>
						{isEdit
							? `Update ${user?.name.split(" ")[0]}'s account details.`
							: "Create an account and invite a teammate to the workspace."}
					</SheetDescription>
				</SheetHeader>
				<form
					className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
					id="user-form"
					noValidate
					onSubmit={handleSave}
				>
					<div className="space-y-2">
						<Label htmlFor="user-form-name">Full name</Label>
						<Input
							aria-invalid={Boolean(errors.name)}
							autoComplete="name"
							id="user-form-name"
							onChange={(event) => setName(event.target.value)}
							placeholder="Jane Cooper"
							value={name}
						/>
						{errors.name && (
							<p className="text-destructive text-xs">{errors.name}</p>
						)}
					</div>
					<div className="space-y-2">
						<Label htmlFor="user-form-email">Email</Label>
						<Input
							aria-invalid={Boolean(errors.email)}
							autoComplete="email"
							id="user-form-email"
							onChange={(event) => setEmail(event.target.value)}
							placeholder="jane@company.com"
							type="email"
							value={email}
						/>
						{errors.email && (
							<p className="text-destructive text-xs">{errors.email}</p>
						)}
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="user-form-role">Role</Label>
							<Select
								onValueChange={(value) => setRole(value as UserRole)}
								value={role}
							>
								<SelectTrigger className="w-full" id="user-form-role">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Admin">Admin</SelectItem>
									<SelectItem value="Member">Member</SelectItem>
									<SelectItem value="Viewer">Viewer</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="user-form-status">Status</Label>
							<Select
								onValueChange={(value) => setStatus(value as UserStatus)}
								value={status}
							>
								<SelectTrigger className="w-full" id="user-form-status">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Invited">Invited</SelectItem>
									<SelectItem value="Active">Active</SelectItem>
									<SelectItem value="Suspended">Suspended</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</form>
				<SheetFooter className="flex-row items-center justify-end border-t">
					<Button onClick={() => onOpenChange(false)} size="sm" type="button" variant="ghost">
						Cancel
					</Button>
					<Button form="user-form" size="sm" type="submit">
						{isEdit ? "Save changes" : "Create user"}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
