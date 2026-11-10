import { useEffect, useMemo, useState } from "react";
import {
  Archive, ArrowDownWideNarrow, ArrowUpRight, BookOpen, Bookmark,
  CalendarDays, Check, ChevronDown, CircleHelp, Clock3, FileText,
  Filter, FolderOpen, Inbox, Lightbulb, Link2, Menu, MoreHorizontal,
  Plus, Search, Settings2, Sparkles, Tag, Trash2, X, Zap
} from "lucide-react";

const STORAGE_KEY = "esther.items.v1";
const categories = ["Academics", "Research", "Projects", "Career", "Conferences", "Skills", "Personal"];
const types = ["Note", "Study material", "Opportunity", "Conference", "Course", "Project idea", "Research paper", "Link", "Other"];
const statuses = ["Inbox", "To explore", "In progress", "Saved", "Archived"];
const priorities = ["High", "Medium", "Low", "Unassessed"];

function readItems() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}
function formatDate(value) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}
function App() {
  const [items, setItems] = useState(readItems);
  const [view, setView] = useState("Inbox");
  const [query, setQuery] = useState("");
  const [showComposer, setShowComposer] = useState(false);
  const [selected, setSelected] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ title: "", content: "", url: "", category: "Personal", type: "Note", status: "Inbox", priority: "Unassessed", timeCost: "", moneyCost: "", deadline: "" });

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  const visibleItems = useMemo(() => {
    let list = items.filter(item => item.status !== "Archived");
    if (view === "Inbox") list = list.filter(item => item.status === "Inbox");
    else if (view === "Priorities") list = list.filter(item => item.priority === "High" || item.priority === "Medium");
    else if (view === "Saved") list = list.filter(item => item.status === "Saved");
    else if (view === "Notes") list = list.filter(item => item.type === "Note" || item.type === "Study material");
    else if (view === "All items") list = list;
    else list = list.filter(item => item.category === view);
    const needle = query.trim().toLowerCase();
    if (needle) list = list.filter(item => [item.title, item.content, item.url, item.category, item.type, ...(item.tags || [])].join(" ").toLowerCase().includes(needle));
    return [...list].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [items, view, query]);

  const counts = useMemo(() => ({
    Inbox: items.filter(x => x.status === "Inbox").length,
    Priorities: items.filter(x => x.priority === "High" || x.priority === "Medium").length,
    Saved: items.filter(x => x.status === "Saved").length,
    Notes: items.filter(x => x.type === "Note" || x.type === "Study material").length,
    "All items": items.filter(x => x.status !== "Archived").length
  }), [items]);

  function resetForm() {
    setForm({ title: "", content: "", url: "", category: "Personal", type: "Note", status: "Inbox", priority: "Unassessed", timeCost: "", moneyCost: "", deadline: "" });
  }
  function createItem(event) {
    event.preventDefault();
    if (!form.title.trim()) return;
    const now = new Date().toISOString();
    const item = { ...form, id: crypto.randomUUID(), title: form.title.trim(), content: form.content.trim(), url: form.url.trim(), createdAt: now, updatedAt: now, tags: [] };
    setItems(current => [item, ...current]);
    resetForm();
    setShowComposer(false);
    setView("All items");
    setSelected(item.id);
    setToast("Added to your knowledge library.");
  }
  function updateItem(id, patch) {
    setItems(current => current.map(item => item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item));
    setSelected(id);
  }
  function deleteItem(id) {
    setItems(current => current.filter(item => item.id !== id));
    setSelected(null);
    setToast("Item deleted.");
  }
  const activeItem = items.find(item => item.id === selected);

  return (
    <div className="esther-app">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand-row">
          <a className="brand" href="#" onClick={e => { e.preventDefault(); setView("Inbox"); setSelected(null); }}>
            <span className="brand-mark">e.</span><span className="brand-word">esther<span>.</span></span>
          </a>
          <button className="icon-btn mobile-close" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={17}/></button>
        </div>
        <button className="capture-button" onClick={() => { resetForm(); setShowComposer(true); setMobileNav(false); }}><Plus size={17}/> Capture something <span className="capture-shortcut">N</span></button>
        <div className="nav-label">YOUR WORKSPACE</div>
        <nav className="side-nav">
          <NavButton icon={Inbox} label="Inbox" active={view === "Inbox"} count={counts.Inbox} onClick={() => {setView("Inbox");setSelected(null);setMobileNav(false);}}/>
          <NavButton icon={Zap} label="Priorities" active={view === "Priorities"} count={counts.Priorities} onClick={() => {setView("Priorities");setSelected(null);setMobileNav(false);}}/>
          <NavButton icon={Bookmark} label="Saved" active={view === "Saved"} count={counts.Saved} onClick={() => {setView("Saved");setSelected(null);setMobileNav(false);}}/>
          <NavButton icon={BookOpen} label="Notes & study" active={view === "Notes"} count={counts.Notes} onClick={() => {setView("Notes");setSelected(null);setMobileNav(false);}}/>
          <NavButton icon={FolderOpen} label="All items" active={view === "All items"} count={counts["All items"]} onClick={() => {setView("All items");setSelected(null);setMobileNav(false);}}/>
        </nav>
        <div className="nav-label category-label">COLLECTIONS</div>
        <nav className="side-nav category-nav">
          {categories.map((category, index) => <button key={category} className={`nav-item ${view === category ? "active" : ""}`} onClick={() => {setView(category);setSelected(null);setMobileNav(false);}}><span className={`category-dot dot-${index}`}/><span>{category}</span><span className="nav-count">{items.filter(x => x.category === category && x.status !== "Archived").length || ""}</span></button>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="privacy-note"><span className="privacy-icon"><Archive size={13}/></span><span><strong>Your space, your data.</strong><br/>Saved in this browser for now.</span></div>
          <button className="account-row" onClick={() => setToast("Export and sync settings are planned for a later version.")}><span className="account-avatar">A</span><span><strong>Personal workspace</strong><small>Private library</small></span><Settings2 size={15}/></button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-btn mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={18}/></button>
            <span className="crumb-muted">Your space</span><span className="crumb-divider">/</span><strong>{view}</strong>
          </div>
          <div className="topbar-right"><span className="local-indicator"/><span>Private workspace</span><button className="icon-btn help-btn" onClick={() => setToast("Esther v0.1: capture, categorize, search and keep notes. AI sorting and file uploads are next.")} aria-label="Help"><CircleHelp size={16}/></button></div>
        </header>

        <section className="page-content">
          <div className="page-heading">
            <div><div className="eyebrow"><span/> YOUR KNOWLEDGE, IN ONE PLACE</div><h1>{view === "Inbox" ? "A place to put it all." : view === "Priorities" ? "What deserves your attention." : view === "Saved" ? "Worth keeping close." : view === "Notes" ? "Your thinking, collected." : view === "All items" ? "Your knowledge library." : view}</h1><p>{view === "Inbox" ? "Catch the ideas, links and opportunities you don't want to lose." : view === "Priorities" ? "Items you've marked as high or medium priority." : view === "Saved" ? "Resources you want to return to." : "A growing collection of things worth knowing."}</p></div>
            <button className="primary-button" onClick={() => {resetForm();setShowComposer(true);}}><Plus size={16}/> New item</button>
          </div>

          <div className="toolbar">
            <div className="search-box"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your library..." aria-label="Search your library"/>{query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={14}/></button>}<kbd>⌘ K</kbd></div>
            <div className="sort-label"><ArrowDownWideNarrow size={14}/> Recently updated</div>
          </div>

          <div className="collection-meta"><span>{visibleItems.length} {visibleItems.length === 1 ? "ITEM" : "ITEMS"}</span><span className="meta-line"/><span>{view.toUpperCase()}</span></div>

          {visibleItems.length ? <div className="item-grid">
            {visibleItems.map(item => <ItemCard key={item.id} item={item} onClick={() => setSelected(item.id)}/>)}
          </div> : <div className="empty-state">
            <div className="empty-art"><span className="empty-art-ring"/><Lightbulb size={27}/><span className="empty-art-spark">✳</span></div>
            <h2>{query ? "Nothing found just yet." : view === "Inbox" ? "Your inbox is taking a breath." : "A little room to grow."}</h2>
            <p>{query ? "Try another search term or clear your search." : "Save the first useful thing you come across. A link, an idea, a course, a paper. Esther will help you make sense of it."}</p>
            {!query && <button className="secondary-button" onClick={() => {resetForm();setShowComposer(true);}}><Plus size={15}/> Add your first item</button>}
          </div>}
        </section>
        <footer className="footer-note"><Sparkles size={12}/> Collect first. Make sense of it next.</footer>
      </main>

      {showComposer && <div className="modal-backdrop" onMouseDown={e => {if(e.target === e.currentTarget)setShowComposer(false);}}>
        <form className="capture-modal" onSubmit={createItem}>
          <div className="modal-heading"><div><span className="modal-kicker">NEW ENTRY</span><h2>Save a thought.</h2><p>Don't worry about organizing it perfectly. You can change things later.</p></div><button type="button" className="icon-btn" onClick={() => setShowComposer(false)} aria-label="Close"><X size={18}/></button></div>
          <label className="field-label">TITLE <span>Required</span><input autoFocus value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="What did you find?" required/></label>
          <label className="field-label">NOTES / DETAILS<textarea value={form.content} onChange={e => setForm({...form,content:e.target.value})} placeholder="Paste a thought, summary, key details or anything you want to remember..." rows={5}/></label>
          <label className="field-label">SOURCE LINK <span>Optional</span><div className="input-with-icon"><Link2 size={15}/><input type="url" value={form.url} onChange={e => setForm({...form,url:e.target.value})} placeholder="https://..."/></div></label>
          <div className="field-row">
            <label className="field-label">CATEGORY<select value={form.category} onChange={e => setForm({...form,category:e.target.value})}>{categories.map(x=><option key={x}>{x}</option>)}</select></label>
            <label className="field-label">ITEM TYPE<select value={form.type} onChange={e => setForm({...form,type:e.target.value})}>{types.map(x=><option key={x}>{x}</option>)}</select></label>
          </div>
          <div className="field-row">
            <label className="field-label">PRIORITY<select value={form.priority} onChange={e => setForm({...form,priority:e.target.value})}>{priorities.map(x=><option key={x}>{x}</option>)}</select></label>
            <label className="field-label">STATUS<select value={form.status} onChange={e => setForm({...form,status:e.target.value})}>{statuses.filter(x=>x!=="Archived").map(x=><option key={x}>{x}</option>)}</select></label>
          </div>
          <div className="field-row">
            <label className="field-label">TIME COMMITMENT <span>Optional</span><input value={form.timeCost} onChange={e => setForm({...form,timeCost:e.target.value})} placeholder="e.g. 3 hours / week"/></label>
            <label className="field-label">FINANCIAL COST <span>Optional</span><input value={form.moneyCost} onChange={e => setForm({...form,moneyCost:e.target.value})} placeholder="e.g. Free / ₹1,500"/></label>
          </div>
          <div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setShowComposer(false)}>Cancel</button><button className="primary-button" type="submit"><Plus size={15}/> Save to Esther</button></div>
        </form>
      </div>}

      {activeItem && <div className="detail-backdrop" onMouseDown={e => {if(e.target===e.currentTarget)setSelected(null);}}>
        <aside className="detail-panel">
          <div className="detail-top"><span className="modal-kicker">LIBRARY ITEM</span><div><button className="icon-btn" onClick={() => updateItem(activeItem.id,{status:activeItem.status==="Saved"?"Inbox":"Saved"})} title="Toggle saved"><Bookmark size={16} fill={activeItem.status==="Saved"?"currentColor":"none"}/></button><button className="icon-btn danger-icon" onClick={() => deleteItem(activeItem.id)} title="Delete item"><Trash2 size={16}/></button><button className="icon-btn" onClick={() => setSelected(null)} aria-label="Close details"><X size={18}/></button></div></div>
          <div className="detail-scroll">
            <div className="detail-tags"><span className="category-chip">{activeItem.category}</span><span className="type-chip">{activeItem.type}</span></div>
            <h2>{activeItem.title}</h2>
            <div className="detail-date"><Clock3 size={13}/> Added {formatDate(activeItem.createdAt)}</div>
            <label className="field-label detail-label">NOTES<textarea value={activeItem.content} onChange={e=>updateItem(activeItem.id,{content:e.target.value})} rows={9} placeholder="Add your notes here..."/></label>
            {activeItem.url && <a className="source-link" href={activeItem.url} target="_blank" rel="noreferrer"><Link2 size={14}/> Open original source <ArrowUpRight size={13}/></a>}
            <div className="detail-section"><div className="section-heading">ORGANIZE</div><label className="field-label">CATEGORY<select value={activeItem.category} onChange={e=>updateItem(activeItem.id,{category:e.target.value})}>{categories.map(x=><option key={x}>{x}</option>)}</select></label><label className="field-label">TYPE<select value={activeItem.type} onChange={e=>updateItem(activeItem.id,{type:e.target.value})}>{types.map(x=><option key={x}>{x}</option>)}</select></label><label className="field-label">STATUS<select value={activeItem.status} onChange={e=>updateItem(activeItem.id,{status:e.target.value})}>{statuses.map(x=><option key={x}>{x}</option>)}</select></label><label className="field-label">PRIORITY<select value={activeItem.priority} onChange={e=>updateItem(activeItem.id,{priority:e.target.value})}>{priorities.map(x=><option key={x}>{x}</option>)}</select></label></div>
            <div className="detail-section"><div className="section-heading">COMMITMENT</div><label className="field-label">TIME NEEDED<input value={activeItem.timeCost||""} onChange={e=>updateItem(activeItem.id,{timeCost:e.target.value})} placeholder="Not assessed"/></label><label className="field-label">FINANCIAL COST<input value={activeItem.moneyCost||""} onChange={e=>updateItem(activeItem.id,{moneyCost:e.target.value})} placeholder="Not assessed"/></label></div>
            <div className="detail-footnote">Last updated {formatDate(activeItem.updatedAt)}</div>
          </div>
        </aside>
      </div>}
      {toast && <div className="toast"><Check size={15}/>{toast}<button onClick={()=>setToast("")}><X size={13}/></button></div>}
    </div>
  );
}

function NavButton({icon:Icon,label,active,count,onClick}) {
  return <button className={`nav-item ${active?"active":""}`} onClick={onClick}><Icon size={16}/><span>{label}</span><span className="nav-count">{count || ""}</span></button>;
}
function ItemCard({item,onClick}) {
  return <button className="item-card" onClick={onClick}>
    <div className="item-card-top"><span className="type-label">{item.type}</span><MoreHorizontal size={16}/></div>
    <h3>{item.title}</h3>
    <p>{item.content || (item.url ? item.url : "No notes added yet. Open to add details.")}</p>
    <div className="item-card-bottom"><span className="category-label-chip"><Tag size={11}/>{item.category}</span><span className={`priority-label priority-${item.priority.toLowerCase()}`}>{item.priority==="Unassessed"?"Not assessed":item.priority+" priority"}</span></div>
    <div className="item-card-date">{formatDate(item.updatedAt)}</div>
  </button>;
}
export default App;
