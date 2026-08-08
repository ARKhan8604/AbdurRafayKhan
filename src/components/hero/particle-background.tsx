"use client";

import { useEffect, useRef } from "react";

/**
 * Interactive particle-network hero background.
 * - Nodes drift and connect with distance-faded lines.
 * - The pointer repels nearby nodes and drags a soft accent glow.
 * - Fades out on scroll; pauses when offscreen or tab hidden.
 * - Fully theme-aware (reads CSS vars) and disabled for reduced-motion.
 */
export function ParticleBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let running = true;
    let raf = 0;

    // Theme colors (re-read on theme change)
    let dot = "235, 235, 245";
    let line = "rgba(255,255,255,0.14)";
    const accent = "59,130,246";
    function readColors() {
      const s = getComputedStyle(document.documentElement);
      dot = s.getPropertyValue("--particle").trim() || dot;
      line = s.getPropertyValue("--particle-line").trim() || line;
    }
    readColors();

    const pointer = { x: -9999, y: -9999, active: false };
    let scrollFade = 1;

    type P = { x: number; y: number; vx: number; vy: number; r: number };
    let particles: P[] = [];

    function density() {
      const area = width * height;
      // ~1 particle per 14k px², capped for perf
      return Math.max(28, Math.min(90, Math.round(area / 14000)));
    }

    function seed() {
      const count = density();
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.6 + 0.6,
      }));
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    const maxDist = 130;
    // Target ~60fps (16.667ms/frame). Movement is scaled by how much real
    // time actually elapsed since the last frame, so the drift speed stays
    // constant regardless of the browser's actual frame rate — without
    // this, particles visibly speed up or slow down as frame rate varies.
    const TARGET_FRAME_MS = 1000 / 60;
    let lastTime = 0;

    function frame(time: number) {
      if (!running) return;
      if (!lastTime) lastTime = time;
      // Clamp so a long pause (tab backgrounded, slow device) doesn't cause a huge jump.
      const dt = Math.min(time - lastTime, TARGET_FRAME_MS * 4);
      lastTime = time;
      const speed = dt / TARGET_FRAME_MS;

      ctx!.clearRect(0, 0, width, height);

      // pointer glow
      if (pointer.active) {
        const g = ctx!.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 180);
        g.addColorStop(0, `rgba(${accent}, ${0.10 * scrollFade})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx!.fillStyle = g;
        ctx!.fillRect(0, 0, width, height);
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx * speed;
        p.y += p.vy * speed;

        // pointer repel
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 120 * 120 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const force = (120 - d) / 120;
            p.x += (dx / d) * force * 1.4 * speed;
            p.y += (dy / d) * force * 1.4 * speed;
          }
        }

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${dot}, ${0.55 * scrollFade})`;
        ctx!.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.hypot(dx, dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.6 * scrollFade;
            ctx!.strokeStyle = line.replace(
              /rgba?\(([^)]+),\s*[\d.]+\)/,
              (_m, rgb) => `rgba(${rgb}, ${alpha})`
            );
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(q.x, q.y);
            ctx!.stroke();
          }
        }
      }
      raf = requestAnimationFrame(frame);
    }

    function onMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    }
    function onLeave() {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    }
    function onScroll() {
      const y = window.scrollY;
      scrollFade = Math.max(0, 1 - y / (window.innerHeight * 0.9));
    }

    // Static fallback for reduced motion: a single soft frame.
    if (reduce) {
      resize();
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dot}, 0.4)`;
        ctx.fill();
      }
      return;
    }

    resize();
    raf = requestAnimationFrame(frame);

    const io = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting && !document.hidden;
        if (running) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(frame);
        }
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    const themeObserver = new MutationObserver(readColors);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const onVisibility = () => {
      running = !document.hidden;
      if (running) raf = requestAnimationFrame(frame);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
