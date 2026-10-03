import { WhatsAppButton } from "./WhatsAppButton";

import { ScrollReveal } from "./ScrollReveal";

export function Contact() {
  return <section id="contact" className="section contact-section" aria-labelledby="contact-heading"><div className="container">
    <ScrollReveal><p className="eyebrow">Have something in mind?</p><h2 id="contact-heading">Let’s make it<br />worth watching</h2><p className="contact-description">Tell me about your idea, your footage, and what you want to create.</p><div className="contact-actions"><WhatsAppButton /></div></ScrollReveal>
    <footer className="site-footer"><a href="#home" className="wordmark" aria-label="DAVIID home">DAVIID</a><span>Video editing. Human creativity. AI possibilities.</span></footer>
  </div></section>;
}
