"use client";

import { useEffect, useRef, useState } from "react";

const INTERACTIVE_SELECTOR =
  'a, button, input, label, select, textarea, [role="button"], [data-cursor-hover]';
const TEXT_SELECTOR =
  'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]';

type CursorVariant = "idle" | "hover" | "text";

export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const variantRef = useRef<CursorVariant>("idle");
  const [enabled, setEnabled] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [variant, setVariantState] = useState<CursorVariant>("idle");

  useEffect(() => {
    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateEnabled = () => {
      const shouldEnable = pointerQuery.matches && !motionQuery.matches;
      setEnabled(shouldEnable);
      document.documentElement.classList.toggle("custom-cursor-active", shouldEnable);
    };

    updateEnabled();
    pointerQuery.addEventListener("change", updateEnabled);
    motionQuery.addEventListener("change", updateEnabled);

    return () => {
      pointerQuery.removeEventListener("change", updateEnabled);
      motionQuery.removeEventListener("change", updateEnabled);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let animationFrame = 0;

    const setVariant = (nextVariant: CursorVariant) => {
      if (variantRef.current === nextVariant) return;
      variantRef.current = nextVariant;
      setVariantState(nextVariant);
    };

    const showCursor = () => {
      ring.classList.add("is-visible");
      dot.classList.add("is-visible");
    };

    const hideCursor = () => {
      ring.classList.remove("is-visible");
      dot.classList.remove("is-visible");
    };

    const updateVariant = (target: EventTarget | null) => {
      if (!(target instanceof Element)) {
        setVariant("idle");
        return;
      }

      if (target.closest(TEXT_SELECTOR)) {
        setVariant("text");
        return;
      }

      if (target.closest(INTERACTIVE_SELECTOR)) {
        setVariant("hover");
        return;
      }

      setVariant("idle");
    };

    const moveDot = () => {
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    };

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      animationFrame = requestAnimationFrame(animateRing);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;

      mouseX = event.clientX;
      mouseY = event.clientY;
      showCursor();
      moveDot();
      updateVariant(event.target);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "touch") setPressed(true);
    };

    const handlePointerUp = () => setPressed(false);

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointerup", handlePointerUp);
    document.documentElement.addEventListener("mouseleave", hideCursor);
    window.addEventListener("blur", hideCursor);
    animationFrame = requestAnimationFrame(animateRing);

    return () => {
      cancelAnimationFrame(animationFrame);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerup", handlePointerUp);
      document.documentElement.removeEventListener("mouseleave", hideCursor);
      window.removeEventListener("blur", hideCursor);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="custom-cursor" aria-hidden="true">
      <div
        ref={ringRef}
        className="custom-cursor__ring"
        data-variant={variant}
        data-pressed={pressed}
      />
      <div
        ref={dotRef}
        className="custom-cursor__dot"
        data-variant={variant}
        data-pressed={pressed}
      />
    </div>
  );
}
