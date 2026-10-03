"use client";

import { useEffect, useRef } from "react";

type Particle = { progress: number; lane: number; spread: number; speed: number; size: number; color: number; offsetX: number; offsetY: number };
const tracks = [[18, 30, 12, 24, 16], [26, 14, 32, 10, 18], [12, 22, 18, 32, 16]];

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0, height = 0, frame = 0, last = 0, time = 0;
    let particles: Particle[] = [];
    let light = document.documentElement.dataset.theme === "light";
    let scroll = window.scrollY;
    let timelineX = 0, timelineY = 0;
    const pointer = { x: -1000, y: -1000, active: false };
    const meteors = Array.from({ length: 3 }, () => ({ x:0, y:0, offsetX:0, offsetY:0, size:0 }));
    let grabbed = -1, grabX = 0, grabY = 0;
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
      drawRocket();
      drawMeteors(delta);
    }
    function drawMeteors(delta: number) {
      if (!context) return;
      for (let index = 0; index < 3; index++) {
        const phase = (time * (0.038 + index * 0.006) + index * 0.33) % 1;
        const naturalX = width * (0.35 + phase * 0.85);
        const naturalY = height * (-0.15 + phase * 1.25 + index * 0.12);
        const meteor = meteors[index];
        if (grabbed === index) {
          meteor.offsetX = pointer.x + grabX - naturalX;
          meteor.offsetY = pointer.y + grabY - naturalY;
        } else if (!media.matches) {
          meteor.offsetX *= Math.exp(-delta * 1.8);
          meteor.offsetY *= Math.exp(-delta * 1.8);
        }
        const x = naturalX + meteor.offsetX, y = naturalY + meteor.offsetY;
        meteor.x = x; meteor.y = y;
        const size = width < 768 ? 8 : 11 + index * 2;
        meteor.size = size;
        const trail = size * (5 + Math.sin(time * 14 + index) * 0.35);
        context.save();
        context.translate(x,y);
        context.rotate(Math.atan2(height * 1.25,width * 0.85));
        // Layered, pointed flames and cratered rock in a flat cartoon style.
        context.fillStyle = "#f06432";
        context.beginPath();
        context.moveTo(size*.4,-size);
        context.lineTo(-trail*.64,-size*1.35); context.lineTo(-trail*.42,-size*.55);
        context.lineTo(-trail,-size*.45); context.lineTo(-trail*.66,size*.05);
        context.lineTo(-trail*.87,size*.55); context.lineTo(-trail*.43,size*.6);
        context.lineTo(-trail*.63,size*1.2); context.lineTo(0,size);
        context.quadraticCurveTo(size*1.5,size*.7,size*.4,-size); context.fill();
        context.fillStyle = "#ffb33c";
        context.beginPath(); context.moveTo(0,-size*.8);
        context.lineTo(-trail*.65,-size*.7); context.lineTo(-trail*.4,-size*.15);
        context.lineTo(-trail*.8,size*.1); context.lineTo(-trail*.36,size*.35);
        context.lineTo(-trail*.49,size*.75); context.lineTo(0,size*.8);
        context.closePath(); context.fill();
        context.fillStyle = "#ffe477";
        context.beginPath(); context.moveTo(0,-size*.5); context.lineTo(-trail*.53,0);
        context.lineTo(-trail*.26,size*.2); context.lineTo(0,size*.55); context.fill();
        context.fillStyle = "#a48a6e"; context.strokeStyle = "#675a50"; context.lineWidth = 1.5;
        context.beginPath(); context.ellipse(0,0,size,size*.87,.2,0,Math.PI*2); context.fill(); context.stroke();
        context.fillStyle = "#6e5d50";
        for (const [cx,cy,r] of [[-.3,-.25,.29],[.38,.2,.2],[-.25,.45,.14]]) {
          context.beginPath(); context.arc(cx*size,cy*size,r*size,0,Math.PI*2); context.fill();
        }
        context.strokeStyle = "#d2b48b";
        context.beginPath(); context.arc(0,0,size*.75,-1.5,.1); context.stroke();
        context.fillStyle = "#ffb33c";
        for (let spark=0;spark<3;spark++) {
          context.beginPath(); context.ellipse(-trail*(.35+spark*.24),size*(spark%2 ? -1.5 : 1.3),3,1,-.25,0,Math.PI*2); context.fill();
        }
        context.restore();
      }
    }
    function drawRocket() {
      if (!context) return;
      const progress = (0.72 + time * 0.045) % 1;
      const rocketPoint = (t: number) => ({
        x: t * (width + 180) - 90,
        y: height * (0.93 - 0.63 * t + 0.15 * Math.sin(t * Math.PI * 2 + 0.4 + time * 0.12)) + Math.sin(scroll / Math.max(height, 1) * 0.6) * 35,
      });
      const point = rocketPoint(progress), next = rocketPoint(progress + 0.002);
      const angle = Math.atan2(next.y - point.y, next.x - point.x);
      // Exhaust follows the curve rather than forming a straight streak.
      for (let index = 1; index <= 18; index++) {
        const behind = progress - index * 0.0025;
        if (behind < 0) break;
        const trail = rocketPoint(behind);
        context.fillStyle = `rgba(255,196,120,${(1 - index / 19) * 0.4})`;
        context.beginPath();
        context.arc(trail.x, trail.y, Math.max(0.5, 2.4 - index * 0.1), 0, Math.PI * 2);
        context.fill();
      }
      context.save();
      context.translate(point.x, point.y);
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
    function hitMeteor(x: number, y: number) { return meteors.findIndex(meteor => Math.hypot(meteor.x-x,meteor.y-y) < meteor.size + 12); }
    function move(event: PointerEvent) {
      pointer.x = event.clientX; pointer.y = event.clientY; pointer.active = true;
      const interactive = event.target instanceof Element && event.target.closest("a,button,input,textarea,dialog");
      document.documentElement.style.cursor = grabbed >= 0 ? "grabbing" : !interactive && hitMeteor(pointer.x,pointer.y) >= 0 ? "grab" : originalCursor;
      if (media.matches && grabbed >= 0) draw(0);
    }
    function grab(event: PointerEvent) {
      move(event);
      if (event.button !== 0 || event.target instanceof Element && event.target.closest("a,button,input,textarea,dialog")) return;
      grabbed = hitMeteor(event.clientX,event.clientY);
      if (grabbed < 0) return;
      const meteor = meteors[grabbed];
      grabX = meteor.x-event.clientX; grabY = meteor.y-event.clientY;
      event.preventDefault();
      document.documentElement.style.cursor = "grabbing";
    }
    function release() { grabbed = -1; document.documentElement.style.cursor = originalCursor; }
    function leave() { pointer.active = false; release(); }
    function touchEnd(event: PointerEvent) { release(); if (event.pointerType !== "mouse") leave(); }
    function preventDragScroll(event: TouchEvent) { if (grabbed >= 0) event.preventDefault(); }
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
    window.addEventListener("touchmove", preventDragScroll, { passive:false });
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
      window.removeEventListener("touchmove", preventDragScroll);
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
  return <div className="interactive-background particle-background hybrid-background" aria-hidden="true">
    <canvas ref={canvasRef} />
    <div ref={timelineRef} className="background-timeline">
      <div className="timeline-header"><span>Picture</span><span>Sound</span><span>Final cut</span></div>
      <div className="timeline-ruler" />
      {tracks.map((clips, track) => <div className={`timeline-track track-${track}`} key={track}>
        {clips.map((width, clip) => <div className="timeline-clip" style={{ flex: width }} key={clip}><span /><span /><span /></div>)}
      </div>)}
      <div className="timeline-waveform">{Array.from({ length: 64 }, (_, index) => <i key={index} style={{ height: `${12 + ((index * 17) % 37)}px` }} />)}</div>
      <div className="timeline-playhead"><span /></div>
    </div>
  </div>;
}
