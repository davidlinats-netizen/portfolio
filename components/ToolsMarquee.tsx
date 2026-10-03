"use client";

import Image from "next/image";
import { toolLogos } from "@/lib/site-config";
import { Marquee } from "./Marquee";
import { ScrollReveal } from "./ScrollReveal";

export function ToolsMarquee() {
  return <section id="tools" className="section tools-section" aria-labelledby="tools-heading"><div className="container tools-heading"><ScrollReveal><h2 id="tools-heading">Tools I’ve used</h2></ScrollReveal></div>
    <Marquee direction="left" paused={false} label="Creative tools" className="tools-marquee" renderItems={duplicate => toolLogos.map(tool => <div key={tool.file} className="tool-logo" tabIndex={duplicate ? -1 : 0} role="group" aria-label={duplicate ? undefined : tool.name}><Image src={`/assets/logos/${tool.file}`} alt="" width={64} height={64} /><span className="tool-name" aria-hidden="true">{tool.name}</span></div>)} />
  </section>;
}
