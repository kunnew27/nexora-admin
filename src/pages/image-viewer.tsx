import { PageHeader } from "@/components/page-header";
import { ImageViewer } from "@/components/ui/image-viewer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

const samples = [
  {
    src: "https://picsum.photos/id/1018/1600/900",
    alt: "Mountain valley landscape",
    className: "aspect-video w-full",
  },
  {
    src: "https://picsum.photos/id/1015/900/1200",
    alt: "River canyon portrait",
    className: "aspect-[3/4] w-full",
  },
  {
    src: "https://picsum.photos/id/29/1600/900",
    alt: "Desert dunes at dusk",
    className: "aspect-video w-full",
  },
  {
    src: "https://picsum.photos/id/1060/1200/800",
    alt: "Coffee pour close-up",
    className: "aspect-[3/2] w-full",
  },
] as const;

const shortcuts = [
  { keys: ["+"], label: "Zoom in" },
  { keys: ["-"], label: "Zoom out" },
  { keys: ["0"], label: "Reset" },
  { keys: ["R"], label: "Rotate" },
  { keys: ["Esc"], label: "Close" },
] as const;

export default function ImageViewerPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Image viewer"
        description="Click a thumbnail to open the lightbox. Test wheel zoom, pan, pinch, and keyboard shortcuts."
      />

      <Card>
        <CardHeader>
          <CardTitle>How to test</CardTitle>
          <CardDescription>
            Overlay uses low tint and light blur. Double-click toggles 1× ↔ 2×.
            Click empty backdrop at 1× to close.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {shortcuts.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-lg border border-border/60 px-2.5 py-1.5"
              >
                <KbdGroup>
                  {item.keys.map((key) => (
                    <Kbd key={key}>{key}</Kbd>
                  ))}
                </KbdGroup>
                <span className="text-muted-foreground text-xs">{item.label}</span>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-sm">
            Mouse wheel or trackpad zooms toward the cursor. Drag to pan. Two-finger
            pinch works on touch.
          </p>
        </CardContent>
      </Card>

      <ImageViewer
        src={samples[0].src}
        alt={samples[0].alt}
        className="aspect-video w-full max-w-xl"
        overlayOpacity={0.28}
        backdropBlur={3}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {samples.map((sample) => (
          <ImageViewer
            key={sample.src}
            src={sample.src}
            alt={sample.alt}
            className={sample.className}
            overlayOpacity={0.28}
            backdropBlur={3}
          />
        ))}
      </div>
    </div>
  );
}
