import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  ChevronDownIcon,
  Clock01Icon,
  CommandIcon,
  Edit02Icon,
  FilterIcon,
  Home03Icon,
  Menu01Icon,
  PlusSignIcon,
  Search01Icon,
  Settings02Icon,
  SparklesIcon,
  UserGroupIcon,
  Wallet03Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";

export const Route = createFileRoute("/$slug/")({
  component: WeddingWorkspaceHome,
});

type Action = { id: number; title: string; detail: string; label: string; tone: string };

const navItems = [
  { label: "Overview", icon: Home03Icon },
  { label: "Plan", icon: CheckmarkCircle02Icon },
  { label: "Guests", icon: UserGroupIcon },
  { label: "Budget", icon: Wallet03Icon },
  { label: "Vendors", icon: SparklesIcon },
];

const domains = [
  { name: "Timeline", detail: "12 of 18 moments placed", progress: 68, tone: "olive", icon: Clock01Icon },
  { name: "Guests", detail: "64 invited · 48 responded", progress: 75, tone: "sand", icon: UserGroupIcon },
  { name: "Budget", detail: "$18,420 remaining", progress: 54, tone: "terra", icon: Wallet03Icon },
  { name: "Vendors", detail: "7 booked · 3 to review", progress: 70, tone: "blue", icon: SparklesIcon },
];

const moments = [
  { date: "MAR 18", title: "Venue walk-through", detail: "Villa Cimbrone · 10:30 AM", active: true },
  { date: "APR 02", title: "Invitations go out", detail: "A quiet little milestone" },
  { date: "MAY 11", title: "Menu tasting", detail: "With Osteria Francescana" },
  { date: "SEP 14", title: "The day itself", detail: "Ravello, Italy" },
];

function WeddingWorkspaceHome() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [isCommandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [actions, setActions] = useState<Action[]>([
    { id: 1, title: "Choose your ceremony music", detail: "A small decision that sets the tone", label: "Design", tone: "olive" },
    { id: 2, title: "Review the photographer shortlist", detail: "3 proposals waiting for your thoughts", label: "Vendors", tone: "terra" },
    { id: 3, title: "Add dietary notes for your guests", detail: "12 guests still need a little attention", label: "Guests", tone: "blue" },
  ]);

  const commandItems = useMemo(() => {
    const items = ["Add a task", "Add a guest", "Save an inspiration", "Record a payment", "Invite someone"];
    return items.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const dismissAction = (id: number) => setActions((items) => items.filter((item) => item.id !== id));

  return (
    <main className="morrow-app">
      <aside className="studio-rail">
        <div className="brand-mark">M<span>•</span></div>
        <div className="rail-label">WEDDING<br />STUDIO</div>
        <nav className="rail-nav" aria-label="Workspace navigation">
          {navItems.map((item) => (
            <button key={item.label} className={`rail-link ${activeNav === item.label ? "is-active" : ""}`} onClick={() => setActiveNav(item.label)}>
              <HugeiconsIcon icon={item.icon} size={18} strokeWidth={1.5} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="rail-bottom">
          <button className="rail-link"><HugeiconsIcon icon={Settings02Icon} size={18} strokeWidth={1.5} /><span>Settings</span></button>
          <div className="profile-chip"><span className="profile-initials">J&amp;A</span><span className="online-dot" /></div>
        </div>
      </aside>

      <section className="workspace-content">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark">M<span>•</span></span><span>JUNE &amp; ALEX</span></div>
          <div className="crumb"><span>JUNE &amp; ALEX</span><HugeiconsIcon icon={ChevronDownIcon} size={14} /></div>
          <div className="topbar-actions">
            <button className="command-trigger" onClick={() => setCommandOpen(true)}><HugeiconsIcon icon={Search01Icon} size={16} /><span>Search anything</span><kbd>⌘ K</kbd></button>
            <button className="icon-button" aria-label="Open menu"><HugeiconsIcon icon={Menu01Icon} size={19} /></button>
          </div>
        </header>

        <div className="page-wrap">
          <section className="intro-row">
            <div>
              <p className="eyebrow">SATURDAY, SEPTEMBER 14, 2025 · RAVELLO, ITALY</p>
              <h1>Good morning, <em>June &amp; Alex.</em></h1>
              <p className="intro-copy">A beautiful day is taking shape. Here&apos;s what feels most useful right now.</p>
            </div>
            <div className="countdown"><span className="countdown-number">218</span><span className="countdown-label">DAYS TO GO</span></div>
          </section>

          <section className="hero-panel">
            <div className="hero-image"><img src="/morrow-estate.png" alt="Sunlit stone estate in Ravello" /><div className="image-caption">Villa Cimbrone <span>·</span> Ravello</div></div>
            <div className="hero-copy">
              <div className="hero-kicker"><span className="line" /> YOUR WEDDING, IN FOCUS</div>
              <h2>The shape<br />of your <i>day.</i></h2>
              <p>Unhurried, sunlit, and a little bit unexpected. Your choices are beginning to tell a story that feels unmistakably yours.</p>
              <div className="palette"><span className="palette-label">YOUR PALETTE</span><span className="swatch swatch-1" /><span className="swatch swatch-2" /><span className="swatch swatch-3" /><span className="swatch swatch-4" /><button aria-label="Edit wedding identity"><HugeiconsIcon icon={Edit02Icon} size={14} /></button></div>
            </div>
          </section>

          <section className="today-section">
            <div className="section-heading"><div><p className="eyebrow">A LITTLE MOMENTUM</p><h2>Today</h2></div><button className="text-action" onClick={() => setCommandOpen(true)}>Quick add <HugeiconsIcon icon={PlusSignIcon} size={15} /></button></div>
            <div className="action-list">
              {actions.length === 0 ? <div className="empty-actions">You&apos;re all caught up for now.</div> : actions.map((action) => (
                <article className="action-row" key={action.id}><span className={`action-dot ${action.tone}`} /><div className="action-main"><h3>{action.title}</h3><p>{action.detail}</p></div><span className={`category-tag ${action.tone}`}>{action.label}</span><button className="dismiss-button" onClick={() => dismissAction(action.id)} aria-label={`Dismiss ${action.title}`}><HugeiconsIcon icon={Cancel01Icon} size={15} /></button><HugeiconsIcon icon={ArrowUpRight01Icon} className="row-arrow" size={17} /></article>
              ))}
            </div>
          </section>

          <section className="pulse-section"><div className="section-heading"><div><p className="eyebrow">THE BIG PICTURE</p><h2>Planning pulse</h2></div><button className="filter-button"><HugeiconsIcon icon={FilterIcon} size={15} /> All areas</button></div><div className="domain-grid">{domains.map((domain) => <article className="domain-card" key={domain.name}><div className={`domain-icon ${domain.tone}`}><HugeiconsIcon icon={domain.icon} size={19} /></div><div className="domain-top"><h3>{domain.name}</h3><HugeiconsIcon icon={ArrowUpRight01Icon} size={16} /></div><p>{domain.detail}</p><div className="progress-line"><span className={domain.tone} style={{ width: `${domain.progress}%` }} /></div><span className="progress-number">{domain.progress}% considered</span></article>)}</div></section>

          <section className="bottom-grid"><div className="moments-panel"><div className="section-heading compact"><div><p className="eyebrow">ON THE HORIZON</p><h2>Upcoming moments</h2></div><button className="icon-button"><HugeiconsIcon icon={Calendar03Icon} size={18} /></button></div><div className="moment-list">{moments.map((moment) => <div className={`moment ${moment.active ? "active" : ""}`} key={moment.date}><span className="moment-date">{moment.date}</span><div className="moment-marker" /><div><h3>{moment.title}</h3><p>{moment.detail}</p></div></div>)}</div></div><div className="note-panel"><div className="note-top"><p className="eyebrow">FROM YOUR SHARED NOTES</p><HugeiconsIcon icon={SparklesIcon} size={18} /></div><blockquote>“We want the day to feel like a long lunch with our favorite people — nothing too precious.”</blockquote><div className="note-footer"><span className="note-avatar">A</span><span>Alex added this <b>2 days ago</b></span><button aria-label="Open shared notes"><HugeiconsIcon icon={ArrowUpRight01Icon} size={16} /></button></div></div></section>
          <footer className="page-footer"><span>Made for the in-between moments.</span><span>Last saved just now</span></footer>
        </div>
      </section>

      {isCommandOpen && <div className="command-overlay" role="presentation" onMouseDown={() => setCommandOpen(false)}><div className="command-modal" role="dialog" aria-modal="true" aria-label="Quick add" onMouseDown={(event) => event.stopPropagation()}><div className="command-input"><HugeiconsIcon icon={Search01Icon} size={18} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="What would you like to add?" /><kbd>ESC</kbd></div><div className="command-results">{commandItems.map((item, index) => <button key={item} onClick={() => { setCommandOpen(false); setQuery(""); }}><span className="command-key">{index + 1}</span>{item}<HugeiconsIcon icon={ArrowUpRight01Icon} size={15} /></button>)}{commandItems.length === 0 && <p className="no-results">Nothing found. Try another phrase.</p>}</div><div className="command-hint"><HugeiconsIcon icon={CommandIcon} size={13} /> Quick actions stay local in this concept</div></div></div>}
    </main>
  );
}
