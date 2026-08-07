"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

function PostHogInit() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || posthog.__loaded) return;
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      capture_pageview: false,
      capture_pageleave: true,
      respect_dnt: true,
      persistence: "localStorage+cookie",
    });
  }, []);

  useEffect(() => {
    if (!posthog.__loaded) return;
    const url = window.location.origin + pathname + (searchParams?.toString() ? `?${searchParams}` : "");
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <Suspense fallback={null}>
        <PostHogInit />
      </Suspense>
      {children}
      <Toaster
        theme="system"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--surface)",
            color: "var(--text)",
            border: "1px solid var(--border)",
          },
        }}
      />
    </ThemeProvider>
  );
}
