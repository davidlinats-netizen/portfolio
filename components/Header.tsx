"use client";

import { Moon, Sun, List, X } from "@phosphor-icons/react";
import { useState } from "react";
import { useTheme } from "./ThemeProvider";

export function Header() {
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  return <header className="site-header" onKeyDown={event => { if (event.key === "Escape") setMenuOpen(false); }}>
    <div className="header-inner container">
      <a className="wordmark" href="#home" aria-label="DAVIID home" onClick={() => setMenuOpen(false)}>DAVIID</a>
      <nav id="main-navigation" className={`main-navigation ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation">
        {[ ["Work", "work"], ["Services", "services"], ["Tools", "tools"], ["Contact", "contact"] ].map(([label, id]) => <a key={id} href={id === "contact" ? "#whatsapp-contact" : `#${id}`} onClick={event => { setMenuOpen(false); if (id === "contact" && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) { event.preventDefault(); history.replaceState(null, "", "#whatsapp-contact"); window.dispatchEvent(new Event("portfolio-contact")); } }}>{label}</a>)}
      </nav>
      <div className="header-actions">
        <button className="icon-button theme-toggle" onClick={toggle} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}><Sun className="sun-icon" size={21} /><Moon className="moon-icon" size={21} /></button>
        <button className="icon-button menu-toggle" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={23} /> : <List size={23} />}</button>
      </div>
    </div>
  </header>;
}
