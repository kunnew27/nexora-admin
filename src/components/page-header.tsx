type PageHeaderProps = {
	title: string;
	description: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
	return (
		<div className="space-y-1">
			<h1 className="font-semibold text-xl tracking-tight">{title}</h1>
			<p className="text-muted-foreground text-sm">{description}</p>
		</div>
	);
}
