import { z } from "zod";

export const userFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Name must be at least 2 characters.")
		.max(60, "Name is too long."),
	email: z.string().trim().email("Enter a valid email address."),
	role: z.enum(["Admin", "Member", "Viewer"]),
	status: z.enum(["Invited", "Active", "Suspended"]),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
