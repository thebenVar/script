
import React, { useState, useEffect } from 'react';

const sampleTools = [
  {
    name: 'PTXprint',
    tagline: 'High quality scripture layout from Paratext',
    description: 'Create beautiful, print-ready PDFs from Paratext projects with powerful layout controls.',
    badges: ['PDF', 'Layout', 'Paratext'],
    documentation: [
      { title: 'User Guide', url: 'https://software.sil.org/ptxprint/documentation/' },
      { title: 'FAQ', url: 'https://software.sil.org/ptxprint/faq/' }
    ]
  },
  {
    name: 'Paratext',
    tagline: 'Collaborative Bible translation environment',
    description: 'Powerful translation, checking, and collaboration platform for scripture projects.',
    badges: ['Translation', 'Collaboration'],
    documentation: [
      { title: 'User Guide', url: 'https://paratext.org/documentation/' }
    ]
  }
];

function matchIntent(intent) {
  const q = intent.toLowerCase();
  if (!q.trim()) return [];
  return sampleTools.filter(t =>
    [t.name, t.description, ...(t.badges||[])].some(field => field.toLowerCase().includes(q)) ||
    (q.includes('pdf') && t.name === 'PTXprint') ||
    (q.includes('paratext') && (t.name === 'Paratext' || t.name === 'PTXprint'))
  );
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
        <div className="absolute inset-0 -z-10 opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(56,144,242,0.35),transparent_60%),radial-gradient(circle_at_80%_30%,rgba(147,51,234,0.25),transparent_55%)]" />
        <div className="max-w-5xl mx-auto px-5 pt-14 pb-10 flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-soft ring-1 ring-white/10">🔎</span>
              <GradientText>SIL Tool Advisor</GradientText>
            </h1>
            <button onClick={() => setDark(d => !d)} className="px-3 py-1.5 text-sm rounded-md bg-white/10 hover:bg-white/15 backdrop-blur border border-white/10 transition">
              {dark ? 'Light' : 'Dark'}
            </button>
          </div>
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight animate-fade-in">
              Find the <GradientText>right SIL tool</GradientText> for your task
            </h2>
            <p className="mt-4 text-lg text-slate-300 leading-relaxed">
              Describe what you want to accomplish. We’ll surface the most relevant tools, documentation and training materials.
            </p>
          </div>
          <form onSubmit={handleSearch} className="w-full max-w-2xl group">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">✦</div>
              <input
                type="text"
                autoFocus
                className="w-full pl-11 pr-36 py-4 rounded-2xl bg-white/5 hover:bg-white/10 focus:bg-white/10 transition border border-white/10 focus:border-brand-400/60 outline-none shadow-soft backdrop-blur text-base placeholder:text-slate-500"
                placeholder="e.g. create a PDF from my Paratext project"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
              />
              <button type="submit" className="absolute top-1.5 right-1.5 h-11 px-6 rounded-xl font-medium bg-gradient-to-r from-brand-500 to-indigo-500 hover:from-brand-400 hover:to-indigo-400 text-white shadow-elevated">Search</button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Tip: mention the data type (PDF, audio, dictionary) or the tool name you’re unsure about.
            </p>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 -mt-4 space-y-14">
        {/* Results */}
        <section>
          {results.length === 0 ? (
            <div className="mt-10 text-center text-slate-400">
              <p className="text-sm">Enter an intent above to see recommendations.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {results.map(tool => (
                <div key={tool.name} className="group relative rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-[1px] shadow-elevated ring-1 ring-white/10 hover:ring-brand-400/40 transition">
                  <div className="relative h-full rounded-2xl bg-slate-900/70 backdrop-blur px-5 pt-5 pb-6 flex flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-semibold leading-snug text-white">
                        {tool.name}
                        <span className="block mt-0.5 text-[11px] font-normal uppercase tracking-wide text-brand-300/80">{tool.tagline}</span>
                      </h3>
                      <span className="px-2 py-1 rounded-md text-[10px] font-medium bg-brand-500/20 text-brand-200 border border-brand-400/30">Tool</span>
                    </div>
                    <p className="mt-3 text-sm text-slate-300 line-clamp-4">{tool.description}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {tool.badges?.map(b => (
                        <span key={b} className="px-2 py-0.5 rounded-full bg-white/5 text-[11px] font-medium tracking-wide text-slate-300 border border-white/10">{b}</span>
                      ))}
                    </div>
                    <div className="mt-4 space-y-1 text-xs text-slate-400">
                      {tool.documentation.map(doc => (
                        <a key={doc.url} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-brand-300 transition">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-400" /> {doc.title}
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition pointer-events-none bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_60%)]" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Notebook-like resource submission */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">Interactive Resource Workspace</h2>
          </div>
          <form onSubmit={handleLinkSubmit} className="group relative rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-[1px] shadow-soft ring-1 ring-white/10 max-w-3xl">
            <div className="rounded-2xl bg-slate-900/70 backdrop-blur px-5 py-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand-500/20 text-brand-200 border border-brand-400/30">🔗</div>
                <div>
                  <p className="font-medium text-sm">Add a resource link</p>
                  <p className="text-xs text-slate-400">We’ll prepare a workspace to interact with it (Q&A, summaries, insights).</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  required
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-400/60 outline-none text-sm placeholder:text-slate-500"
                  placeholder="Paste a link to a tool page, article, guide, or training material"
                  value={link}
                  onChange={e => setLink(e.target.value)}
                />
                <button type="submit" className="px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-brand-500 to-indigo-500 hover:from-brand-400 hover:to-indigo-400 text-white shadow-soft text-sm whitespace-nowrap">Create Workspace</button>
              </div>
            </div>
          </form>
          {notebookResource && (
            <div className="grid gap-6 md:grid-cols-3 max-w-5xl">
              <div className="md:col-span-1 space-y-4">
                <div className="rounded-xl bg-slate-900/70 backdrop-blur ring-1 ring-white/10 p-4">
                  <p className="text-xs uppercase font-semibold tracking-wide text-slate-400 mb-2">Resource</p>
                  <a href={notebookResource} target="_blank" rel="noopener noreferrer" className="text-sm break-all text-brand-300 hover:text-brand-200 transition">
                    {notebookResource}
                  </a>
                </div>
                <div className="rounded-xl bg-slate-900/70 backdrop-blur ring-1 ring-white/10 p-4">
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
                <div className="rounded-xl bg-slate-900/70 backdrop-blur ring-1 ring-white/10 p-5 min-h-[220px] flex items-center justify-center text-slate-400 text-sm">
                  NotebookLM-style interaction coming soon. Ask questions about this resource here.
                </div>
                <div className="rounded-xl bg-slate-900/70 backdrop-blur ring-1 ring-white/10 p-4">
                  <p className="text-xs uppercase font-semibold tracking-wide text-slate-400 mb-2">Session Notes</p>
                  <p className="text-xs text-slate-300">Conversation transcripts and extracted insights will appear here.</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="mt-24 pt-10 border-t border-white/10 text-center text-xs text-slate-500">
        <p className="mb-2">Prototype – Data illustrative only</p>
        <p>&copy; {new Date().getFullYear()} SIL Tools</p>
      </footer>
    </div>
  );
}
