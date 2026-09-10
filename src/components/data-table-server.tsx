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
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsUpDownIcon,
    ChevronUpIcon,
    LoaderCircleIcon,
    SearchIcon,
    XIcon,
} from "lucide-react";

export type ServerTableQuery = {
    page: number;
    pageSize: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
    query: string;
    /** Aborted when the query changes or the component unmounts. */
    signal: AbortSignal;
};

export type ServerTableResult<T> = {
    rows: T[];
    total: number;
};

type ServerDataTableProps<T> = {
    columns: DataTableColumn<T>[];
    /**
     * Fetch one page of rows from the server. Held in a ref internally, so an
     * inline arrow is safe and will not cause a refetch loop.
     */
    fetchRows: (query: ServerTableQuery) => Promise<ServerTableResult<T>>;
    /** Stable row identity. Strongly recommended: index keys leak row state across pages. */
    getRowId?: (row: T, index: number) => string | number;
    pageSize?: number;
    pageSizeOptions?: number[];
    searchPlaceholder?: string;
    emptyMessage?: string;
    /** Right side of the toolbar (e.g. a refresh button). */
    toolbar?: ReactNode;
    className?: string;
    /** Bump to force a refetch from outside (e.g. after a mutation). */
    refreshKey?: number;
};

type SortState = { key: string; dir: "asc" | "desc" } | null;

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Server-side data table: search, sorting and pagination are all resolved by
 * `fetchRows` (one request per change) instead of in-memory. Fills available
 * height under the page header and scrolls its own body with a sticky header.
 */
export function ServerDataTable<T extends Record<string, unknown>>({
    columns,
    fetchRows,
    getRowId,
    pageSize = 10,
    pageSizeOptions = [10, 20, 50],
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

    // Keep the latest fetcher without making it a fetch dependency, so callers
    // can pass an inline arrow without triggering an infinite refetch loop.
    const fetchRowsRef = useRef(fetchRows);
    useEffect(() => {
        fetchRowsRef.current = fetchRows;
    }, [fetchRows]);

    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
    const safePage = Math.min(page, totalPages);

    // Keep `page` state in sync with a shrinking result set, so the request and
    // the footer never disagree (e.g. searching while on page 3 of 3).
    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    // Debounce the search box before it hits the server. Skipped on mount so
    // the first render does not fire a redundant state update.
    const isFirstSearchRun = useRef(true);
    useEffect(() => {
        if (isFirstSearchRun.current) {
            isFirstSearchRun.current = false;
            return;
        }
        const timer = window.setTimeout(() => {
            setQuery(searchInput);
            setPage(1);
        }, SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(timer);
    }, [searchInput]);

    // Fetch whenever the effective query changes. A monotonically increasing
    // request id drops stale responses that arrive out of order, and the
    // AbortController cancels the in-flight request outright.
    const requestId = useRef(0);
    // State (not a ref) so render can read it for skeleton switching.
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

    useEffect(() => {
        const id = ++requestId.current;
        const controller = new AbortController();

        setIsLoading(true);
        setError(null);

        fetchRowsRef
            .current({
                page: safePage,
                pageSize: rowsPerPage,
                sortBy: sort?.key,
                sortDir: sort?.dir,
                query,
                signal: controller.signal,
            })
            .then((result) => {
                if (requestId.current !== id) return;
                setRows(result.rows);
                setTotal(result.total);
            })
            .catch((cause: unknown) => {
                if (requestId.current !== id || controller.signal.aborted) return;
                if (cause instanceof DOMException && cause.name === "AbortError") return;
                setError("Failed to load data. Check your connection and try again.");
                setRows([]);
                setTotal(0);
            })
            .finally(() => {
                if (requestId.current !== id) return;
                setHasLoadedOnce(true);
                setIsLoading(false);
            });

        return () => controller.abort();
    }, [query, safePage, rowsPerPage, sort, refreshKey, retryTick]);

    // Reset the internal scroll position when the visible slice changes,
    // otherwise page 2 opens mid-table.
    const viewportRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        viewportRef.current?.scrollTo({ top: 0 });
    }, [safePage, query, sort]);

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

    const showSkeletons = isLoading && !hasLoadedOnce.current;
    const isRefetching = isLoading && hasLoadedOnce.current;

    return (
        <div className={cn("flex min-h-0 flex-col gap-4", className)}>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-full sm:w-64">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="h-8 bg-background pr-8 pl-8 text-sm"
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder={searchPlaceholder}
                        value={searchInput}
                    />
                    {searchInput.length > 0 && (
                        <button
                            aria-label="Clear search"
                            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                            onClick={() => setSearchInput("")}
                            type="button"
                        >
                            <XIcon className="size-3.5" />
                        </button>
                    )}
                </div>
                {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
            </div>

            {/* Table viewport: fills remaining height, scrolls internally. */}
            <div
                className="relative min-h-0 flex-1 overflow-auto rounded-xl border bg-card"
                ref={viewportRef}
            >
                <table className="w-full border-separate border-spacing-0 text-sm">
                    <thead>
                        <tr>
                            {columns.map((column) => {
                                const isSorted = sort?.key === column.key;
                                const SortIcon = !column.sortable
                                    ? null
                                    : !isSorted
                                      ? ChevronsUpDownIcon
                                      : sort.dir === "asc"
                                        ? ChevronUpIcon
                                        : ChevronDownIcon;

                                const label = (
                                    <>
                                        {column.header}
                                        {SortIcon && (
                                            <SortIcon
                                                className={cn(
                                                    "size-3.5",
                                                    !isSorted && "opacity-40"
                                                )}
                                            />
                                        )}
                                    </>
                                );

                                return (
                                    <th
                                        aria-sort={
                                            isSorted
                                                ? sort.dir === "asc"
                                                    ? "ascending"
                                                    : "descending"
                                                : "none"
                                        }
                                        className={cn(
                                            "sticky top-0 z-10 border-b bg-card/95 px-4 py-2.5 text-left font-medium text-muted-foreground text-xs backdrop-blur supports-backdrop-filter:bg-card/85",
                                            column.className
                                        )}
                                        key={column.key}
                                        scope="col"
                                    >
                                        {column.sortable ? (
                                            <button
                                                className="inline-flex select-none items-center gap-1 rounded-sm transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                                                onClick={() => toggleSort(column.key)}
                                                type="button"
                                            >
                                                {label}
                                            </button>
                                        ) : (
                                            <span className="inline-flex items-center gap-1">
                                                {label}
                                            </span>
                                        )}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody
                        aria-busy={isLoading}
                        className={cn(
                            "transition-opacity",
                            isRefetching && "opacity-60"
                        )}
                    >
                        {error ? (
                            <tr>
                                <td
                                    className="px-4 py-12 text-center text-sm"
                                    colSpan={columns.length}
                                >
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
                        ) : showSkeletons ? (
                            skeletonRows.map((_, index) => (
                                <tr key={`skeleton-${index}`}>
                                    {columns.map((column) => (
                                        <td
                                            className="border-b px-4 py-2.5"
                                            key={column.key}
                                        >
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
                                <tr
                                    className="transition-colors hover:bg-muted/50"
                                    key={getRowId ? getRowId(row, index) : index}
                                >
                                    {columns.map((column) => (
                                        <td
                                            className={cn(
                                                "border-b px-4 py-2.5",
                                                column.className
                                            )}
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
                            <SelectTrigger
                                aria-label="Rows per page"
                                className="h-7 w-16"
                                size="sm"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {pageSizeOptions.map((size) => (
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