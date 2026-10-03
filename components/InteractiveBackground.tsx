"use client";

import { useEffect, useRef } from "react";

type Particle = { progress: number; lane: number; spread: number; speed: number; size: number; color: number; offsetX: number; offsetY: number };
const tracks = [[18, 30, 12, 24, 16], [26, 14, 32, 10, 18], [12, 22, 18, 32, 16]];

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const rocketHandleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    const handle = rocketHandleRef.current;
    if (!canvas || !context || !handle) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0, height = 0, frame = 0, last = 0, time = 0;
    let particles: Particle[] = [];
    let light = document.documentElement.dataset.theme === "light";
    let scroll = window.scrollY;
    let timelineX = 0, timelineY = 0;
    const pointer = { x: -1000, y: -1000, active: false };
    const rocket = { x:0, y:0, offsetX:0, offsetY:0 };
    let grabbed = false, grabX = 0, grabY = 0;
    let activePointer: number | null = null;
    let keyboardPosition: { x:number; y:number } | null = null;
    const originalCursor = document.documentElement.style.cursor;
    // Cache soft glow sprites instead of applying expensive shadows to every point.
    const sprites = ["110,205,246", "176,153,249", "255,196,120"].map(color => {
      const sprite = document.createElement("canvas");
      sprite.width = sprite.height = 32;
      const ctx = sprite.getContext("2d");
      if (ctx) {
        const glow = ctx.createRadialGradient(16,16,0,16,16,16);
        glow.addColorStop(0, `rgba(${color},1)`);
        glow.addColorStop(0.12, `rgba(${color},.95)`);
        glow.addColorStop(0.35, `rgba(${color},.28)`);
        glow.addColorStop(1, `rgba(${color},0)`);
        ctx.fillStyle = glow;
        ctx.fillRect(0,0,32,32);
      }
      return sprite;
    });
    function resize() {
      if (!canvas || !context) return;
      width = window.innerWidth;
      height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      // Thousands of particles on desktop; a smaller budget on mobile.
      const count = width < 768 ? 1500 : Math.min(6500, Math.max(4200, Math.round(width * height / 220)));
      particles = Array.from({ length: count }, () => ({
        progress: Math.random(), lane: Math.random(),
        spread: (Math.random() - 0.5) * (Math.random() < 0.85 ? 1 : 3),
        speed: 0.015 + Math.random() * 0.025, size: 0.65 + Math.random() ** 3 * 2,
        color: Math.floor(Math.random() * 3), offsetX: 0, offsetY: 0,
      }));
      if (media.matches || document.hidden) draw(0);
    }
    function draw(delta: number) {
      if (!context) return;
      context.clearRect(0, 0, width, height);
      time += delta;
      const timeline = timelineRef.current;
      if (timeline) {
        const ease = media.matches ? 1 : 1 - Math.exp(-delta * 5);
        const targetX = pointer.active && !media.matches ? (pointer.x / width - 0.5) * 32 : 0;
        const targetY = pointer.active && !media.matches ? (pointer.y / height - 0.5) * 20 : 0;
        timelineX += (targetX - timelineX) * ease;
        timelineY += (targetY - timelineY) * ease;
        timeline.style.transform = `translate3d(${timelineX}px,${timelineY}px,0) rotate(${timelineX * 0.06 - 5}deg)`;
        const progress = Math.min(1, Math.max(0, scroll / Math.max(1, document.documentElement.scrollHeight - height)));
        timeline.style.setProperty("--scrub", `${12 + progress * 76}%`);
      }
      const palette = light ? ["34,119,155", "111,83,184", "172,113,43"] : ["110,205,246", "176,153,249", "255,196,120"];
      const radius = width < 768 ? 95 : 155;
      const scrollOffset = Math.sin(scroll / Math.max(height, 1) * 0.6) * 35;
      for (const particle of particles) {
        particle.progress = (particle.progress + delta * particle.speed) % 1;
        const t = particle.progress;
        const x = t * (width + 180) - 90;
        const curve = 0.93 - 0.63 * t + 0.15 * Math.sin(t * Math.PI * 2 + particle.lane * 0.8 + time * 0.12);
        const y = height * curve + (particle.lane - 0.5) * height * 0.22 + particle.spread * height * 0.13 + scrollOffset;
        const dx = x - pointer.x, dy = y - pointer.y;
        const distance = Math.hypot(dx, dy);
        const force = !media.matches && pointer.active && distance < radius ? (1 - distance / radius) ** 2 * 80 : 0;
        const ease = media.matches ? 1 : 1 - Math.exp(-delta * 8);
        particle.offsetX += ((dx / Math.max(distance, 1)) * force - particle.offsetX) * ease;
        particle.offsetY += ((dy / Math.max(distance, 1)) * force - particle.offsetY) * ease;
        const textFade = 0.25 + 0.75 * Math.min(1, Math.max(0, (x / width - 0.32) / 0.3));
        const twinkle = 0.65 + 0.35 * Math.sin(time * 1.8 + particle.lane * 90) ** 2;
        const opacity = textFade * twinkle * (light ? 0.7 : 0.9);
        const px = x + particle.offsetX, py = y + particle.offsetY;
        if (!light) {
          context.globalAlpha = opacity;
          const glowSize = particle.size * 6;
          context.drawImage(sprites[particle.color], px-glowSize/2, py-glowSize/2, glowSize, glowSize);
          context.globalAlpha = 1;
        }
        context.fillStyle = `rgba(${palette[particle.color]},${opacity})`;
        context.beginPath();
        context.arc(px,py,particle.size * 0.5,0,Math.PI * 2);
        context.fill();
      }
      drawRocket(delta);
    }
    function drawRocket(delta: number) {
      if (!context || !handle) return;
      const progress = (0.72 + time * 0.045) % 1;
      const rocketPoint = (t: number) => ({
        x: t * (width + 180) - 90,
        y: height * (0.93 - 0.63 * t + 0.15 * Math.sin(t * Math.PI * 2 + 0.4 + time * 0.12)) + Math.sin(scroll / Math.max(height, 1) * 0.6) * 35,
      });
      const point = rocketPoint(progress), next = rocketPoint(progress + 0.002);
      if (grabbed) {
        rocket.offsetX = pointer.x + grabX - point.x;
        rocket.offsetY = pointer.y + grabY - point.y;
      } else if (keyboardPosition) {
        rocket.offsetX = keyboardPosition.x - point.x;
        rocket.offsetY = keyboardPosition.y - point.y;
      } else if (!media.matches) {
        rocket.offsetX *= Math.exp(-delta * 1.8);
        rocket.offsetY *= Math.exp(-delta * 1.8);
      }
      rocket.x = point.x + rocket.offsetX;
      rocket.y = point.y + rocket.offsetY;
      handle.style.transform = `translate3d(${rocket.x-28}px,${rocket.y-28}px,0)`;
      // Only the visible rocket receives input; links, portraits, and panels keep their controls.
      handle.style.pointerEvents = "none";
      const beneath = document.elementFromPoint(rocket.x,rocket.y);
      const obscured = isBlockedTarget(beneath);
      handle.style.visibility = obscured && !grabbed ? "hidden" : "visible";
      handle.style.pointerEvents = obscured && !grabbed ? "none" : "auto";
      const angle = Math.atan2(next.y - point.y, next.x - point.x);
      // Exhaust follows the curve rather than forming a straight streak.
      for (let index = 1; index <= 18; index++) {
        const behind = progress - index * 0.0025;
        if (behind < 0) break;
        const trail = rocketPoint(behind);
        context.fillStyle = `rgba(255,196,120,${(1 - index / 19) * 0.4})`;
        context.beginPath();
        context.arc(trail.x+rocket.offsetX, trail.y+rocket.offsetY, Math.max(0.5, 2.4 - index * 0.1), 0, Math.PI * 2);
        context.fill();
      }
      context.save();
      context.translate(rocket.x, rocket.y);
      context.rotate(angle);
      const scale = width < 768 ? 0.75 : 1;
      context.scale(scale,scale);
      const flame = 19 + Math.sin(time * 32) * 4;
      context.fillStyle = "#ffc478";
      context.beginPath();
      context.moveTo(-14,-5); context.quadraticCurveTo(-23,-8,-14-flame,0); context.quadraticCurveTo(-23,8,-14,5); context.fill();
      context.fillStyle = "#fff2cb";
      context.beginPath(); context.moveTo(-14,-3); context.lineTo(-27,0); context.lineTo(-14,3); context.fill();
      // Flat illustrated silhouette, aligned to the same curve as the particles.
      context.fillStyle = "#b099f9";
      context.beginPath(); context.moveTo(-4,-7); context.lineTo(-15,-16); context.lineTo(-13,-4); context.closePath(); context.fill();
      context.beginPath(); context.moveTo(-4,7); context.lineTo(-15,16); context.lineTo(-13,4); context.closePath(); context.fill();
      context.fillStyle = "#f7f5ee";
      context.beginPath(); context.moveTo(22,0); context.quadraticCurveTo(8,-12,-14,-7); context.lineTo(-14,7); context.quadraticCurveTo(8,12,22,0); context.fill();
      context.fillStyle = "#6ecdf6";
      context.beginPath(); context.arc(5,0,4.5,0,Math.PI*2); context.fill();
      context.strokeStyle = "#273c58"; context.lineWidth = 2; context.stroke();
      context.restore();
    }
    function tick(now: number) {
      if (now - last < 1000 / 45) { frame = requestAnimationFrame(tick); return; }
      const delta = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      draw(delta);
      frame = requestAnimationFrame(tick);
    }
    function syncAnimation() {
      cancelAnimationFrame(frame);
      last = 0;
      if (!document.hidden && !media.matches) frame = requestAnimationFrame(tick);
      else draw(0);
    }
    function isBlockedTarget(element: Element | null) {
      return element !== handle && Boolean(element?.closest("a,button,input,textarea,dialog,.hero-portrait,.site-header,#services"));
    }
    function hitRocket(x: number, y: number) { return Math.hypot(rocket.x-x,rocket.y-y) < 28; }
    function move(event: PointerEvent) {
      if (activePointer !== null && event.pointerId !== activePointer) return;
      pointer.x = event.clientX; pointer.y = event.clientY; pointer.active = true;
      const interactive = event.target instanceof Element && isBlockedTarget(event.target);
      document.documentElement.style.cursor = grabbed ? "grabbing" : !interactive && hitRocket(pointer.x,pointer.y) ? "grab" : originalCursor;
      if (media.matches && grabbed) draw(0);
    }
    function grab(event: PointerEvent) {
      move(event);
      if (activePointer !== null || event.button !== 0 || event.target instanceof Element && isBlockedTarget(event.target) || !hitRocket(event.clientX,event.clientY)) return;
      grabbed = true; keyboardPosition = null; activePointer = event.pointerId;
      grabX = rocket.x-event.clientX; grabY = rocket.y-event.clientY;
      handle?.setPointerCapture(event.pointerId);
      handle?.classList.add("is-grabbed");
      event.preventDefault();
      document.documentElement.style.cursor = "grabbing";
    }
    function release() {
      const captured = activePointer;
      grabbed = false; activePointer = null;
      if (captured !== null && handle?.hasPointerCapture(captured)) handle.releasePointerCapture(captured);
      handle?.classList.remove("is-grabbed");
      document.documentElement.style.cursor = originalCursor;
    }
    function leave() { pointer.active = false; release(); }
    function touchEnd(event: PointerEvent) { if (activePointer !== null && event.pointerId !== activePointer) return; release(); if (event.pointerType !== "mouse") leave(); }
    function moveWithKeyboard(event: KeyboardEvent) {
      const directions: Record<string, [number,number]> = { ArrowLeft:[-1,0], ArrowRight:[1,0], ArrowUp:[0,-1], ArrowDown:[0,1] };
      const direction = directions[event.key];
      if (direction) {
        event.preventDefault();
        const position = keyboardPosition ?? { x:rocket.x, y:rocket.y };
        const step = event.shiftKey ? 48 : 24;
        keyboardPosition = { x:Math.max(28,Math.min(width-28,position.x+direction[0]*step)), y:Math.max(28,Math.min(height-28,position.y+direction[1]*step)) };
        draw(0);
      } else if (event.key === "Escape" || event.key === "Home") { event.preventDefault(); keyboardPosition = null; release(); if (event.key === "Home") { rocket.offsetX = 0; rocket.offsetY = 0; } draw(0); }
    }
    function resumeFlight() { keyboardPosition = null; }
    function onScroll() {
      scroll = window.scrollY;
      if (media.matches) draw(0);
    }
    function theme() { light = document.documentElement.dataset.theme === "light"; if (media.matches) draw(0); }
    const themeObserver = new MutationObserver(theme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    resize();
    syncAnimation();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", grab);
    handle.addEventListener("keydown", moveWithKeyboard);
    handle.addEventListener("blur", resumeFlight);
    handle.addEventListener("lostpointercapture", release);
    window.addEventListener("pointerup", touchEnd, { passive: true });
    window.addEventListener("pointercancel", leave);
    window.addEventListener("blur", leave);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", syncAnimation);
    media.addEventListener("change", syncAnimation);
    return () => {
      cancelAnimationFrame(frame);
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", grab);
      release();
      handle.removeEventListener("keydown", moveWithKeyboard);
      handle.removeEventListener("blur", resumeFlight);
      handle.removeEventListener("lostpointercapture", release);
      document.documentElement.style.cursor = originalCursor;
      window.removeEventListener("pointerup", touchEnd);
      window.removeEventListener("pointercancel", leave);
      window.removeEventListener("blur", leave);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", syncAnimation);
      media.removeEventListener("change", syncAnimation);
    };
  }, []);
  return <><div className="interactive-background particle-background hybrid-background" aria-hidden="true">
    <canvas ref={canvasRef} data-celestial="rocket" />
    <div ref={timelineRef} className="background-timeline">
      <div className="timeline-header"><span>Picture</span><span>Sound</span><span>Final cut</span></div>
      <div className="timeline-ruler" />
      {tracks.map((clips, track) => <div className={`timeline-track track-${track}`} key={track}>
        {clips.map((width, clip) => <div className="timeline-clip" style={{ flex: width }} key={clip}><span /><span /><span /></div>)}
      </div>)}
      <div className="timeline-waveform">{Array.from({ length: 64 }, (_, index) => <i key={index} style={{ height: `${12 + ((index * 17) % 37)}px` }} />)}</div>
      <div className="timeline-playhead"><span /></div>
    </div>
  </div><div className="rocket-interaction-layer"><button ref={rocketHandleRef} type="button" className="rocket-grab-handle" aria-label="Move rocket" title="Drag the rocket, or use arrow keys to move it. Home resets its position." /></div></>;
}
