"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/admin/image-uploader";
import { addProjectImage, deleteProjectImage } from "@/server/actions";

type Img = { id: string; url: string; alt: string | null };

export function ProjectGalleryManager({ projectId, images }: { projectId: string; images: Img[] }) {
  const [list, setList] = useState(images);
  const [, start] = useTransition();
  const router = useRouter();

  // eslint-disable-next-line react-hooks/set-state-in-effect -- sync local list when server data refreshes
  useEffect(() => setList(images), [images]);

  function add(url: string | null) {
    if (!url) return;
    start(async () => {
      try {
        await addProjectImage(projectId, url);
        toast.success("Image added");
        router.refresh();
      } catch {
        toast.error("Couldn't add image");
      }
    });
  }

  function remove(id: string) {
    setList((l) => l.filter((x) => x.id !== id));
    start(async () => {
      try {
        await deleteProjectImage(id);
        router.refresh();
      } catch {
        toast.error("Couldn't remove image");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {list.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {list.map((img) => (
            <div key={img.id} className="relative aspect-video overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
              <Image src={img.url} alt={img.alt ?? ""} fill className="object-cover" sizes="200px" />
              <button
                onClick={() => remove(img.id)}
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      <ImageUploader value={null} onChange={add} folder={`projects/${projectId}`} kind="image" label="Add gallery image" />
    </div>
  );
}
