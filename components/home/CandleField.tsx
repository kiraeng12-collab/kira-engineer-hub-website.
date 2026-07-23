"use client";

import { useEffect, useRef } from "react";

/**
 * Animated candlestick backdrop for the hero: a slow random-walk market where
 * the newest candle forms tick by tick on the right, the whole field drifts
 * left like a live feed, and candles fade away as they leave - "coming and
 * going" rather than a static image.
 *
 * Deliberately quiet: brand colours at low alpha behind a CSS mask, ~30fps,
 * paused whenever the tab is hidden or the hero is off-screen, and reduced to
 * a single static frame for prefers-reduced-motion.
 */

const UP = "43, 182, 168"; // --cyan
const DOWN = "223, 100, 113"; // --danger

const SPACING = 26; // px between candle centres
const BODY_W = 11;
const DRIFT = 14; // px per second leftward
const TICK_MS = 220; // live-candle heartbeat
const FPS_MS = 1000 / 30;

type Candle = { open: number; close: number; high: number; low: number; born: number };

function nextCandle(prevClose: number, now: number): Candle {
  // Gentle mean-reverting walk keeps the band on screen.
  const pull = (0.5 - prevClose) * 0.08;
  const step = (Math.random() - 0.5) * 0.14 + pull;
  const close = Math.min(0.9, Math.max(0.1, prevClose + step));
  const open = prevClose;
  const high = Math.max(open, close) + Math.random() * 0.05;
  const low = Math.min(open, close) - Math.random() * 0.05;
  return { open, close, high, low, born: now };
}

export function CandleField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const context = el.getContext("2d");
    if (!context) return;
    // Narrowed aliases: TypeScript can't carry the null-checks into the
    // hoisted resize/draw/frame functions below.
    const canvas = el;
    const ctx = context;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    const candles: Candle[] = [];
    let scroll = 0; // leftward offset of the whole field
    let lastFrame = 0;
    let lastTick = 0;
    let raf = 0;
    let running = false;
    let visible = true;
    let inView = true;

    function resize() {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const need = Math.ceil(width / SPACING) + 3;
      const now = performance.now();
      while (candles.length < need) {
        const prev = candles[candles.length - 1];
        candles.push(nextCandle(prev ? prev.close : 0.35 + Math.random() * 0.3, now - 5000));
      }
    }

    // Price band occupies the lower two thirds so the headline stays clean.
    const yFor = (v: number) => height * (0.30 + (1 - v) * 0.62);

    function draw(now: number) {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < candles.length; i += 1) {
        const c = candles[i];
        const isLive = i === candles.length - 1;
        const x = i * SPACING - scroll + SPACING / 2;
        if (x < -SPACING || x > width + SPACING) continue;

        // Fade in when freshly born, fade out while leaving on the left.
        const age = Math.min(1, (now - c.born) / 900);
        const exit = Math.min(1, Math.max(0, x / 130));
        const alpha = 0.16 * age * exit * (isLive ? 1.35 : 1);
        if (alpha <= 0.004) continue;

        const up = c.close >= c.open;
        const rgb = up ? UP : DOWN;
        const yO = yFor(c.open);
        const yC = yFor(c.close);
        const bodyTop = Math.min(yO, yC);
        const bodyH = Math.max(2, Math.abs(yC - yO));

        ctx.strokeStyle = `rgba(${rgb}, ${alpha * 0.9})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x, yFor(c.high));
        ctx.lineTo(x, yFor(c.low));
        ctx.stroke();

        ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
        ctx.fillRect(x - BODY_W / 2, bodyTop, BODY_W, bodyH);

        if (isLive) {
          // A soft glow marks the candle currently forming.
          ctx.fillStyle = `rgba(${rgb}, ${alpha * 0.28})`;
          ctx.fillRect(x - BODY_W, bodyTop - 6, BODY_W * 2, bodyH + 12);
        }
      }
    }

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      if (now - lastFrame < FPS_MS) return;
      const dt = lastFrame ? Math.min(100, now - lastFrame) : FPS_MS;
      lastFrame = now;

      scroll += (DRIFT * dt) / 1000;

      // The live candle keeps forming: nudge its close on a heartbeat.
      if (now - lastTick > TICK_MS) {
        lastTick = now;
        const live = candles[candles.length - 1];
        if (live) {
          const jitter = (Math.random() - 0.5) * 0.05;
          live.close = Math.min(0.9, Math.max(0.1, live.close + jitter));
          live.high = Math.max(live.high, live.close);
          live.low = Math.min(live.low, live.close);
        }
      }

      // A full slot has scrolled past: retire the oldest, open a fresh one.
      if (scroll >= SPACING) {
        scroll -= SPACING;
        candles.shift();
        const prev = candles[candles.length - 1];
        candles.push(nextCandle(prev.close, now));
      }

      draw(now);
    }

    function setRunning(next: boolean) {
      if (next === running) return;
      running = next;
      if (running) {
        lastFrame = 0;
        raf = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(raf);
      }
    }

    const sync = () => setRunning(visible && inView && !reduceMotion);

    resize();
    draw(performance.now());
    if (reduceMotion) {
      // Static frame only - still on brand, no motion.
      window.addEventListener("resize", () => {
        resize();
        draw(performance.now());
      });
      return;
    }

    const onResize = () => resize();
    const onVisibility = () => {
      visible = document.visibilityState === "visible";
      sync();
    };
    const observer = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true;
        sync();
      },
      { threshold: 0.02 }
    );

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    observer.observe(canvas);
    sync();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="hero-candles" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
