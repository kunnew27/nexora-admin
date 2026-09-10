import * as React from "react";
import { createPortal } from "react-dom";
import {
  Download,
  Maximize2,
  Minus,
  Plus,
  RotateCw,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

const MIN_SCALE = 0.5;
const MAX_SCALE = 8;
const STEP = 1.25;

type Transform = { scale: number; x: number; y: number; rotate: number };
const INITIAL: Transform = { scale: 1, x: 0, y: 0, rotate: 0 };

const clamp = (v: number, min = MIN_SCALE, max = MAX_SCALE) =>
  Math.min(max, Math.max(min, v));

export function ImageViewer({
  src,
  alt = "",
  className,
  overlayOpacity = 0.35,
  backdropBlur = 4,
}: {
  src: string;
  alt?: string;
  className?: string;
  overlayOpacity?: number;
  backdropBlur?: number;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group relative block overflow-hidden rounded-xl border border-border/60",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
        aria-label={`View ${alt || "image"}`}
      >
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-zinc-950/0 opacity-0 transition group-hover:bg-zinc-950/20 group-hover:opacity-100">
          <Maximize2 className="size-5 text-white drop-shadow" />
        </span>
      </button>

      {open &&
        createPortal(
          <ViewerPortal
            src={src}
            alt={alt}
            overlayOpacity={overlayOpacity}
            backdropBlur={backdropBlur}
            onClose={() => setOpen(false)}
          />,
          document.body
        )}
    </>
  );
}

function ViewerPortal({
  src,
  alt,
  overlayOpacity,
  backdropBlur,
  onClose,
}: {
  src: string;
  alt: string;
  overlayOpacity: number;
  backdropBlur: number;
  onClose: () => void;
}) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const [t, setT] = React.useState<Transform>(INITIAL);
  const [dragging, setDragging] = React.useState(false);
  const [pinching, setPinching] = React.useState(false);
  const pointers = React.useRef(new Map<number, { x: number; y: number }>());
  const pinch = React.useRef<{ dist: number; scale: number } | null>(null);
  const dragStart = React.useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /** Zoom toward a point given in stage-center-relative coords. */
  const zoomAt = React.useCallback((nextScaleRaw: number, px = 0, py = 0) => {
    setT((cur) => {
      const next = clamp(nextScaleRaw);
      if (next === cur.scale) return cur;
      const k = next / cur.scale;
      return {
        ...cur,
        scale: next,
        x: px - (px - cur.x) * k,
        y: py - (py - cur.y) * k,
      };
    });
  }, []);

  const zoomBy = React.useCallback(
    (factor: number) => {
      setT((cur) => {
        const next = clamp(cur.scale * factor);
        if (next === cur.scale) return cur;
        const k = next / cur.scale;
        return { ...cur, scale: next, x: cur.x * k, y: cur.y * k };
      });
    },
    []
  );

  const reset = React.useCallback(() => setT(INITIAL), []);

  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left - rect.width / 2;
      const py = e.clientY - rect.top - rect.height / 2;
      const factor = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0022));
      setT((cur) => {
        const next = clamp(cur.scale * factor);
        const k = next / cur.scale;
        return {
          ...cur,
          scale: next,
          x: px - (px - cur.x) * k,
          y: py - (py - cur.y) * k,
        };
      });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "+" || e.key === "=") zoomBy(STEP);
      else if (e.key === "-" || e.key === "_") zoomBy(1 / STEP);
      else if (e.key === "0") reset();
      else if (e.key === "r" || e.key === "R")
        setT((c) => ({ ...c, rotate: (c.rotate + 90) % 360 }));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, zoomBy, reset]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        scale: t.scale,
      };
      setDragging(false);
      setPinching(true);
      return;
    }
    dragStart.current = { x: e.clientX, y: e.clientY, ox: t.x, oy: t.y };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      zoomAt((pinch.current.scale * dist) / pinch.current.dist);
      return;
    }
    if (!dragging) return;
    setT((cur) => ({
      ...cur,
      x: dragStart.current.ox + (e.clientX - dragStart.current.x),
      y: dragStart.current.oy + (e.clientY - dragStart.current.y),
    }));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) {
      pinch.current = null;
      setPinching(false);
    }
    if (pointers.current.size === 0) setDragging(false);
  };

  const download = async () => {
    try {
      const res = await fetch(src);
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = src.split("/").pop() || "image";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(src, "_blank");
    }
  };

  return (
    <div
      className="fixed inset-0 z-100 animate-in fade-in duration-200"
      style={{
        backgroundColor: `rgb(9 9 11 / ${overlayOpacity})`,
        backdropFilter: `blur(${backdropBlur}px) saturate(120%)`,
        WebkitBackdropFilter: `blur(${backdropBlur}px) saturate(120%)`,
      }}
      role="dialog"
      aria-modal="true"
      aria-label={alt || "Image viewer"}
    >
      <div
        ref={stageRef}
        className={cn(
          "absolute inset-0 touch-none select-none overflow-hidden",
          dragging ? "cursor-grabbing" : "cursor-grab"
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={(e) => {
          const rect = stageRef.current!.getBoundingClientRect();
          const px = e.clientX - rect.left - rect.width / 2;
          const py = e.clientY - rect.top - rect.height / 2;
          if (t.scale > 1) reset();
          else zoomAt(2, px, py);
        }}
        onClick={(e) => {
          if (t.scale !== 1) return;
          const img = imgRef.current;
          if (!img) return;
          const rect = img.getBoundingClientRect();
          const inside =
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom;
          if (!inside) onClose();
        }}
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            draggable={false}
            className="max-h-full max-w-full rounded-lg shadow-2xl will-change-transform"
            style={{
              transform: `translate3d(${t.x}px, ${t.y}px, 0) scale(${t.scale}) rotate(${t.rotate}deg)`,
              transition:
                dragging || pinching ? "none" : "transform 180ms ease-out",
            }}
          />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-center p-3">
        <div
          className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-zinc-900/70 p-1 text-white shadow-lg backdrop-blur-md"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <ToolBtn onClick={() => zoomBy(1 / STEP)} label="Zoom out (-)">
            <Minus className="size-4" />
          </ToolBtn>
          <button
            type="button"
            onClick={reset}
            className="min-w-14 rounded-full px-2 py-1 text-xs font-medium tabular-nums text-white/80 hover:bg-white/10"
            title="Reset (0)"
          >
            {Math.round(t.scale * 100)}%
          </button>
          <ToolBtn onClick={() => zoomBy(STEP)} label="Zoom in (+)">
            <Plus className="size-4" />
          </ToolBtn>
          <span className="mx-1 h-5 w-px bg-white/15" />
          <ToolBtn
            onClick={() =>
              setT((c) => ({ ...c, rotate: (c.rotate + 90) % 360 }))
            }
            label="Rotate (R)"
          >
            <RotateCw className="size-4" />
          </ToolBtn>
          <ToolBtn onClick={download} label="Download">
            <Download className="size-4" />
          </ToolBtn>
          <span className="mx-1 h-5 w-px bg-white/15" />
          <ToolBtn onClick={onClose} label="Close (Esc)">
            <X className="size-4" />
          </ToolBtn>
        </div>
      </div>
    </div>
  );
}

function ToolBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="grid size-8 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white active:scale-95"
    >
      {children}
    </button>
  );
}
