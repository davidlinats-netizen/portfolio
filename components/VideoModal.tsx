"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, X } from "@phosphor-icons/react";
import type { PortfolioVideo } from "@/lib/videos";
import { containDialogFocus } from "@/lib/dialog-focus";

export function VideoModal({ video, onClose }: { video: PortfolioVideo | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [closing, setClosing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!video || !ref.current) return;
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement;
    dialog.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      if (timer.current) clearTimeout(timer.current);
      dialog.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [video]);
  function close() {
    if (closing) return;
    // Removing the iframe stops playback before the exit transition begins.
    setClosing(true);
    timer.current = setTimeout(() => { onClose(); setClosing(false); setLoaded(false); }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 180);
  }
  return <dialog ref={ref} className={`video-dialog ${closing ? "is-closing" : ""}`} aria-labelledby="video-title" onKeyDown={containDialogFocus} onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === ref.current) close(); }}>
    {video && <div className="video-modal-content">
      <div className="dialog-heading"><div><p className="muted">{video.category}</p><h2 id="video-title" className="sr-only">{video.title}</h2></div><button className="icon-button" onClick={close} aria-label="Close video" autoFocus><X size={23} /></button></div>
      <div className="video-player">{!loaded && !closing && <p className="player-loading" role="status">Loading video…</p>}{!closing && <iframe key={video.id} title={video.title} src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&playsinline=1`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" onLoad={() => setLoaded(true)} />}</div>
      <a className="player-fallback" href={`https://youtube.com/shorts/${video.id}`} target="_blank" rel="noopener noreferrer">Not playing? Watch on YouTube <ArrowUpRight size={16} /></a>
    </div>}
  </dialog>;
}
