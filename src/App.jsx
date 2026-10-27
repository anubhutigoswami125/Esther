import { useEffect, useRef, useState } from "react";
import {
  ArrowUp, Plus, Search, PanelLeftClose, Sparkles, MessageCircle,
  FolderKanban, Settings2, Github, Paperclip, Command, ChevronDown,
  CircleHelp, Menu, X, ArrowDown, Clock3
} from "lucide-react";

const starters = [
  { title: "Untangle a big idea", detail: "Turn the mess in my head into a clear plan", prompt: "Help me untangle a big idea and turn it into a clear, realistic plan." },
  { title: "Build something", detail: "Think through a project with me", prompt: "Help me plan a small project from idea to working first version." },
  { title: "Learn without the lecture", detail: "Explain a concept in a way that sticks", prompt: "Help me learn a difficult concept through an intuitive explanation and a small active-recall exercise." },
  { title: "Write with intention", detail: "Find the words and sharpen the thinking", prompt: "Help me shape an idea into clear, thoughtful writing. Ask me what I mean before assuming." }
];

const initialMessages = [];

export default function App() {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const inputRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  async function sendMessage(text = draft) {
    const content = text.trim();
    if (!content || busy) return;
    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setDraft("");
    setNotice("");
    setBusy(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Esther couldn't answer just now.");
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setNotice(error.message || "Couldn't reach Esther's brain. Check the server and try again.");
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  function startFresh() {
    setMessages([]);
    setDraft("");
    setNotice("");
    setMenuOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div className="app-shell">
      {sidebarOpen && <aside className="sidebar">
        <div className="sidebar-top">
          <a className="brand" href="#" onClick={(event) => { event.preventDefault(); startFresh(); }}>
            <span className="brand-mark">e.</span>
            <span className="brand-name">esther<span className="brand-period">.</span></span>
          </a>
          <button className="icon-button muted" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)}><PanelLeftClose size={17} /></button>
        </div>

        <button className="new-chat" onClick={startFresh}><Plus size={16} strokeWidth={2.3} /> <span>New conversation</span><span className="shortcut"><Command size={11} /> K</span></button>

        <div className="side-label">YOUR SPACE</div>
        <nav className="nav-list">
          <button className="nav-item active"><MessageCircle size={16} /><span>Conversations</span></button>
          <button className="nav-item" onClick={() => setNotice("Projects are coming in a future build. For now, let's get the conversation working.")}><FolderKanban size={16} /><span>Projects</span><span className="soon">SOON</span></button>
          <button className="nav-item" onClick={() => setNotice("Search will arrive after conversations can be saved.")}><Search size={16} /><span>Search chats</span></button>
        </nav>

        <div className="side-label recent-label">RECENT</div>
        {messages.length > 0
          ? <button className="history-item" onClick={() => inputRef.current?.focus()}><span className="history-dot" />{messages.find(m => m.role === "user")?.content || "Conversation"}</button>
          : <p className="empty-history">Your conversations will find a home here.</p>}

        <div className="sidebar-bottom">
          <div className="profile-card">
            <div className="avatar">A</div>
            <div className="profile-copy"><span className="profile-name">Your workspace</span><span className="profile-plan">A little room to think.</span></div>
            <button className="icon-button muted" aria-label="Workspace settings" onClick={() => setNotice("Workspace settings will be added after the first working version.")}><Settings2 size={16} /></button>
          </div>
          <div className="sidebar-footnote"><span className="tiny-star">✳</span> made for the curious</div>
        </div>
      </aside>}

      <main className="main-panel">
        <header className="topbar">
          <div className="topbar-left">
            {!sidebarOpen && <button className="icon-button" aria-label="Open sidebar" onClick={() => setSidebarOpen(true)}><Menu size={18} /></button>}
            <span className="breadcrumb">Your space</span><span className="crumb-slash">/</span><span className="breadcrumb-current">Conversations</span>
          </div>
          <div className="topbar-right">
            <span className="status-dot" /><span className="status-text">A fresh start</span>
            <span className="topbar-divider" />
            <button className="help-button" onClick={() => setNotice("Esther is in her first build. Chat is the first feature; memory and integrations come next.")}><CircleHelp size={15} /><span>Help</span></button>
          </div>
        </header>

        <section className={`conversation-area ${messages.length ? "has-messages" : ""}`}>
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="welcome-eyebrow"><span className="eyebrow-line" /> A PLACE FOR YOUR THOUGHTS <span className="eyebrow-line" /></div>
              <div className="welcome-symbol"><span className="symbol-spark">✳</span><span className="symbol-ring" /><span className="symbol-dot" /></div>
              <h1>Well, hello<span className="heading-comma">,</span><br /><em>you.</em></h1>
              <p className="welcome-copy">A thought, a question, a half-formed plan.<br />Bring it here. We'll figure it out together.</p>
              <div className="starter-grid">
                {starters.map((item, index) => (
                  <button className="starter-card" key={item.title} onClick={() => sendMessage(item.prompt)}>
                    <span className={`starter-number n${index + 1}`}>0{index + 1}</span>
                    <span className="starter-title">{item.title}</span>
                    <span className="starter-detail">{item.detail}</span>
                    <ArrowUp className="starter-arrow" size={14} />
                  </button>
                ))}
              </div>
              <div className="handwritten-note"><span>no perfect prompts required</span><span className="note-star">✳</span></div>
            </div>
          ) : (
            <div className="messages-wrap">
              <div className="conversation-heading"><span className="conversation-kicker">THE CONVERSATION</span><span className="conversation-rule" /></div>
              {messages.map((message, index) => (
                <article className={`message-row ${message.role}`} key={index}>
                  {message.role === "assistant"
                    ? <div className="message-avatar">e.</div>
                    : <div className="user-avatar">A</div>}
                  <div className="message-body">
                    <div className="message-author">{message.role === "assistant" ? "Esther" : "You"} <span>{message.role === "assistant" ? "your thinking partner" : "just now"}</span></div>
                    <div className="message-content">{message.content}</div>
                  </div>
                </article>
              ))}
              {busy && <article className="message-row assistant"><div className="message-avatar">e.</div><div className="message-body"><div className="message-author">Esther <span>thinking it through</span></div><div className="thinking-dots"><i /><i /><i /></div></div></article>}
              <div ref={endRef} />
            </div>
          )}
        </section>

        <div className="composer-zone">
          {notice && <div className="notice"><span>{notice}</span><button aria-label="Dismiss message" onClick={() => setNotice("")}><X size={14} /></button></div>}
          <form className="composer" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); } }}
              placeholder="What's on your mind?"
              rows={1}
              aria-label="Message Esther"
            />
            <div className="composer-footer">
              <div className="composer-tools">
                <button type="button" className="tool-button" aria-label="Attachments coming soon" onClick={() => setNotice("Attachments are on our roadmap. First, let's make text chat work beautifully.")}><Paperclip size={15} /><span>Attach</span></button>
                <span className="tool-divider" />
                <span className="composer-hint"><span className="keycap">↵</span> to send <span className="hint-separator">·</span> shift + enter for a new line</span>
              </div>
              <button className="send-button" type="submit" disabled={!draft.trim() || busy} aria-label="Send message">{busy ? <span className="send-spinner" /> : <ArrowUp size={17} strokeWidth={2.5} />}</button>
            </div>
          </form>
          <div className="composer-disclaimer"><Sparkles size={11} /> Thoughtful help, not infallible truth. Check important details.</div>
        </div>
      </main>
    </div>
  );
}