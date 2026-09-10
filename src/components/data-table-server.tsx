import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { DataTableColumn } from "@/components/data-table";
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
	LoaderCircleIcon,
	SearchIcon,
} from "lucide-react";

export type ServerTableQuery = {
	page: number;
	pageSize: number;
	sortBy?: string;
	sortDir?: "asc" | "desc";
	query: string;
};

export type ServerTableResult<T> = {
	rows: T[];
	total: number;
};

type ServerDataTableProps<T> = {
	columns: DataTableColumn<T>[];
	/** Fetch one page of rows from the "server". Changing identity refetches. */
	fetchRows: (query: ServerTableQuery) => Promise<ServerTableResult<T>>;
	pageSize?: number;
	searchPlaceholder?: string;
	emptyMessage?: string;
	/** Right side of the toolbar (e.g. a refresh button). */
	toolbar?: ReactNode;
	className?: string;
	/** Bump to force a refetch from outside (e.g. after a mutation). */
	refreshKey?: number;
};

type SortState = { key: string; dir: "asc" | "desc" } | null;

/**
 * Server-side data table: search, sorting and pagination are all resolved by
 * `fetchRows` (one request per change) instead of in-memory. Fills available
 * height under the page header and scrolls its own body with a sticky header.
 */
export function ServerDataTable<T extends Record<string, unknown>>({
	columns,
	fetchRows,
	pageSize = 10,
	searchPlaceholder = "Search…",
	emptyMessage = "No results.",
	toolbar,
	className,
	refreshKey = 0,
}: ServerDataTableProps<T>) {
	const [searchInput, setSearchInput] = useState("");
	const [query, setQuery] = useState("");
	const [sort, setSort] = useState<SortState>(null);
	const [page, setPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(pageSize);

	const [rows, setRows] = useState<T[]>([]);
	const [total, setTotal] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [retryTick, setRetryTick] = useState(0);

	// Debounce the search box before it hits the "server".
	useEffect(() => {
		const timer = window.setTimeout(() => {
			setQuery(searchInput);
			setPage(1);
		}, 300);
		return () => window.clearTimeout(timer);
	}, [searchInput]);

	// Fetch whenever the query changes. A monotonically increasing request id
	// drops stale responses that arrive out of order.
	const requestId = useRef(0);
	useEffect(() => {
		const id = ++requestId.current;
		setIsLoading(true);
		setError(null);

		fetchRows({
			page,
			pageSize: rowsPerPage,
			sortBy: sort?.key,
			sortDir: sort?.dir,
			query,
		})
			.then((result) => {
				if (requestId.current !== id) return;
				setRows(result.rows);
				setTotal(result.total);
			})
			.catch(() => {
				if (requestId.current !== id) return;
				setError("Failed to load data. Check your connection and try again.");
			})
			.finally(() => {
				if (requestId.current === id) setIsLoading(false);
			});
	}, [fetchRows, query, page, rowsPerPage, sort, refreshKey, retryTick]);

	const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
	const safePage = Math.min(page, totalPages);
	const start = (safePage - 1) * rowsPerPage;

	const toggleSort = (key: string) => {
		setPage(1);
		setSort((current) => {
			if (current?.key !== key) return { key, dir: "asc" };
			if (current.dir === "asc") return { key, dir: "desc" };
			return null;
		});
	};

	const skeletonRows = useMemo(
		() => Array.from({ length: Math.min(rowsPerPage, 8) }),
		[rowsPerPage]
	);

	return (
		<div className={cn("flex min-h-0 flex-col gap-4", className)}>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="relative w-full sm:w-64">
					<SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
					<Input
						className="h-8 bg-background pl-8 text-sm"
						onChange={(event) => setSearchInput(event.target.value)}
						placeholder={searchPlaceholder}
						value={searchInput}
					/>
				</div>
				{toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
			</div>

			{/* Table viewport: fills remaining height, scrolls internally. */}
			<div className="relative min-h-0 flex-1 overflow-auto rounded-xl border bg-card">
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
						{error ? (
							<tr>
								<td className="px-4 py-12 text-center text-sm" colSpan={columns.length}>
									<p className="text-destructive">{error}</p>
									<Button
										className="mt-3"
										onClick={() => setRetryTick((tick) => tick + 1)}
										size="sm"
										variant="outline"
									>
										Retry
									</Button>
								</td>
							</tr>
						) : isLoading ? (
							skeletonRows.map((_, index) => (
								<tr key={index}>
									{columns.map((column) => (
										<td className="border-b px-4 py-2.5" key={column.key}>
											<div className="h-4 animate-pulse rounded bg-muted" />
										</td>
									))}
								</tr>
							))
						) : rows.length === 0 ? (
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
				<p className="flex items-center gap-2 text-muted-foreground text-xs tabular-nums">
					{isLoading && <LoaderCircleIcon className="size-3 animate-spin" />}
					Showing {total === 0 ? 0 : start + 1}–
					{Math.min(start + rowsPerPage, total)} of {total}
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
							disabled={safePage <= 1 || isLoading}
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							size="icon"
							variant="outline"
						>
							<ChevronLeftIcon />
						</Button>
						<Button
							aria-label="Next page"
							className="size-7"
							disabled={safePage >= totalPages || isLoading}
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
