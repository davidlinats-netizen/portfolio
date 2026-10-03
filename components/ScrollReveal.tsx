"use client";

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";

export function ScrollReveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || !window.IntersectionObserver || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        element.classList.add("reveal-enter");
        observer.disconnect();
      }
    }, { threshold: 0.08 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  // Content is visible by default. Animation is progressive enhancement only.
  return <div ref={ref} className={className} style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}>{children}</div>;
}
