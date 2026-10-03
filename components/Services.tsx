"use client";

import { FilmStrip, Sparkle, UserFocus, HouseLine, ArrowsClockwise, Chats } from "@phosphor-icons/react";
import { services } from "@/lib/site-config";
import { ScrollReveal } from "./ScrollReveal";
const icons = [FilmStrip, Sparkle, UserFocus, HouseLine, ArrowsClockwise, Chats];

export function Services() {
  return <section className="section services-section" id="services" aria-labelledby="services-heading"><div className="container services-layout">
    <ScrollReveal className="services-intro"><p className="eyebrow">What I can help with</p><h2 id="services-heading">From raw footage<br />to the final cut</h2><p className="section-description">A strong idea deserves an edit that carries it. Find the right format for yours.</p></ScrollReveal>
    <div className="services-grid">{services.map((service, index) => {
      const Icon = icons[index];
      return <ScrollReveal key={service.title} delay={(index % 2) * 70}>
        <article className="service-item">
          <span className={`service-symbol service-symbol--${service.icon}`} aria-hidden="true">
            <Icon className="service-symbol-glyph" size={34} weight="light" />
            <span className="service-symbol-spark" />
            <span className="service-symbol-dot service-symbol-dot--one" />
            <span className="service-symbol-dot service-symbol-dot--two" />
          </span>
          <h3>{service.title}</h3><p>{service.description}</p>
        </article>
      </ScrollReveal>;
    })}</div>
  </div></section>;
}
