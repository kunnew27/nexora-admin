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
import { TriangleAlertIcon } from "lucide-react";

/** Confirmation dialog for deleting finance documents. */
export function DeleteConfirmDialog({
	description,
	onConfirm,
	onOpenChange,
	open,
	title,
}: {
	description: string;
	onConfirm: () => void;
	onOpenChange: (open: boolean) => void;
	open: boolean;
	title: string;
}) {
	return (
		<AlertDialog onOpenChange={onOpenChange} open={open}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogMedia className="bg-destructive/10 text-rose-500">
						<TriangleAlertIcon />
					</AlertDialogMedia>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						className="bg-rose-600 text-white hover:bg-rose-600/90"
						onClick={onConfirm}
					>
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
