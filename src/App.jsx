
import React, { useState, useEffect } from 'react';
import sampleTools from './data/tools_catalog.json';

function matchIntent(intent) {
  const q = intent.toLowerCase();
  if (!q.trim()) return [];
  return sampleTools.filter(t => {
    const fields = [
      t.name,
      t.description,
      ...(t.badges || []),
      ...(t.categories || []),
      ...(t.platforms || [])
    ].filter(Boolean);
    return fields.some(field => field.toLowerCase().includes(q));
  });
}

const GradientText = ({ children }) => (
  <span className="bg-gradient-to-r from-brand-500 via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
    {children}
  </span>
);

export default function App() {
  const [intent, setIntent] = useState('');
  const [results, setResults] = useState([]);
  const [link, setLink] = useState('');
  const [notebookResource, setNotebookResource] = useState(null);
  const [dark, setDark] = useState(true);
  const [view, setView] = useState('search'); // 'search' | 'catalog' | 'compare'
  const [selectedCategories, setSelectedCategories] = useState([]); // strings
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [compareSet, setCompareSet] = useState([]); // array of tool names
  const [ratings, setRatings] = useState(() => ({ /* toolName: { total: number, count: number } */ }));
  const [userRatings, setUserRatings] = useState(() => ({ /* toolName: stars */ }));

  // Load persisted ratings from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('bt_tool_ratings') || '{}');
      const storedUser = JSON.parse(localStorage.getItem('bt_tool_userRatings') || '{}');
      if (stored && typeof stored === 'object') setRatings(stored);
      if (storedUser && typeof storedUser === 'object') setUserRatings(storedUser);
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  // Persist ratings
  useEffect(() => {
    try { localStorage.setItem('bt_tool_ratings', JSON.stringify(ratings)); } catch (_) {}
  }, [ratings]);
  useEffect(() => {
    try { localStorage.setItem('bt_tool_userRatings', JSON.stringify(userRatings)); } catch (_) {}
  }, [userRatings]);

  const handleRate = (toolName, stars) => {
    setRatings(prev => {
      const current = prev[toolName] || { total: 0, count: 0 };
      const userPrev = userRatings[toolName];
      let newTotal = current.total;
      let newCount = current.count;
      // If user had rated before, replace their previous rating
      if (userPrev) {
        newTotal = newTotal - userPrev + stars;
      } else {
        newTotal += stars;
        newCount += 1;
      }
      return { ...prev, [toolName]: { total: newTotal, count: newCount } };
    });
    setUserRatings(prev => ({ ...prev, [toolName]: stars }));
  };

  const getAverage = (toolName) => {
    const r = ratings[toolName];
    if (!r || r.count === 0) return null;
    return (r.total / r.count).toFixed(1);
  };

  const handleRelatedClick = (name) => {
    setIntent(name);
    const matched = matchIntent(name);
    setResults(matched);
    // scroll to results
    setTimeout(() => {
      const mainEl = document.getElementById('main');
      if (mainEl) mainEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  // Derived sets for filters
  const allCategories = Array.from(new Set(sampleTools.flatMap(t => t.categories || []))).sort();
  const allPlatforms = Array.from(new Set(sampleTools.flatMap(t => t.platforms || []))).sort();

  const toggleInArray = (value, arrSetter) => {
    arrSetter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const filteredCatalogTools = sampleTools.filter(t => {
    // category filter
    if (selectedCategories.length > 0) {
      const hasCat = (t.categories || []).some(c => selectedCategories.includes(c));
      if (!hasCat) return false;
    }
    if (selectedPlatforms.length > 0) {
      const hasPlat = (t.platforms || []).some(p => selectedPlatforms.includes(p));
      if (!hasPlat) return false;
    }
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase();
      const fields = [t.name, t.description, ...(t.categories||[]), ...(t.platforms||[]), ...(t.badges||[])];
      if (!fields.some(f => f.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const catalogByCategory = allCategories.map(cat => ({
    category: cat,
    tools: filteredCatalogTools.filter(t => (t.categories||[]).includes(cat))
  })).filter(group => group.tools.length > 0);

  const handleCompareToggle = (toolName) => {
    setCompareSet(prev => prev.includes(toolName) ? prev.filter(n => n !== toolName) : [...prev, toolName]);
  };

  const compareTools = sampleTools.filter(t => compareSet.includes(t.name));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const handleSearch = (e) => {
    e.preventDefault();
    setResults(matchIntent(intent));
  };

  const handleLinkSubmit = (e) => {
    e.preventDefault();
    if (link.trim()) {
      setNotebookResource(link.trim());
      setLink('');
    }
  };

  return (
    <div className="min-h-screen font-sans bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-100 selection:bg-brand-500/30 pb-20">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-35 bg-[radial-gradient(circle_at_25%_15%,rgba(56,144,242,0.35),transparent_60%),radial-gradient(circle_at_80%_40%,rgba(147,51,234,0.18),transparent_60%)]" />
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-slate-900 text-white px-3 py-2 rounded">Skip to content</a>
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 pt-10 sm:pt-14 pb-8 flex flex-col gap-6 sm:gap-8">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight flex items-center gap-2">
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-soft ring-1 ring-white/10">🔎</span>
              <GradientText>SCRIPT: BT Tool Advisor</GradientText>
            </h1>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 text-xs bg-white/5 rounded-lg p-1 border border-white/10">
                {['search','catalog','compare'].map(v => (
                  <button key={v} onClick={() => setView(v)}
                    className={`px-2 py-1 rounded-md capitalize ${view===v ? 'bg-brand-500/30 text-brand-100' : 'hover:bg-white/10 text-slate-300'}`}>{v}</button>
                ))}
              </div>
              <button onClick={() => setDark(d => !d)} className="px-3 py-1.5 text-xs sm:text-sm rounded-md bg-white/10 hover:bg-white/15 backdrop-blur border border-white/10 transition">
                {dark ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>
          {view === 'search' && (
            <>
              <div className="max-w-2xl space-y-4">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight animate-fade-in">
                  Find the <GradientText>right BT tool</GradientText> for your task
                </h2>
                <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                  Describe what you want to accomplish. We’ll surface the most relevant tools, documentation & training materials.
                </p>
              </div>
              <form onSubmit={handleSearch} className="w-full max-w-2xl group space-y-2" aria-label="Tool intent search">
                <label htmlFor="intent" className="sr-only">Describe your goal</label>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <div className="flex-1 relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">✦</span>
                    <input
                      id="intent"
                      type="text"
                      inputMode="text"
                      autoComplete="off"
                      autoCorrect="on"
                      className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 focus:bg-white/10 transition border border-white/10 focus:border-brand-400/60 outline-none shadow-soft backdrop-blur text-sm sm:text-base placeholder:text-slate-500"
                      placeholder="e.g. create a PDF from my Paratext project"
                      value={intent}
                      onChange={(e) => setIntent(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="w-full sm:w-auto px-5 py-3 rounded-xl font-medium text-sm sm:text-base bg-gradient-to-r from-brand-500 to-indigo-500 hover:from-brand-400 hover:to-indigo-400 text-white shadow-elevated flex items-center justify-center gap-2">
                    <span className="hidden sm:inline">Search</span>
                    <span className="sm:hidden">Go</span>
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Tip: include output type (PDF, audio, dictionary) or a tool you know.
                </p>
              </form>
            </>
          )}
          {view === 'catalog' && (
            <div className="w-full max-w-6xl">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-end sm:justify-between">
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold tracking-tight">Catalog by <GradientText>Category</GradientText></h2>
                  <p className="text-slate-400 text-sm">Filter by category, platform, or search inside the catalog.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search catalog..."
                      value={catalogSearch}
                      onChange={e => setCatalogSearch(e.target.value)}
                      className="w-full sm:w-60 px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-brand-400/60 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
              {/* Filters */}
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl bg-slate-900/60 backdrop-blur ring-1 ring-white/10 p-4">
                  <p className="text-xs uppercase tracking-wide font-semibold text-slate-400 mb-2">Categories</p>
                  <div className="flex flex-wrap gap-1.5">
                    {allCategories.map(c => (
                      <button key={c} onClick={() => toggleInArray(c, setSelectedCategories)}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium border ${selectedCategories.includes(c) ? 'bg-brand-500/30 border-brand-400/50 text-brand-100' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}>{c}</button>
                    ))}
                  </div>
                  {selectedCategories.length > 0 && (
                    <button onClick={() => setSelectedCategories([])} className="mt-3 text-[11px] text-brand-300 hover:text-brand-200">Clear categories</button>
                  )}
                </div>
                <div className="rounded-xl bg-slate-900/60 backdrop-blur ring-1 ring-white/10 p-4">
                  <p className="text-xs uppercase tracking-wide font-semibold text-slate-400 mb-2">Platforms</p>
                  <div className="flex flex-wrap gap-1.5">
                    {allPlatforms.map(p => (
                      <button key={p} onClick={() => toggleInArray(p, setSelectedPlatforms)}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium border ${selectedPlatforms.includes(p) ? 'bg-brand-500/30 border-brand-400/50 text-brand-100' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}>{p}</button>
                    ))}
                  </div>
                  {selectedPlatforms.length > 0 && (
                    <button onClick={() => setSelectedPlatforms([])} className="mt-3 text-[11px] text-brand-300 hover:text-brand-200">Clear platforms</button>
                  )}
                </div>
                <div className="rounded-xl bg-slate-900/60 backdrop-blur ring-1 ring-white/10 p-4 flex flex-col justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide font-semibold text-slate-400 mb-2">Active Filters</p>
                    <p className="text-[11px] text-slate-400">{selectedCategories.length + selectedPlatforms.length + (catalogSearch?1:0) === 0 ? 'None' : ''}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedCategories.map(c => <span key={c} className="px-2 py-0.5 rounded-full bg-brand-500/20 text-[10px] border border-brand-400/40 text-brand-100">{c}</span>)}
                      {selectedPlatforms.map(p => <span key={p} className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-[10px] border border-indigo-400/40 text-indigo-100">{p}</span>)}
                      {catalogSearch && <span className="px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-[10px] border border-fuchsia-400/40 text-fuchsia-100">{catalogSearch}</span>}
                    </div>
                  </div>
                  {(selectedCategories.length>0 || selectedPlatforms.length>0 || catalogSearch) && (
                    <button onClick={() => {setSelectedCategories([]);setSelectedPlatforms([]);setCatalogSearch('');}} className="mt-3 self-start text-[11px] text-slate-300 hover:text-white underline">Reset All</button>
                  )}
                </div>
              </div>
            </div>
          )}
          {view === 'compare' && (
            <div className="w-full max-w-6xl">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Compare <GradientText>Tools</GradientText></h2>
              <p className="text-slate-400 text-sm mb-4">Select tools in the catalog or search views to populate this comparison.</p>
            </div>
          )}
        </div>
      </header>

  <main id="main" className="max-w-6xl mx-auto px-4 sm:px-6 -mt-2 sm:-mt-4 space-y-12 sm:space-y-14">
        {/* Results */}
        {view === 'search' && (
          <section>
            {results.length === 0 ? (
              <div className="mt-10 text-center text-slate-400">
                <p className="text-sm">Enter an intent above to see recommendations.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.map(tool => (
                  <ToolCard key={tool.name} tool={tool} userRatings={userRatings} handleRate={handleRate} getAverage={getAverage} handleRelatedClick={handleRelatedClick} compareSet={compareSet} onCompareToggle={handleCompareToggle} />
                ))}
              </div>
            )}
          </section>
        )}
        {view === 'catalog' && (
          <section className="space-y-10">
            {catalogByCategory.length === 0 && (
              <p className="text-slate-400 text-sm">No tools match current filters.</p>
            )}
            {catalogByCategory.map(group => (
              <div key={group.category} className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold tracking-tight">{group.category}</h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">{group.tools.length}</span>
                </div>
                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {group.tools.map(tool => (
                    <ToolCard key={tool.name} tool={tool} userRatings={userRatings} handleRate={handleRate} getAverage={getAverage} handleRelatedClick={handleRelatedClick} compareSet={compareSet} onCompareToggle={handleCompareToggle} />
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
        {view === 'compare' && (
          <section className="space-y-6">
            {compareTools.length < 2 && (
              <p className="text-slate-400 text-sm">Select at least two tools (use the Compare buttons) to view comparison.</p>
            )}
            {compareTools.length >= 2 && (
              <div className="overflow-auto rounded-xl ring-1 ring-white/10 bg-slate-900/70 backdrop-blur">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-slate-300">
                    <tr>
                      <th className="p-3 font-medium">Attribute</th>
                      {compareTools.map(t => (
                        <th key={t.name} className="p-3 font-semibold border-l border-white/5 align-bottom">
                          <div className="flex items-center gap-2">
                            <span>{t.name}</span>
                            <button onClick={() => handleCompareToggle(t.name)} className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10">✕</button>
                          </div>
                          <p className="mt-1 text-[10px] text-slate-500 max-w-[140px] line-clamp-2">{t.tagline}</p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { label: 'Categories', accessor: t => (t.categories||[]).join(', ') },
                      { label: 'Platforms', accessor: t => (t.platforms||[]).join(', ') },
                      { label: 'Badges', accessor: t => (t.badges||[]).join(', ') },
                      { label: 'Related', accessor: t => (t.related||[]).join(', ') },
                      { label: 'Support Forum', accessor: t => (t.supportForums && t.supportForums.length ? 'Yes' : 'No') },
                      { label: 'Average Rating', accessor: t => getAverage(t.name) || '—' },
                      { label: 'Description', accessor: t => t.description }
                    ].map(row => (
                      <tr key={row.label} className="align-top">
                        <th className="p-3 text-slate-400 font-medium w-40 sticky left-0 bg-slate-900/80 backdrop-blur-sm">{row.label}</th>
                        {compareTools.map(t => (
                          <td key={t.name+row.label} className="p-3 border-l border-white/5 text-slate-200 max-w-xs">
                            <div className="whitespace-pre-wrap leading-snug">{row.accessor(t) || '—'}</div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

  {/* Notebook-like resource submission */}
  <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">Interactive Resource Workspace</h2>
          </div>
          <form onSubmit={handleLinkSubmit} className="group relative rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-[1px] shadow-soft ring-1 ring-white/10 max-w-3xl">
            <div className="rounded-2xl bg-slate-900/70 backdrop-blur px-4 sm:px-5 py-5 sm:py-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand-500/20 text-brand-200 border border-brand-400/30">🔗</div>
                <div>
                  <p className="font-medium text-sm">Add a resource link</p>
                  <p className="text-xs text-slate-400">We’ll prepare a workspace to interact with it (Q&A, summaries, insights).</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <input
                  type="url"
                  required
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-400/60 outline-none text-sm placeholder:text-slate-500"
                  placeholder="Paste a link to a tool page, article, guide, or training material"
                  value={link}
                  onChange={e => setLink(e.target.value)}
                />
        <button type="submit" className="w-full sm:w-auto px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-brand-500 to-indigo-500 hover:from-brand-400 hover:to-indigo-400 text-white shadow-soft text-sm whitespace-nowrap">Create Workspace</button>
              </div>
            </div>
          </form>
          {notebookResource && (
      <div className="grid gap-4 sm:gap-6 md:grid-cols-3 max-w-5xl">
              <div className="md:col-span-1 space-y-4">
        <div className="rounded-xl bg-slate-900/70 backdrop-blur ring-1 ring-white/10 p-4 sm:p-5">
                  <p className="text-xs uppercase font-semibold tracking-wide text-slate-400 mb-2">Resource</p>
                  <a href={notebookResource} target="_blank" rel="noopener noreferrer" className="text-sm break-all text-brand-300 hover:text-brand-200 transition">
                    {notebookResource}
                  </a>
                </div>
                <div className="rounded-xl bg-slate-900/70 backdrop-blur ring-1 ring-white/10 p-4 sm:p-5">
                  <p className="text-xs uppercase font-semibold tracking-wide text-slate-400 mb-2">Planned Features</p>
                  <ul className="text-xs space-y-1 text-slate-300 list-disc pl-4">
                    <li>Content ingestion & summarization</li>
                    <li>Q&A over extracted text</li>
                    <li>Key concept extraction</li>
                    <li>Export notes</li>
                  </ul>
                </div>
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="rounded-xl bg-slate-900/70 backdrop-blur ring-1 ring-white/10 p-4 sm:p-5 min-h-[200px] flex items-center justify-center text-slate-400 text-sm">
                  NotebookLM-style interaction coming soon. Ask questions about this resource here.
                </div>
                <div className="rounded-xl bg-slate-900/70 backdrop-blur ring-1 ring-white/10 p-4 sm:p-5">
                  <p className="text-xs uppercase font-semibold tracking-wide text-slate-400 mb-2">Session Notes</p>
                  <p className="text-xs text-slate-300">Conversation transcripts and extracted insights will appear here.</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Sticky compare bar */}
      {compareSet.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-5xl w-full px-4">
          <div className="rounded-2xl bg-slate-900/90 backdrop-blur border border-white/10 shadow-elevated p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 text-xs text-slate-300 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-100">Compare Queue:</span>
              {compareSet.map(name => (
                <button key={name} onClick={() => handleCompareToggle(name)} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-[11px] flex items-center gap-1">
                  {name} <span className="text-slate-500">✕</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setView('compare')} className="px-4 py-2 rounded-lg text-xs font-medium bg-gradient-to-r from-brand-500 to-indigo-500 hover:from-brand-400 hover:to-indigo-400 text-white shadow-soft disabled:opacity-40" disabled={compareSet.length < 2}>Open Comparison ({compareSet.length})</button>
              <button onClick={() => setCompareSet([])} className="px-3 py-2 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10">Clear</button>
            </div>
          </div>
        </div>
      )}

  <footer className="mt-20 sm:mt-24 pt-8 sm:pt-10 border-t border-white/10 text-center text-xs text-slate-500 pb-[env(safe-area-inset-bottom)]">
        <p className="mb-2">Prototype – Data illustrative only</p>
  <p>&copy; {new Date().getFullYear()} BT Tools</p>
      </footer>
    </div>
  );
}

// Reusable tool card component
function ToolCard({ tool, userRatings, handleRate, getAverage, handleRelatedClick, compareSet, onCompareToggle }) {
  const inCompare = compareSet.includes(tool.name);
  return (
    <div className="group relative rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-[1px] shadow-elevated ring-1 ring-white/10 hover:ring-brand-400/40 focus-within:ring-brand-400/60 transition outline-none">
      <div className="relative h-full rounded-2xl bg-slate-900/70 backdrop-blur px-4 sm:px-5 pt-4 sm:pt-5 pb-5 sm:pb-6 flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold leading-snug text-white">
            {tool.name}
            <span className="block mt-0.5 text-[11px] font-normal uppercase tracking-wide text-brand-300/80">{tool.tagline}</span>
          </h3>
          <div className="flex flex-col items-end gap-2">
            <span className="px-2 py-1 rounded-md text-[10px] font-medium bg-brand-500/20 text-brand-200 border border-brand-400/30">Tool</span>
            <button onClick={() => onCompareToggle(tool.name)} className={`text-[10px] px-2 py-0.5 rounded-md border ${inCompare ? 'bg-brand-500/30 border-brand-400/50 text-brand-100' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}>{inCompare ? 'Added' : 'Compare'}</button>
          </div>
        </div>
        {/* Ratings */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex" aria-label={`Rate ${tool.name}`}>
            {[1,2,3,4,5].map(star => {
              const userVal = userRatings[tool.name] || 0;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRate(tool.name, star)}
                  className={`w-5 h-5 text-xs flex items-center justify-center rounded hover:bg-white/10 transition ${userVal >= star ? 'text-amber-400' : 'text-slate-500'}`}
                  aria-pressed={userVal === star}
                  aria-label={`${star} star${star>1?'s':''}`}
                >★</button>
              );
            })}
          </div>
          <div className="text-[11px] text-slate-400">
            {getAverage(tool.name) ? (<span>{getAverage(tool.name)} <span className="text-slate-500">avg</span></span>) : <span className="italic">No ratings</span>}
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-300 line-clamp-5">{tool.description}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tool.badges?.map(b => (
            <span key={b} className="px-2 py-0.5 rounded-full bg-white/5 text-[11px] font-medium tracking-wide text-slate-300 border border-white/10">{b}</span>
          ))}
        </div>
        <div className="mt-4 space-y-1 text-xs text-slate-400">
          {tool.documentation?.map(doc => (
            <a key={doc.url} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-brand-300 transition">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-400" /> {doc.title}
            </a>
          ))}
          {tool.supportForums?.length ? (
            <div className="pt-1">
              {tool.supportForums.map(f => (
                <a key={f.url} href={f.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-brand-300 transition">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" /> {f.title}
                </a>
              ))}
            </div>
          ) : null}
          {tool.related?.length ? (
            <div className="pt-1 flex flex-wrap gap-1.5">
              {tool.related.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRelatedClick(r)}
                  className="px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-400/30 text-[11px] font-medium text-brand-200 hover:bg-brand-500/20 transition"
                >{r}</button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition pointer-events-none bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_60%)]" />
    </div>
  );
}
