import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from "@/components/ui/command";
import { navLinks } from "@/components/app-shared";
import { useCommandPaletteStore } from "@/stores/command-palette-store";
import { useAuthStore } from "@/stores/auth-store";
import { CreditCardIcon, LogOutIcon, UserRoundIcon } from "lucide-react";

export function CommandPalette() {
	const { open, setOpen } = useCommandPaletteStore();
	const navigate = useNavigate();
	const signOut = useAuthStore((state) => state.signOut);

	// Global ⌘K / Ctrl+K shortcut.
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				setOpen(!open);
			}
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [open, setOpen]);

	const run = (action: () => void) => {
		setOpen(false);
		action();
	};

	const shortcuts = new Map(
		navLinks.map((item, index) => [item.url, String(index + 1)])
	);

	return (
		<CommandDialog
			open={open}
			onOpenChange={setOpen}
			showCloseButton={false}
			className="sm:max-w-lg"
		>
			{/* Frosted-glass palette: translucent surface + backdrop blur. */}
			<Command className="bg-popover/75 shadow-none! backdrop-blur-xl">
				<CommandInput placeholder="Type a command or search…" />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="Navigation">
						{navLinks.map((item) => (
							<CommandItem
								key={item.url}
								value={item.title}
								onSelect={() => run(() => navigate(item.url))}
							>
								{item.icon}
								<span>{item.title}</span>
								<CommandShortcut>
									{shortcuts.get(item.url)}
								</CommandShortcut>
							</CommandItem>
						))}
					</CommandGroup>
					<CommandSeparator />
					<CommandGroup heading="Account">
						<CommandItem
							value="Profile"
							onSelect={() => run(() => navigate("/settings"))}
						>
							<UserRoundIcon />
							<span>Profile</span>
						</CommandItem>
						<CommandItem
							value="Plan and Billing"
							onSelect={() => run(() => navigate("/billing"))}
						>
							<CreditCardIcon />
							<span>Plan &amp; Billing</span>
						</CommandItem>
						<CommandItem
							value="Log out"
							onSelect={() => run(() => {
								signOut();
								navigate("/login");
							})}
						>
							<LogOutIcon />
							<span>Log out</span>
						</CommandItem>
					</CommandGroup>
				</CommandList>
			</Command>
		</CommandDialog>
	);
}
