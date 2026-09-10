import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsUpDownIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	SearchIcon,
} from "lucide-react";

export type DataTableColumn<T> = {
	/** Unique key; also used for default sort value lookup (`row[key]`). */
	key: string;
	header: string;
	sortable?: boolean;
	/** Value used when sorting; defaults to `row[key]`. */
	sortValue?: (row: T) => string | number;
	className?: string;
	cell: (row: T) => ReactNode;
};

type DataTableProps<T> = {
	columns: DataTableColumn<T>[];
	data: T[];
	/** What to match the search box against; defaults to all string fields. */
	searchValue?: (row: T) => string;
	pageSize?: number;
	searchPlaceholder?: string;
	emptyMessage?: string;
	/** Right side of the toolbar (e.g. an "Add user" button). */
	toolbar?: ReactNode;
	className?: string;
};

type SortState = { key: string; dir: "asc" | "desc" } | null;

/**
 * Reusable data table: search, column sorting, pagination.
 * Fill available height under the page header (`h-full` from the parent page)
 * and scroll its own body with a sticky table header.
 */
export function DataTable<T extends Record<string, unknown>>({
	columns,
	data,
	searchValue,
	pageSize = 10,
	searchPlaceholder = "Search…",
	emptyMessage = "No results.",
	toolbar,
	className,
}: DataTableProps<T>) {
	const [query, setQuery] = useState("");
	const [sort, setSort] = useState<SortState>(null);
	const [page, setPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(pageSize);

	const filtered = useMemo(() => {
		if (!query.trim()) return data;
		const q = query.trim().toLowerCase();
		return data.filter((row) =>
			(searchValue?.(row) ?? Object.values(row).join(" "))
				.toLowerCase()
				.includes(q)
		);
	}, [data, query, searchValue]);

	const sorted = useMemo(() => {
		if (!sort) return filtered;
		const column = columns.find((c) => c.key === sort.key);
		if (!column) return filtered;
		const getValue = column.sortValue ?? ((row: T) => row[sort.key] as string | number);
		return [...filtered].sort((a, b) => {
			const av = getValue(a);
			const bv = getValue(b);
			const result =
				typeof av === "number" && typeof bv === "number"
					? av - bv
					: String(av).localeCompare(String(bv));
			return sort.dir === "asc" ? result : -result;
		});
	}, [filtered, sort, columns]);

	const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
	const safePage = Math.min(page, totalPages);
	const start = (safePage - 1) * rowsPerPage;
	const rows = sorted.slice(start, start + rowsPerPage);

	const toggleSort = (key: string) => {
		setPage(1);
		setSort((current) => {
			if (current?.key !== key) return { key, dir: "asc" };
			if (current.dir === "asc") return { key, dir: "desc" };
			return null;
		});
	};

	return (
		<div className={cn("flex min-h-0 flex-col gap-4", className)}>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="relative w-full sm:w-64">
					<SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
					<Input
						className="h-8 bg-background pl-8 text-sm"
						onChange={(event) => {
							setQuery(event.target.value);
							setPage(1);
						}}
						placeholder={searchPlaceholder}
						value={query}
					/>
				</div>
				{toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
			</div>

			{/* Table viewport: fills remaining height, scrolls internally. */}
			<div className="min-h-0 flex-1 overflow-auto rounded-xl border bg-card">
				<table className="w-full border-separate border-spacing-0 text-sm">
					<thead>
						<tr>
							{columns.map((column) => {
								const isSorted = sort?.key === column.key;
								return (
									<th
										className={cn(
											"sticky top-0 z-10 border-b bg-card/95 px-4 py-2.5 text-left font-medium text-muted-foreground text-xs backdrop-blur supports-backdrop-filter:bg-card/85",
											column.sortable && "cursor-pointer select-none hover:text-foreground",
											column.className
										)}
										key={column.key}
										onClick={column.sortable ? () => toggleSort(column.key) : undefined}
									>
										<span className="inline-flex items-center gap-1">
											{column.header}
											{column.sortable && isSorted && sort.dir === "asc" && (
												<ChevronUpIcon className="size-3.5" />
											)}
											{column.sortable && isSorted && sort.dir === "desc" && (
												<ChevronDownIcon className="size-3.5" />
											)}
											{column.sortable && !isSorted && (
												<ChevronsUpDownIcon className="size-3.5 opacity-40" />
											)}
										</span>
									</th>
								);
							})}
						</tr>
					</thead>
					<tbody>
						{rows.length === 0 ? (
							<tr>
								<td
									className="px-4 py-12 text-center text-muted-foreground text-sm"
									colSpan={columns.length}
								>
									{emptyMessage}
								</td>
							</tr>
						) : (
							rows.map((row, index) => (
								<tr className="transition-colors hover:bg-muted/50" key={index}>
									{columns.map((column) => (
										<td
											className={cn("border-b px-4 py-2.5", column.className)}
											key={column.key}
										>
											{column.cell(row)}
										</td>
									))}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<p className="text-muted-foreground text-xs tabular-nums">
					Showing{" "}
					{sorted.length === 0 ? 0 : start + 1}–{Math.min(start + rowsPerPage, sorted.length)}{" "}
					of {sorted.length}
				</p>
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground text-xs">Rows per page</span>
						<Select
							onValueChange={(value) => {
								setRowsPerPage(Number(value));
								setPage(1);
							}}
							value={String(rowsPerPage)}
						>
							<SelectTrigger aria-label="Rows per page" className="h-7 w-16" size="sm">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{[10, 20, 50].map((size) => (
									<SelectItem key={size} value={String(size)}>
										{size}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<span className="text-muted-foreground text-xs tabular-nums">
						Page {safePage} of {totalPages}
					</span>
					<div className="flex items-center gap-1.5">
						<Button
							aria-label="Previous page"
							className="size-7"
							disabled={safePage <= 1}
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							size="icon"
							variant="outline"
						>
							<ChevronLeftIcon />
						</Button>
						<Button
							aria-label="Next page"
							className="size-7"
							disabled={safePage >= totalPages}
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							size="icon"
							variant="outline"
						>
							<ChevronRightIcon />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
