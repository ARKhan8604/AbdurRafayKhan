"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { ProjectImageView } from "@/types/content";

export function ProjectGallery({ images, title }: { images: ProjectImageView[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, images.length]);

  if (!images.length) return null;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setOpen(i)}
            className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]"
            aria-label={`Open image ${i + 1}`}
          >
            <Image
              src={img.url}
              alt={img.alt ?? `${title} screenshot ${i + 1}`}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-4 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <button
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              onClick={() => setOpen(null)}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen((i) => (i === null ? i : (i - 1 + images.length) % images.length));
                  }}
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  className="absolute right-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen((i) => (i === null ? i : (i + 1) % images.length));
                  }}
                  aria-label="Next"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            <motion.div
              key={open}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative h-[80vh] w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[open].url}
                alt={images[open].alt ?? title}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
