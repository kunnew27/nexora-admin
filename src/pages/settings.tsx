import { useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { securityFormSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";
import {
	DEFAULT_RATE_TO_KHR,
	useFinancePrefsStore,
} from "@/stores/finance-prefs-store";
import {
	CURRENCIES,
	type Currency,
	formatMoney,
} from "@/lib/finance";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
	ArrowLeftRightIcon,
	CheckIcon,
	KeyRoundIcon,
	ShieldCheckIcon,
} from "lucide-react";

const tabs = [
	{ id: "profile", label: "Profile" },
	{ id: "security", label: "Security" },
	{ id: "notifications", label: "Notifications" },
	{ id: "exchange-rate", label: "Exchange rate" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function SettingsPage() {
	const [tab, setTab] = useState<TabId>("profile");

	return (
		<div className="flex h-full min-h-0 flex-col">
			<PageHeader
				title="Settings"
				description="Manage your profile, security, notifications, and exchange rate."
			/>

			{/* Tab toolbar below the header */}
			<nav aria-label="Settings sections" className="mt-4 border-b">
				<div className="flex gap-6">
					{tabs.map((item) => (
						<button
							aria-current={tab === item.id ? "page" : undefined}
							className={cn(
								"relative pb-3 text-sm transition-colors",
								tab === item.id
									? "font-medium text-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-foreground"
									: "text-muted-foreground hover:text-foreground"
							)}
							key={item.id}
							onClick={() => setTab(item.id)}
							type="button"
						>
							{item.label}
						</button>
					))}
				</div>
			</nav>

			{/* Negative margin + matching padding keeps the card aligned with the
			    heading above while moving the overflow clip edge off the card border,
			    so the rounded corners don't get cut off. */}
			<div className="-mx-4 min-h-0 flex-1 overflow-y-auto px-4 py-6 md:-mx-6 md:px-6">
				<div className="w-full max-w-2xl space-y-6">
					{tab === "profile" && <ProfileCard />}
					{tab === "security" && <SecurityCard />}
					{tab === "notifications" && <NotificationsPanel />}
					{tab === "exchange-rate" && <ExchangeRateCard />}
				</div>
			</div>
		</div>
	);
}

function ProfileCard() {
	const user = useAuthStore((state) => state.user);
	const updateUser = useAuthStore((state) => state.updateUser);
	const baseCurrency = useFinancePrefsStore((state) => state.baseCurrency);
	const setBaseCurrency = useFinancePrefsStore((state) => state.setBaseCurrency);

	const [name, setName] = useState(user?.name ?? "");
	const [email, setEmail] = useState(user?.email ?? "");
	const [saved, setSaved] = useState(false);

	const handleSave = (event: FormEvent) => {
		event.preventDefault();
		updateUser({ name: name.trim(), email: email.trim() });
		setSaved(true);
		window.setTimeout(() => setSaved(false), 2000);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile</CardTitle>
				<CardDescription>
					This information appears on your profile and invoices.
				</CardDescription>
			</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center gap-4">
						<Avatar className="size-14">
							{user?.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
							<AvatarFallback className="text-lg">
								{(user?.name ?? "U").charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="space-y-1">
							<p className="font-medium text-sm">{user?.name ?? "Guest"}</p>
							<p className="text-muted-foreground text-xs">{user?.email}</p>
						</div>
					</div>
					<Separator />
					<div className="space-y-2">
						<Label htmlFor="settings-base-currency">Base currency</Label>
						<Select
							onValueChange={(value) => setBaseCurrency(value as Currency)}
							value={baseCurrency}
						>
							<SelectTrigger className="w-full" id="settings-base-currency">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{CURRENCIES.map((currency) => (
									<SelectItem key={currency} value={currency}>
										{currency === "USD" ? "$ USD" : "៛ KHR"}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<p className="text-muted-foreground text-xs">
							Applies immediately across the app. Stored amounts are never
							rewritten — only the display changes.
						</p>
					</div>
					<Separator />
				<form id="profile-form" onSubmit={handleSave} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="settings-name">Full name</Label>
						<Input
							id="settings-name"
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder="Your name"
							autoComplete="name"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="settings-email">Email</Label>
						<Input
							id="settings-email"
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							placeholder="your.email@example.com"
							autoComplete="email"
							required
						/>
						<p className="text-muted-foreground text-xs">
							Used for sign-in and account notifications.
						</p>
					</div>
				</form>
			</CardContent>
			<CardFooter className="justify-end gap-2 border-t px-6!">
				<Button size="sm" variant="ghost" type="button" onClick={() => { setName(user?.name ?? ""); setEmail(user?.email ?? ""); }}>
					Reset
				</Button>
				<Button size="sm" type="submit" form="profile-form" disabled={saved}>
					{saved ? (
						<>
							<CheckIcon data-icon="inline-start" />
							Saved
						</>
					) : (
						"Save changes"
					)}
				</Button>
			</CardFooter>
		</Card>
	);
}

function SecurityCard() {
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [twoFactor, setTwoFactor] = useState(false);

	type SecurityField = "currentPassword" | "newPassword" | "confirmPassword";
	const [errors, setErrors] = useState<Partial<Record<SecurityField, string>>>({});

	const handlePasswordChange = (event: FormEvent) => {
		event.preventDefault();

		const parsed = securityFormSchema.safeParse({
			currentPassword,
			newPassword,
			confirmPassword,
		});
		if (!parsed.success) {
			const flattened = parsed.error.flatten().fieldErrors;
			setErrors({
				currentPassword: flattened.currentPassword?.[0],
				newPassword: flattened.newPassword?.[0],
				confirmPassword: flattened.confirmPassword?.[0],
			});
			toast.error("Please fix the highlighted fields.", {
				description: Object.values(flattened).flat()[0],
			});
			return;
		}

		setErrors({});

		// Demo only — replace with a real API call to change the password.
		setCurrentPassword("");
		setNewPassword("");
		setConfirmPassword("");
		toast.success("Password updated", {
			description: "Use your new password the next time you sign in.",
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ShieldCheckIcon className="size-4 text-muted-foreground" />
					Security
				</CardTitle>
				<CardDescription>
					Protect your account with a strong password and two-factor
					authentication.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<form noValidate onSubmit={handlePasswordChange} className="space-y-4">
					<div className="flex items-center gap-2 text-muted-foreground text-sm">
						<KeyRoundIcon className="size-3.5" />
						Change password
					</div>
					<div className="grid gap-4 sm:grid-cols-3">
						<div className="space-y-2">
							<Label htmlFor="settings-current-password">Current</Label>
							<Input
								aria-invalid={Boolean(errors.currentPassword)}
								id="settings-current-password"
								type="password"
								value={currentPassword}
								onChange={(event) => setCurrentPassword(event.target.value)}
								autoComplete="current-password"
								required
							/>
							{errors.currentPassword && (
								<p className="text-destructive text-xs">{errors.currentPassword}</p>
							)}
						</div>
						<div className="space-y-2">
							<Label htmlFor="settings-new-password">New</Label>
							<Input
								aria-invalid={Boolean(errors.newPassword)}
								id="settings-new-password"
								type="password"
								value={newPassword}
								onChange={(event) => setNewPassword(event.target.value)}
								autoComplete="new-password"
								required
							/>
							{errors.newPassword && (
								<p className="text-destructive text-xs">{errors.newPassword}</p>
							)}
						</div>
						<div className="space-y-2">
							<Label htmlFor="settings-confirm-password">Confirm new</Label>
							<Input
								aria-invalid={Boolean(errors.confirmPassword)}
								id="settings-confirm-password"
								type="password"
								value={confirmPassword}
								onChange={(event) => setConfirmPassword(event.target.value)}
								autoComplete="new-password"
								required
							/>
							{errors.confirmPassword && (
								<p className="text-destructive text-xs">{errors.confirmPassword}</p>
							)}
						</div>
					</div>
					<div className="flex justify-end">
						<Button size="sm" type="submit" variant="outline">
							Update password
						</Button>
					</div>
				</form>
				<Separator />
				<div className="flex items-center justify-between gap-4">
					<div className="space-y-1">
						<Label htmlFor="settings-2fa">Two-factor authentication</Label>
						<p className="text-muted-foreground text-xs">
							Require a one-time code from an authenticator app at sign-in.
						</p>
					</div>
					<Switch
						id="settings-2fa"
						checked={twoFactor}
						onCheckedChange={(checked) => setTwoFactor(Boolean(checked))}
					/>
				</div>
			</CardContent>
		</Card>
	);
}

function ExchangeRateCard() {
	const exchangeRate = useFinancePrefsStore((state) => state.exchangeRate);
	const setExchangeRate = useFinancePrefsStore((state) => state.setExchangeRate);

	const [rateInput, setRateInput] = useState(String(exchangeRate));
	const [error, setError] = useState<string>();
	const [saved, setSaved] = useState(false);

	const parsed = Number(rateInput);
	const dirty = Number.isFinite(parsed) && parsed !== exchangeRate;

	const handleSave = (event: FormEvent) => {
		event.preventDefault();
		if (!Number.isFinite(parsed) || parsed < 100 || parsed > 1_000_000) {
			setError("Enter a realistic rate between 100 and 1,000,000 KHR per USD.");
			return;
		}
		setError(undefined);
		setExchangeRate(parsed);
		setSaved(true);
		window.setTimeout(() => setSaved(false), 2000);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ArrowLeftRightIcon className="size-4 text-muted-foreground" />
					Exchange rate
				</CardTitle>
				<CardDescription>
					Snapshot used to convert between USD and KHR. Changing it only affects
					what the UI shows — stored transactions keep their original amounts.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/40 px-4 py-3">
					<span className="text-muted-foreground text-sm">Current rate</span>
					<span className="font-medium text-sm tabular-nums">
						$1 = {formatMoney(exchangeRate, "KHR")}
					</span>
				</div>
				<form noValidate onSubmit={handleSave} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="settings-exchange-rate">KHR per 1 USD</Label>
						<Input
							aria-invalid={Boolean(error)}
							id="settings-exchange-rate"
							inputMode="decimal"
							type="number"
							value={rateInput}
							onChange={(event) => setRateInput(event.target.value)}
							min={100}
							max={1000000}
							step="any"
							required
						/>
						{error && <p className="text-destructive text-xs">{error}</p>}
						<p className="text-muted-foreground text-xs">
							Examples: {formatMoney(10000, "USD")} ≈{" "}
							{formatMoney(10000 * (Number(rateInput) || 0), "KHR")} ·{" "}
							{formatMoney(4100 * 10, "KHR")} ≈{" "}
							{formatMoney(41000 / (Number(rateInput) || 1), "USD")}
						</p>
					</div>
					<div className="flex justify-end gap-2">
						<Button
							disabled={!dirty}
							onClick={() => setRateInput(String(DEFAULT_RATE_TO_KHR))}
							size="sm"
							type="button"
							variant="ghost"
						>
							Reset to demo
						</Button>
						<Button disabled={!dirty || saved} size="sm" type="submit">
							{saved ? (
								<>
									<CheckIcon data-icon="inline-start" />
									Saved
								</>
							) : (
								"Update rate"
							)}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}

function ToggleRow({
	checked,
	description,
	disabled,
	id,
	label,
	onCheckedChange,
}: {
	checked: boolean;
	description: string;
	disabled?: boolean;
	id: string;
	label: string;
	onCheckedChange: (checked: boolean) => void;
}) {
	return (
		<div className="flex items-center justify-between gap-4">
			<div className="space-y-1">
				<Label htmlFor={id} className={cn(disabled && "text-muted-foreground")}>
					{label}
				</Label>
				<p className="text-muted-foreground text-xs">{description}</p>
			</div>
			<Switch
				checked={checked}
				disabled={disabled}
				id={id}
				onCheckedChange={(value) => onCheckedChange(Boolean(value))}
			/>
		</div>
	);
}

function NotificationsPanel() {
	const [preferences, setPreferences] = useState({
		enabled: true,
		email: true,
		push: false,
		mentions: true,
		productUpdates: false,
	});

	const set = (key: keyof typeof preferences) => (checked: boolean) =>
		setPreferences((current) => ({ ...current, [key]: checked }));

	const toggleAll = (checked: boolean) =>
		setPreferences({
			enabled: checked,
			email: checked,
			push: checked,
			mentions: checked,
			productUpdates: checked,
		});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Notifications</CardTitle>
				<CardDescription>
					Choose what you want to be notified about and where.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<ToggleRow
					checked={preferences.enabled}
					description="Master switch for all notification channels."
					id="settings-notif-enabled"
					label="Enable notifications"
					onCheckedChange={toggleAll}
				/>
				<Separator />
				<div
					className={cn(
						"space-y-6 transition-opacity",
						!preferences.enabled && "pointer-events-none opacity-50"
					)}
				>
					<ToggleRow
						checked={preferences.email}
						description="Invoice receipts, team invites, and account alerts."
						disabled={!preferences.enabled}
						id="settings-notif-email"
						label="Email notifications"
						onCheckedChange={set("email")}
					/>
					<ToggleRow
						checked={preferences.push}
						description="Real-time browser notifications while the app is open."
						disabled={!preferences.enabled}
						id="settings-notif-push"
						label="Push notifications"
						onCheckedChange={set("push")}
					/>
					<Separator />
					<ToggleRow
						checked={preferences.mentions}
						description="When someone mentions you or comments on your work."
						disabled={!preferences.enabled}
						id="settings-notif-mentions"
						label="Mentions & comments"
						onCheckedChange={set("mentions")}
					/>
					<ToggleRow
						checked={preferences.productUpdates}
						description="Occasional news about new features and improvements."
						disabled={!preferences.enabled}
						id="settings-notif-product"
						label="Product updates"
						onCheckedChange={set("productUpdates")}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
