"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import { siteConfig } from "@/lib/site-config";

export function WhatsAppButton() {
  const button = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    let settle: ReturnType<typeof setTimeout>;
    let finish: ReturnType<typeof setTimeout>;
    function celebrate() {
      window.removeEventListener("scroll", onScroll);
      const element = button.current;
      if (!element) return;
      element.focus({ preventScroll: true });
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      element.classList.add("contact-celebrate");
      finish = setTimeout(() => element.classList.remove("contact-celebrate"), 1100);
    }
    function onScroll() { clearTimeout(settle); settle = setTimeout(celebrate, 180); }
    function navigate() {
      clearTimeout(finish);
      button.current?.classList.remove("contact-celebrate");
      window.addEventListener("scroll", onScroll, { passive: true });
      button.current?.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
      onScroll();
    }
    window.addEventListener("portfolio-contact", navigate);
    return () => { clearTimeout(settle); clearTimeout(finish); window.removeEventListener("scroll", onScroll); window.removeEventListener("portfolio-contact", navigate); };
  }, []);
  return <a ref={button} id="whatsapp-contact" href={siteConfig.whatsapp || siteConfig.calendly} target="_blank" rel="noopener noreferrer" className="button whatsapp-button">
    {siteConfig.whatsapp ? <><Image src="/assets/logos/whatsapp.webp" alt="" width={23} height={23} />Let’s chat on WhatsApp</> : "Book a project call"}
    {[-1, 1].map(side => <span className={`contact-sparks ${side < 0 ? "left" : "right"}`} aria-hidden="true" key={side}>{Array.from({ length: 6 }, (_, index) => <i key={index} style={{ "--spark-x": `${(Math.cos(index * Math.PI / 3) * 25).toFixed(4)}px`, "--spark-y": `${(Math.sin(index * Math.PI / 3) * 25).toFixed(4)}px` } as CSSProperties} />)}</span>)}
  </a>;
}
