"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ImageUploader({
  value,
  onChange,
  folder = "misc",
  kind = "image",
  label = "Upload",
  className,
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  kind?: "image" | "file";
  label?: string;
  className?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });
      if (!signRes.ok) {
        const { error } = await signRes.json().catch(() => ({ error: "Sign failed" }));
        throw new Error(error || "Could not sign upload");
      }
      const { signature, timestamp, apiKey, cloudName, folder: signedFolder } = await signRes.json();

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", apiKey);
      form.append("timestamp", String(timestamp));
      form.append("signature", signature);
      form.append("folder", signedFolder);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onChange(data.secure_url as string);
      toast.success("Uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {value ? (
        <div className="relative">
          {kind === "image" ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
              <Image src={value} alt="Uploaded" fill className="object-cover" sizes="400px" />
            </div>
          ) : (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--muted)] hover:text-[var(--text)]"
            >
              <FileText className="h-4 w-4 text-[var(--accent)]" /> View uploaded file
            </a>
          )}
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] shadow hover:text-red-500"
            aria-label="Remove"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-8 text-sm text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text)]"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-[var(--accent)]" />
          ) : (
            <UploadCloud className="h-5 w-5 text-[var(--accent)]" />
          )}
          {uploading ? "Uploading…" : label}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={kind === "image" ? "image/*" : "image/*,application/pdf"}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
