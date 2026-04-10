"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fondo animado + brillo que sigue el cursor (estilo sitios producto / puntopago.net).
 * Respeta prefers-reduced-motion.
 */
export function PpAmbient() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const target = useRef({ x: 0, y: 0 });
  const [glow, setGlow] = useState({ x: 0, y: 0 });
  const rafRef = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    target.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 3,
    };
    setGlow({ ...target.current });

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const loop = () => {
      setGlow((prev) => {
        const tx = target.current.x;
        const ty = target.current.y;
        const k = 0.14;
        return {
          x: prev.x + (tx - prev.x) * k,
          y: prev.y + (ty - prev.y) * k,
        };
      });
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [reduceMotion]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div className="pp-blob pp-blob-a" />
      <div className="pp-blob pp-blob-b" />
      <div className="pp-blob pp-blob-c" />
      <div className="pp-grid-mask" />

      {!reduceMotion && (
        <div
          className="pp-cursor-glow"
          style={{
            transform: `translate3d(${glow.x - 280}px, ${glow.y - 280}px, 0)`,
          }}
        />
      )}
    </div>
  );
}
