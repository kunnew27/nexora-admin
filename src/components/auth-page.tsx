import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "@/components/icons/google-icon";
import { useAuthStore } from "@/stores/auth-store";
import { useNavigate } from "react-router-dom";
import {
	EyeIcon,
	EyeOffIcon,
	LockIcon,
	MailIcon,
	ArrowRightIcon,
} from "lucide-react";

export function AuthPage() {
	const signIn = useAuthStore((state) => state.signIn);
	const navigate = useNavigate();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const handleSignIn = (event?: FormEvent) => {
		event?.preventDefault();
		signIn({
			name: "Alex Morgan",
			email: email.trim() || "alex@example.com",
			avatar: "https://github.com/shabanhr.png",
		});
		navigate("/overview");
	};

	return (
		<main className="relative grid min-h-svh place-items-center overflow-hidden bg-background px-4">
			<LoginBackdrop />

			{/* Editorial accents */}
			<p className="absolute top-8 right-10 hidden text-muted-foreground/60 text-xs lg:block">
				A calmer way to do more.
			</p>
			<div className="absolute top-1/2 left-10 hidden -translate-y-1/2 space-y-2 lg:block">
				{["Ideas", "People", "Progress"].map((word) => (
					<p
						className="text-muted-foreground/60 text-xs tracking-[0.3em]"
						key={word}
					>
						{word}
					</p>
				))}
				<p className="pt-3 text-muted-foreground/40">—</p>
			</div>
			<div className="absolute top-1/2 right-10 hidden -translate-y-1/2 text-right lg:block">
				{["A", "brighter", "workday", "ahead"].map((word) => (
					<p
						className="text-muted-foreground/60 text-xs tracking-[0.3em] uppercase"
						key={word}
					>
						{word}
					</p>
				))}
				<p className="pt-3 text-muted-foreground/40">—</p>
			</div>

			{/* Card */}
			<div className="relative z-10 w-full max-w-md rounded-2xl border bg-card px-8 py-10 shadow-[0_12px_40px_-8px_rgb(15,23,42,0.12)] sm:px-10">
				<div className="flex flex-col items-center space-y-6 text-center">
					<div className="space-y-2">
						<h1 className="font-bold text-3xl tracking-tight">Welcome back</h1>
						<p className="text-muted-foreground text-sm leading-relaxed">
							Sign in to continue to your workspace
							<br className="hidden sm:block" /> and pick up where you left
							off.
						</p>
					</div>
				</div>

				<form onSubmit={handleSignIn} className="mt-8 space-y-5">
					<div className="space-y-2">
						<Label htmlFor="login-email">Email address</Label>
						<div className="relative">
							<MailIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								id="login-email"
								type="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								placeholder="you@company.com"
								autoComplete="email"
								className="h-10 bg-background pl-9"
								required
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="login-password">Password</Label>
						<div className="relative">
							<LockIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								id="login-password"
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								placeholder="Enter your password"
								autoComplete="current-password"
								className="h-10 bg-background pr-10 pl-9"
								required
							/>
							<button
								aria-label={showPassword ? "Hide password" : "Show password"}
								className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
								type="button"
								onClick={() => setShowPassword((value) => !value)}
							>
								{showPassword ? (
									<EyeOffIcon className="size-4" />
								) : (
									<EyeIcon className="size-4" />
								)}
							</button>
						</div>
					</div>

					<div className="flex justify-end">
						<a
							className="text-blue-600 text-sm transition-colors hover:text-blue-700"
							href="#"
							onClick={(event) => event.preventDefault()}
						>
							Forgot password?
						</a>
					</div>

					<Button className="h-10 w-full text-sm" type="submit">
						Sign in
						<ArrowRightIcon data-icon="inline-end" />
					</Button>
				</form>

				<div className="my-6 flex items-center gap-3">
					<span className="h-px flex-1 bg-border" />
					<span className="text-muted-foreground text-xs">Or</span>
					<span className="h-px flex-1 bg-border" />
				</div>

				<Button
					className="h-10 w-full bg-background text-foreground shadow-none"
					variant="outline"
					type="button"
					onClick={() => handleSignIn()}
				>
					<GoogleIcon data-icon="inline-start" />
					Continue with Google
				</Button>

				<p className="mt-8 text-center text-muted-foreground text-sm">
					Don&apos;t have an account?{" "}
					<a
						className="text-blue-600 transition-colors hover:text-blue-700"
						href="#"
						onClick={(event) => event.preventDefault()}
					>
						Create account
					</a>
				</p>
			</div>

			{/* Footer */}
			<footer className="absolute inset-x-0 bottom-0 hidden items-center justify-between px-10 py-6 text-muted-foreground/60 text-xs sm:flex">
				<p>© 2026. All rights reserved.</p>
				<div className="flex items-center gap-6">
					{["Privacy", "Terms", "Support"].map((label) => (
						<a
							className="transition-colors hover:text-foreground"
							href="#"
							key={label}
							onClick={(event) => event.preventDefault()}
						>
							{label}
						</a>
					))}
				</div>
			</footer>
		</main>
	);
}

/** Soft white canvas with pale blue-gray arcs and fine curved line accents. */
function LoginBackdrop() {
	return (
		<div
			aria-hidden
			className="pointer-events-none absolute inset-0 overflow-hidden bg-[#fafbfc]"
		>
			{/* pale filled arcs */}
			<div className="absolute -top-48 -right-40 size-[38rem] rounded-full bg-[#eef1f6]" />
			<div className="absolute -bottom-56 -left-44 size-[40rem] rounded-full bg-[#eef1f6]" />
			<div className="absolute top-[55%] -left-24 size-[22rem] rounded-full bg-[#f1f4f8]" />

			{/* fine curved line accents */}
			<svg
				className="absolute inset-0 size-full"
				fill="none"
				viewBox="0 0 1440 900"
				preserveAspectRatio="xMidYMid slice"
			>
				<circle
					cx="1290"
					cy="180"
					r="420"
					stroke="currentColor"
					className="text-slate-300/50"
					strokeWidth="1"
				/>
				<circle
					cx="1290"
					cy="180"
					r="540"
					stroke="currentColor"
					className="text-slate-300/35"
					strokeWidth="1"
				/>
				<circle
					cx="120"
					cy="760"
					r="380"
					stroke="currentColor"
					className="text-slate-300/40"
					strokeWidth="1"
				/>
				<path
					d="M 980 -80 C 1150 220, 1420 380, 1560 420"
					stroke="currentColor"
					className="text-slate-300/45"
					strokeWidth="1"
				/>
			</svg>
		</div>
	);
}
