import type { FormEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";

/** Right-side sheet shell shared by every finance form (header, scrollable form, single-row footer). */
export function FinanceSheet({
	children,
	description,
	formId,
	onOpenChange,
	onSubmit,
	open,
	submitLabel,
	title,
}: {
	children: ReactNode;
	description: string;
	formId: string;
	onOpenChange: (open: boolean) => void;
	onSubmit: (event: FormEvent) => void;
	open: boolean;
	submitLabel: string;
	title: string;
}) {
	return (
		<Sheet onOpenChange={onOpenChange} open={open}>
			<SheetContent side="right">
				<SheetHeader className="select-none border-b">
					<SheetTitle>{title}</SheetTitle>
					<SheetDescription>{description}</SheetDescription>
				</SheetHeader>
				<form
					className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
					id={formId}
					noValidate
					onSubmit={onSubmit}
				>
					{children}
				</form>
				<SheetFooter className="flex-row items-center justify-end border-t">
					<Button onClick={() => onOpenChange(false)} size="sm" type="button" variant="ghost">
						Cancel
					</Button>
					<Button form={formId} size="sm" type="submit">
						{submitLabel}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}

export function FormField({
	children,
	error,
	htmlFor,
	label,
}: {
	children: ReactNode;
	error?: string;
	htmlFor: string;
	label: string;
}) {
	return (
	// flex + gap (not space-y): popover/select triggers mount position:fixed
	// focus guards as direct children while open; margin spacing would give
	// them height and shift the fields below.
	<div className="flex flex-col gap-2">
		<Label htmlFor={htmlFor}>{label}</Label>
		{children}
		{error && <p className="text-destructive text-xs">{error}</p>}
	</div>
	);
}

export function FieldError({ message }: { message?: string }) {
	if (!message) return null;
	return <p className="text-destructive text-xs">{message}</p>;
}
