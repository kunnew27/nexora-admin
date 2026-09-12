import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
	return (
		<main className="grid min-h-svh place-items-center p-6">
			<div className="space-y-4 text-center">
				<p className="font-mono text-sm text-muted-foreground">404</p>
				<h1 className="font-semibold text-2xl tracking-tight">
					Page not found
				</h1>
				<p className="text-muted-foreground text-sm">
					The page you are looking for doesn&apos;t exist or has been moved.
				</p>
				<Button render={<Link to="/overview" />}>Back to Overview</Button>
			</div>
		</main>
	);
}
