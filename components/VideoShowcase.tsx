"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import { categories, videos, type Category, type PortfolioVideo } from "@/lib/videos";
import { usePortfolio } from "./PortfolioProvider";
import { Marquee } from "./Marquee";

function VideoCard({ video, index, duplicate }: { video: PortfolioVideo; index: number; duplicate: boolean }) {
  const { openVideo } = usePortfolio();
  return <a className="video-card" tabIndex={duplicate ? -1 : 0} href={`https://youtube.com/shorts/${video.id}`} onClick={event => { if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return; event.preventDefault(); openVideo(video.id); }}>
    <span className="sr-only">Play {video.title}, sample {index + 1}</span>
    <div className="video-thumbnail"><Image src={`/assets/posters/${video.id}.jpg`} alt="" fill sizes="(max-width: 767px) 72vw, 300px" /></div>
    <div className="video-caption"><p>{video.category}</p><ArrowUpRight size={20} aria-hidden="true" /></div>
  </a>;
}

export function VideoShowcase() {
  const [category, setCategory] = useState<Category | "All">("All");
  const controllerRef = useRef<((direction: number) => void) | null>(null);
  const { videoId } = usePortfolio();
  const filtered = category === "All" ? videos : videos.filter(video => video.category === category);
  function browse(direction: number) { controllerRef.current?.(direction); }
  return <section id="work" className="section work-section" aria-labelledby="work-heading">
    <div className="container">
      <div className="section-title-row"><div><p className="eyebrow">Selected work</p><h2 id="work-heading">Small screen.<br />Big impression.</h2></div><p className="work-introduction">Different formats. The same attention to every frame. <br />Pick a category and find your next inspiration.</p></div>
      <div className="work-toolbar"><div className="category-filters" role="group" aria-label="Filter videos by category">{(["All", ...categories] as const).map(item => <button key={item} className="filter-button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
    </div>
    <div className="gallery-shell container">
      <Marquee key={category} direction="right" speed={55} pauseOnHover={false} paused={Boolean(videoId)} label="Video samples" className="video-marquee" controllerRef={controllerRef} renderItems={duplicate => filtered.map((video, index) => <VideoCard key={video.id} video={video} index={index} duplicate={duplicate} />)} />
      <div className="work-footer"><span aria-live="polite">{category === "All" ? "All categories" : category}</span><div className="gallery-controls"><button className="icon-button" aria-label="Previous videos" onClick={() => browse(-1)}><ArrowLeft size={22} /></button><button className="icon-button" aria-label="Next videos" onClick={() => browse(1)}><ArrowRight size={22} /></button></div></div>
    </div>
  </section>;
}

