"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Markdown from "react-markdown";
import { ChatCircleDots, Sparkle, FilmStrip, Play, X, ArrowUp, ArrowUpRight, ArrowCounterClockwise } from "@phosphor-icons/react";
import { siteConfig } from "@/lib/site-config";
import { findVideo, validVideoIds } from "@/lib/videos";
import { usePortfolio } from "./PortfolioProvider";
import { containDialogFocus } from "@/lib/dialog-focus";

type Message = { role: "user" | "assistant"; content: string; videoIds?: string[]; offerContact?: boolean };
const questions = ["Show me real estate edits", "What services do you offer?", "I need a product ad"];
const questionIcons = [FilmStrip, ChatCircleDots, Sparkle];
export function PortfolioAssistant() {
  const dialog = useRef<HTMLDialogElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const transcript = useRef<HTMLDivElement>(null);
  const abort = useRef<AbortController | null>(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<"checking" | "ready" | "unavailable">("checking");
  const [connectionAttempt, setConnectionAttempt] = useState(0);
  const [error, setError] = useState("");
  const { openVideo } = usePortfolio();
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => { setAvailability("unavailable"); controller.abort(); }, 5000);
    fetch("/api/chat", { signal: controller.signal }).then(response => response.json()).then(data => setAvailability(data.available ? "ready" : "unavailable")).catch(() => { if (!controller.signal.aborted) setAvailability("unavailable"); }).finally(() => clearTimeout(timeout));
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [open, connectionAttempt]);
  useEffect(() => { transcript.current?.scrollTo({ top: transcript.current.scrollHeight, behavior: "instant" }); }, [messages, loading, error]);
  useEffect(() => () => abort.current?.abort(), []);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  function show() { dialog.current?.showModal(); setOpen(true); }
  function close() { abort.current?.abort(); dialog.current?.close(); setOpen(false); setLoading(false); launcher.current?.focus(); }
  async function send(text: string) {
    if (!text.trim() || loading || availability !== "ready") return;
    const userMessage: Message = { role: "user", content: text.trim() };
    // A failed visitor message is replaced by the next attempt so roles still alternate.
    const history = messages.at(-1)?.role === "user" ? messages.slice(0, -1) : messages;
    const next = [...history, userMessage];
    let context = next.slice(-9);
    while (context.length > 1 && (context[0].role !== "user" || context.reduce((n, message) => n + message.content.length, 0) > 8000)) context = context.slice(1);
    setMessages(next); setDraft(""); setError(""); setLoading(true);
    const controller = new AbortController(); abort.current = controller;
    const timer = setTimeout(() => controller.abort(), 25_000);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shownVideoIds: [...new Set(history.flatMap(message => message.videoIds ?? []))], messages: context.map(({ role, content }) => ({ role, content })) }), signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The assistant is unavailable. Please try again.");
      if (typeof data.answer !== "string" || !Array.isArray(data.videoIds)) throw new Error("The reply couldn’t be read. Please try again.");
      setMessages(current => [...current, { role: "assistant", content: data.answer, videoIds: validVideoIds(data.videoIds.filter((id: unknown) => typeof id === "string")), offerContact: Boolean(data.offerContact) }]);
    } catch (caught) {
      if (dialog.current?.open) setError(controller.signal.aborted ? "The reply took too long. Please try again or contact DAVIID directly." : caught instanceof Error ? caught.message : "The assistant couldn’t connect. Please try again.");
    } finally { clearTimeout(timer); setLoading(false); }
  }
  function submit(event: FormEvent) { event.preventDefault(); void send(draft); }
  function play(id: string) { close(); requestAnimationFrame(() => openVideo(id)); }
  return <>
    <button ref={launcher} className="assistant-launcher" aria-label="Ask about my work: open AI portfolio assistant" aria-haspopup="dialog" aria-expanded={open} onClick={show}>
      <span className="assistant-launcher-orb" aria-hidden="true"><Sparkle size={22} weight="fill" /></span>
      <span className="assistant-launcher-copy"><span>Ask about my work</span><span>AI portfolio assistant</span></span>
      <ArrowUpRight size={17} aria-hidden="true" />
    </button>
    <dialog ref={dialog} className="chat-dialog" aria-labelledby="chat-title" onKeyDown={containDialogFocus} onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === dialog.current) close(); }}>
      <div className="chat-shell"><header className="chat-header">
        <div className="chat-avatar" aria-hidden="true"><Sparkle size={23} weight="fill" /></div>
        <div className="chat-heading"><h2 id="chat-title">DAVIID’s assistant</h2><p className={`chat-connection chat-connection--${availability}`}><span aria-hidden="true" />{availability === "ready" ? "Ready to help" : availability === "checking" ? "Connecting…" : "Connection unavailable"}</p></div>
        <button className="icon-button" aria-label="Start a new conversation" disabled={loading} onClick={() => { setMessages([]); setDraft(""); setError(""); input.current?.focus(); }}><ArrowCounterClockwise size={18} aria-hidden="true" /></button>
        <button className="icon-button" aria-label="Close AI assistant" onClick={close} autoFocus><X size={21} aria-hidden="true" /></button>
      </header>
      <div className="chat-transcript" ref={transcript} role="log" aria-live="polite" aria-relevant="additions text">
        {messages.length === 0 && <div className="chat-welcome">
          <div className="chat-welcome-orbit" aria-hidden="true"><span className="chat-orbit-ring" /><span className="chat-orbit-core"><Sparkle size={30} weight="fill" /></span><span className="chat-orbit-star" /></div>
          <h3>Your next edit<br />starts here.</h3><p>I’m DAVIID’s AI assistant. Explore the work, find your style, or talk through a project idea.</p>
        </div>}
        {availability === "checking" && <p className="chat-notice" role="status">Checking assistant connection…</p>}
        {availability === "unavailable" && <div className="chat-notice" role="status"><strong>The assistant isn’t connected right now.</strong><p>You can explore all 16 edits on the page, or contact DAVIID through the contact section on the page.</p><button className="text-link" onClick={() => { setAvailability("checking"); setConnectionAttempt(attempt => attempt + 1); }}>Try connection again</button></div>}
        {messages.length === 0 && availability === "ready" && <div className="suggested-questions">{questions.map((question, index) => {
          const Icon = questionIcons[index];
          return <button key={question} onClick={() => void send(question)}><span className="question-symbol" aria-hidden="true"><Icon size={19} /></span><span>{question}</span><ArrowUpRight size={15} aria-hidden="true" /></button>;
        })}</div>}
        {messages.map((message, index) => <div key={index} className={`chat-message ${message.role}`}><span className="chat-message-author">{message.role === "user" ? "You" : <><Sparkle size={12} weight="fill" aria-hidden="true" />DAVIID’s assistant</>}</span>{message.role === "assistant" ? <div className="chat-markdown"><Markdown skipHtml disallowedElements={["img", "a"]} unwrapDisallowed>{message.content}</Markdown></div> : <p>{message.content}</p>}{message.videoIds?.map(id => { const video = findVideo(id); return video ? <button className="sample-button" key={id} onClick={() => play(id)}><Play size={15} weight="fill" aria-hidden="true" /><span>{video.title}</span><ArrowUpRight size={14} aria-hidden="true" /></button> : null; })}{message.offerContact && <a className="chat-inline-contact" href={siteConfig.whatsapp || siteConfig.calendly} target="_blank" rel="noopener noreferrer">Continue with DAVIID <ArrowUpRight size={14} aria-hidden="true" /></a>}</div>)}
        {loading && <div className="chat-loading" role="status"><span className="chat-thinking-bars" aria-hidden="true"><i /><i /><i /></span><span>Thinking…</span></div>}
        {error && <p className="chat-error" role="alert">{error}</p>}
      </div>
      <div className="chat-compose"><form className="chat-form" onSubmit={submit}><label className="sr-only" htmlFor="chat-message">Your message</label><textarea id="chat-message" ref={input} rows={1} maxLength={1000} placeholder={availability === "ready" ? "Tell me what you have in mind…" : availability === "checking" ? "Connecting to the assistant…" : "Assistant currently unavailable"} value={draft} disabled={availability !== "ready"} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(draft); } }} /><button type="submit" aria-label="Send message" disabled={loading || !draft.trim() || availability !== "ready"}><ArrowUp size={20} aria-hidden="true" /></button></form><p className="chat-compose-hint">Enter to send <span aria-hidden="true">·</span> Shift + Enter for a new line</p></div>
      </div>
    </dialog>
  </>;
}
