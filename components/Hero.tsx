import { siteConfig } from "@/lib/site-config";

import { PortraitCard } from "@/components/PortraitCard";

export function Hero() {
  return <section className="hero" id="home" aria-labelledby="hero-heading">
    <div className="hero-content container">
      <div className="hero-copy">
        <p className="hero-role">Video editor &amp; AI-content creator</p>
        <h1 id="hero-heading"><span>Your ideas</span><span>Worth watching</span></h1>
        <p className="hero-introduction">{siteConfig.introduction}</p>
      </div>
      <PortraitCard />
    </div>
  </section>;
}
