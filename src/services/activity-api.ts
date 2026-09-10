import type {
  ServerTableQuery,
  ServerTableResult,
} from "@/components/data-table-server";

export type ActivityEvent = {
  id: string;
  event: string;
  user: string;
  target: string;
  level: "info" | "warning" | "critical";
  createdAt: string; // ISO date
};

const eventTemplates = [
  { event: "User signed in", target: "web app", level: "info" },
  { event: "Invoice paid", target: "billing", level: "info" },
  { event: "API key rotated", target: "api-keys", level: "warning" },
  { event: "Failed sign-in attempts", target: "auth", level: "critical" },
  { event: "Project archived", target: "projects", level: "info" },
  {
    event: "Webhook delivery failed",
    target: "integrations",
    level: "critical",
  },
  { event: "Role permissions updated", target: "team", level: "warning" },
  { event: "Export generated", target: "reports", level: "info" },
  { event: "Payment method expired", target: "billing", level: "warning" },
  { event: "Workspace settings changed", target: "settings", level: "info" },
] as const;

const users = [
  "Alex Morgan",
  "Maya Chen",
  "Diego Ramirez",
  "Sara Lindqvist",
  "Priya Nair",
  "Jonas Weber",
  "Hana Sato",
  "System",
];

/** Deterministic demo dataset — 57 rows so pagination has multiple pages. */
const ALL_EVENTS: ActivityEvent[] = Array.from({ length: 57 }, (_, i) => {
  const template = eventTemplates[i % eventTemplates.length];
  const user = users[i % users.length];
  const date = new Date(Date.UTC(2026, 7, 31) - i * 7.3 * 60 * 60 * 1000);
  return {
    id: `evt-${String(i + 1).padStart(3, "0")}`,
    event: template.event,
    user,
    target: template.target,
    level: template.level,
    createdAt: date.toISOString(),
  };
});

/**
 * Fake server API for the server-side data table demo.
 * Replace the body with a real `fetch()` call to your endpoint.
 */
export async function fetchActivity(
  query: ServerTableQuery,
): Promise<ServerTableResult<ActivityEvent>> {
  // Simulate network latency.
  await new Promise((resolve) => setTimeout(resolve, 450));

  let rows = [...ALL_EVENTS];

  if (query.query.trim()) {
    const q = query.query.trim().toLowerCase();
    rows = rows.filter((row) =>
      `${row.event} ${row.user} ${row.target} ${row.level}`
        .toLowerCase()
        .includes(q),
    );
  }

  if (query.sortBy) {
    const key = query.sortBy as keyof ActivityEvent;
    const dir = query.sortDir === "desc" ? -1 : 1;
    rows.sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      const result =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return result * dir;
    });
  }

  const total = rows.length;
  const start = (query.page - 1) * query.pageSize;
  rows = rows.slice(start, start + query.pageSize);

  return { rows, total };
}
