"use client";

import { ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { GithubIcon } from "@/components/ui/brand-icons";
import { Magnetic } from "@/components/motion/magnetic";
import { capture } from "@/lib/analytics";

export function ProjectCTA({
  liveUrl,
  githubUrl,
}: {
  liveUrl?: string | null;
  githubUrl?: string | null;
}) {
  if (!liveUrl && !githubUrl) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-3">
      {liveUrl && (
        <Magnetic>
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => capture("external_link_clicked", { platform: "live-demo", url: liveUrl })}
            className={buttonVariants({ size: "md" })}
          >
            Live demo
            <ExternalLink className="h-4 w-4" />
          </a>
        </Magnetic>
      )}
      {githubUrl && (
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => capture("external_link_clicked", { platform: "github-repo", url: githubUrl })}
          className={buttonVariants({ variant: "secondary", size: "md" })}
        >
          <GithubIcon className="h-4 w-4" />
          View source
        </a>
      )}
    </div>
  );
}
