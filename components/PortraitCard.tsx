"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import portrait from "@/Myself/My picture.png";
import { siteConfig } from "@/lib/site-config";

export function PortraitCard() {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [suppressed, setSuppressed] = useState(false);
  const [flipFrom, setFlipFrom] = useState<number | null>(null);
  const showBio = pinned || ((hovered || focused) && !suppressed);

  return <div className="hero-portrait">
    <button
      type="button"
      className="portrait-card"
      aria-label={`Meet ${siteConfig.name}`}
      aria-describedby="portrait-bio portrait-hint"
      aria-pressed={showBio}
      onPointerEnter={event => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={() => { setHovered(false); setSuppressed(false); }}
      onFocus={event => setFocused(event.currentTarget.matches(":focus-visible"))}
      onBlur={() => { setFocused(false); setPinned(false); setSuppressed(false); }}
      onKeyDown={event => {
        if (event.key === "Escape") { setPinned(false); setSuppressed(true); }
      }}
      onClick={event => {
        if (flipFrom !== null) return;
        const touch = event.detail > 0 && !window.matchMedia("(hover: hover)").matches;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (touch || reducedMotion) {
          setPinned(!showBio);
          setSuppressed(true);
          return;
        }
        setFlipFrom(showBio ? 180 : 0);
        setPinned(false);
        setSuppressed(true);
      }}
    >
      <span className="portrait-card-motion">
        <span
          className={`portrait-card-inner${showBio ? " is-revealed" : ""}${flipFrom !== null ? " is-flipping" : ""}`}
          style={{ "--flip-from": `${flipFrom ?? 0}deg` } as CSSProperties}
          onAnimationEnd={event => {
            if (event.target === event.currentTarget && event.animationName === "portrait-flip") setFlipFrom(null);
          }}
        >
        <span className="portrait-face portrait-front" aria-hidden={showBio}>
          <Image src={portrait} alt="DAVIID wearing glasses and a dark blazer" fill sizes="(max-width: 767px) 300px, (max-width: 1100px) 30vw, 340px" placeholder="blur" loading="eager" />
          <span className="portrait-caption"><span>{siteConfig.name}</span><span>Behind the edits</span></span>
        </span>
        <span className="portrait-face portrait-back" aria-hidden={!showBio}>
          <span className="portrait-eyebrow">Behind the edits</span>
          <span className="portrait-name"><span className="portrait-wave" aria-hidden="true">👋</span><span>I’m daviid</span></span>
          <span className="portrait-role">Video Editor specializing in AI Ads for DTC Brands, Vibe Coder</span>
          <span className="portrait-bio" id="portrait-bio">I create <strong>AI-powered video ads for DTC brands</strong>, with a focus on AI UGC and promotional creatives for TikTok and Meta.</span>
        </span>
        </span>
      </span>
    </button>
    <p className="portrait-hint" id="portrait-hint"><span className="portrait-desktop-hint">Hover to meet me · Click to flip back</span><span className="portrait-touch-hint">Tap to meet me · Tap again to flip back</span></p>
  </div>;
}
