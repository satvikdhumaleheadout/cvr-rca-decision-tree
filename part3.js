// ── Globals from Framer Motion UMD ───────────────────────────────────────────
const { motion, AnimatePresence } = window.Motion;
const { useState, useMemo, useEffect, useRef, useCallback } = React;

const FILE_W = 200; // file node width (matches CSS .node.type-file { width: 200px })

// ── Markdown renderer ─────────────────────────────────────────────────────────
function renderMd(raw, q) {
  function esc(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function inline(s) {
    s = esc(s);
    s = s.replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>');
    s = s.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
    s = s.replace(/__(.+?)__/g,'<strong>$1</strong>');
    s = s.replace(/\*(.+?)\*/g,'<em>$1</em>');
    s = s.replace(/`([^`]+)`/g,'<code>$1</code>');
    if (q && q.length > 1) {
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi');
      s = s.replace(re, m => `<mark class="highlight">${m}</mark>`);
    }
    return s;
  }

  const lines = raw.split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const l = lines[i];

    // Fenced code block
    if (l.startsWith('```')) {
      i++;
      const code = [];
      while (i < lines.length && !lines[i].startsWith('```')) {
        code.push(esc(lines[i]));
        i++;
      }
      out.push(`<pre><code>${code.join('\n')}</code></pre>`);
      i++; continue;
    }

    // Headings
    const m3 = l.match(/^### (.+)/); if (m3) { out.push(`<h3>${inline(m3[1])}</h3>`); i++; continue; }
    const m2 = l.match(/^## (.+)/);  if (m2) { out.push(`<h2>${inline(m2[1])}</h2>`); i++; continue; }
    const m1 = l.match(/^# (.+)/);   if (m1) { out.push(`<h1>${inline(m1[1])}</h1>`); i++; continue; }

    // Horizontal rule
    if (/^-{3,}$/.test(l.trim())) { out.push('<hr>'); i++; continue; }

    // Blockquote
    if (l.startsWith('> ')) {
      const bq = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        bq.push(inline(lines[i].slice(2)));
        i++;
      }
      out.push(`<blockquote><p>${bq.join('<br>')}</p></blockquote>`);
      continue;
    }

    // Table (header | sep | rows)
    if (l.includes('|') && i + 1 < lines.length && /^\|[-| :]+\|/.test(lines[i + 1])) {
      const cols = row => row.split('|').filter((_,j,a) => j > 0 && j < a.length - 1).map(s => s.trim());
      const hdrs = cols(l);
      i += 2; // skip separator
      const rows = [];
      while (i < lines.length && lines[i].includes('|')) { rows.push(cols(lines[i])); i++; }
      out.push(
        `<table><thead><tr>${hdrs.map(h => `<th>${inline(h)}</th>`).join('')}</tr></thead>` +
        `<tbody>${rows.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
      );
      continue;
    }

    // Unordered list
    if (/^[-*] /.test(l)) {
      const items = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(inline(lines[i].replace(/^[-*] /, '')));
        i++;
      }
      out.push(`<ul>${items.map(t => `<li>${t}</li>`).join('')}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\d+\. /.test(l)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(inline(lines[i].replace(/^\d+\. /, '')));
        i++;
      }
      out.push(`<ol>${items.map(t => `<li>${t}</li>`).join('')}</ol>`);
      continue;
    }

    // Empty line
    if (l.trim() === '') { i++; continue; }

    // Paragraph
    out.push(`<p>${inline(l)}</p>`);
    i++;
  }

  return out.join('');
}

function MarkdownRenderer({ content, search }) {
  const html = useMemo(() => renderMd(content || '', search || ''), [content, search]);
  return <div className="md" dangerouslySetInnerHTML={{ __html: html }} />;
}

// ── Node card ─────────────────────────────────────────────────────────────────
function NodeCard({ node, selected, dimmed, onClick }) {
  const isFile = node.type === 'file';

  const cls = ['node', `type-${node.type}`, selected ? 'selected' : '']
    .filter(Boolean).join(' ');

  return (
    <motion.div
      className={cls}
      style={{
        left: node.x,
        top: node.y,
        position: 'absolute',
        pointerEvents: dimmed ? 'none' : 'auto',
      }}
      onClick={() => onClick(node)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: dimmed ? 0.15 : 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="node-header">
        <div className="node-icon">{node.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="node-label">{node.label}</div>
          <div className="node-sub">{node.sublabel}</div>
          {node.badge && (
            <span className={`badge badge-${node.badge}`}>
              {node.badge === 'parallel' ? '⬡' : node.badge === 'serial' ? '▸' : '⬤'}&nbsp;{node.badge}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      {isFile ? (
        <div className="node-body">
          <div className="io-chips">
            {(node.chips || []).slice(0, 4).map(c => (
              <span key={c} className="chip in">{c}</span>
            ))}
            {(node.chips || []).length > 4 && (
              <span className="chip in">+{node.chips.length - 4}</span>
            )}
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-xs)', marginTop: 4 }}>
            Click to read file ↗
          </div>
        </div>
      ) : (
        <div className="node-body">
          {node.inputs?.length > 0 && (
            <div className="io-row">
              <div className="io-title">Inputs</div>
              <div className="io-chips">
                {node.inputs.slice(0, 3).map(v => (
                  <span key={v} className="chip in">{v}</span>
                ))}
                {node.inputs.length > 3 && (
                  <span className="chip in">+{node.inputs.length - 3}</span>
                )}
              </div>
            </div>
          )}
          {node.outputs?.length > 0 && (
            <div className="io-row">
              <div className="io-title">Outputs</div>
              <div className="io-chips">
                {node.outputs.slice(0, 2).map(v => (
                  <span key={v} className="chip out">{v}</span>
                ))}
                {node.outputs.length > 2 && (
                  <span className="chip out">+{node.outputs.length - 2}</span>
                )}
              </div>
            </div>
          )}
          {node.condition && (
            <div className="node-condition">{node.condition}</div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── SVG edges ─────────────────────────────────────────────────────────────────
function SvgEdges({ edges, nodeMap, selectedId }) {
  const activeIds = useMemo(() => {
    if (!selectedId) return null;
    const s = new Set();
    edges.forEach(e => {
      if (e.from === selectedId || e.to === selectedId) s.add(e.id);
    });
    return s;
  }, [selectedId, edges]);

  function getAnchors(e) {
    const src = nodeMap[e.from];
    const tgt = nodeMap[e.to];
    if (!src || !tgt) return null;
    const sw = src.type === 'file' ? FILE_W : NODE_W;
    const tw = tgt.type === 'file' ? FILE_W : NODE_W;
    if (e.type === 'consults') {
      // File node (right side of canvas) → process node right edge
      return {
        sx: src.x,                    // file left edge
        sy: src.y + NODE_H_EST / 2,
        tx: tgt.x + tw,              // process node right edge
        ty: tgt.y + NODE_H_EST / 2,
      };
    }
    // Standard: bottom-center → top-center
    return {
      sx: src.x + sw / 2,
      sy: src.y + NODE_H_EST,
      tx: tgt.x + tw / 2,
      ty: tgt.y,
    };
  }

  function buildPath({ sx, sy, tx, ty }, type) {
    const dx = tx - sx;
    const dy = ty - sy;
    if (type === 'consults') {
      const off = Math.max(80, Math.abs(dx) * 0.3);
      return `M${sx},${sy} C${sx - off},${sy} ${tx + off},${ty} ${tx},${ty}`;
    }
    const vy = Math.max(55, Math.abs(dy) * 0.38);
    const vx = dx * 0.12;
    return `M${sx},${sy} C${sx + vx},${sy + vy} ${tx - vx},${ty - vy} ${tx},${ty}`;
  }

  const C = {
    always:      { active: '#4f46e5', dim: '#c7d2fe', dash: null,      markId: 'ar-a', markDimId: 'ar-ad' },
    conditional: { active: '#64748b', dim: '#e2e8f0', dash: '5,4',     markId: 'ar-c', markDimId: 'ar-cd' },
    consults:    { active: '#7c3aed', dim: '#ede9fe', dash: '2.5,4',   markId: null,   markDimId: null    },
  };

  return (
    <svg
      className="edges-svg"
      width={CANVAS_W}
      height={CANVAS_H}
      style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}
    >
      <defs>
        {[['ar-a','#4f46e5'],['ar-ad','#c7d2fe'],['ar-c','#64748b'],['ar-cd','#e2e8f0']].map(([id, fill]) => (
          <marker key={id} id={id} markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto">
            <path d="M0,0.5 L0,6.5 L7,3.5 z" fill={fill} />
          </marker>
        ))}
      </defs>

      {edges.map(edge => {
        const a = getAnchors(edge);
        if (!a) return null;

        const isActive = !activeIds || activeIds.has(edge.id);
        const cfg = C[edge.type] || C.conditional;
        const stroke = isActive ? cfg.active : cfg.dim;
        const opacity = !activeIds ? 0.7 : isActive ? 1 : 0.07;

        let markerEnd;
        if (isActive && cfg.markId)    markerEnd = `url(#${cfg.markId})`;
        if (!isActive && cfg.markDimId) markerEnd = `url(#${cfg.markDimId})`;

        const lbl = edge.label || '';
        const truncLbl = lbl.length > 17 ? lbl.slice(0, 16) + '…' : lbl;
        const lblW = Math.min(96, truncLbl.length * 5.4 + 12);
        const mx = (a.sx + a.tx) / 2;
        const my = (a.sy + a.ty) / 2;

        return (
          <g key={edge.id} opacity={opacity}>
            <path
              d={buildPath(a, edge.type)}
              fill="none"
              stroke={stroke}
              strokeWidth="1.5"
              strokeDasharray={cfg.dash || undefined}
              markerEnd={markerEnd}
            />
            {truncLbl && isActive && (
              <g transform={`translate(${mx},${my})`}>
                <rect
                  x={-lblW / 2} y="-8" width={lblW} height="16" rx="4"
                  fill="#ffffff" stroke={stroke} strokeWidth="0.75" opacity="0.95"
                />
                <text
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="7.5" fill={stroke} fontWeight="600" fontFamily="inherit"
                >
                  {truncLbl}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── Side panel ────────────────────────────────────────────────────────────────
function SidePanel({ node, nodeMap, edges, onClose }) {
  const [search, setSearch] = useState('');
  useEffect(() => { setSearch(''); }, [node?.id]);

  const connEdges = useMemo(() => {
    if (!node) return [];
    return edges.filter(e => e.from === node.id || e.to === node.id);
  }, [node, edges]);

  return (
    <AnimatePresence>
      {node && (
        <motion.div
          key={node.id}
          className="side-panel"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        >
          {node.type === 'file' ? (
            /* ── FILE READER MODE ── */
            <>
              <div className="fr-header">
                <button className="sp-close" onClick={onClose}>✕</button>
                <div className="fr-filename">📄 {node.label}</div>
                <div className="fr-meta">{node.sublabel}</div>
                {node.usedBy?.length > 0 && (
                  <div className="fr-used-by">
                    <strong>Read by: </strong>
                    {node.usedBy.map(uid => nodeMap[uid]?.label || uid).join(', ')}
                  </div>
                )}
                {(node.chips || []).length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                    {node.chips.map(c => (
                      <span key={c} style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 999,
                        background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd'
                      }}>
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="fr-search-wrap">
                <input
                  className="fr-search"
                  placeholder="Search in file…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="fr-body">
                <MarkdownRenderer
                  content={FILE_CONTENTS[node.fileKey] || ''}
                  search={search}
                />
              </div>
            </>
          ) : (
            /* ── INSPECTOR MODE ── */
            <>
              <div className="sp-header">
                <button className="sp-close" onClick={onClose}>✕</button>
                {(() => {
                  const m = TYPE_META[node.type];
                  return (
                    <div className="sp-type-badge" style={{
                      background: (m?.color || '#64748b') + '1c',
                      color: m?.color || '#64748b',
                      border: `1px solid ${(m?.color || '#64748b')}38`,
                    }}>
                      {node.icon}&nbsp; {m?.label || node.type}
                    </div>
                  );
                })()}
                <div className="sp-title">{node.label}</div>
                <div className="sp-sub">{node.sublabel}</div>
                <div className="sp-phase">{node.phase}</div>
              </div>

              <div className="sp-body">
                {node.description && (
                  <div>
                    <div className="sp-section-title">What it does</div>
                    <div className="sp-desc">{node.description}</div>
                  </div>
                )}

                {node.condition && (
                  <div>
                    <div className="sp-section-title">Firing condition</div>
                    <div className="sp-condition">{node.condition}</div>
                  </div>
                )}

                {node.inputs?.length > 0 && (
                  <div>
                    <div className="sp-section-title">Inputs ({node.inputs.length})</div>
                    <div className="sp-chips">
                      {node.inputs.map(v => (
                        <span key={v} className="sp-chip-in">{v}</span>
                      ))}
                    </div>
                  </div>
                )}

                {node.outputs?.length > 0 && (
                  <div>
                    <div className="sp-section-title">Outputs ({node.outputs.length})</div>
                    <div className="sp-chips">
                      {node.outputs.map(v => (
                        <span key={v} className="sp-chip-out">{v}</span>
                      ))}
                    </div>
                  </div>
                )}

                {connEdges.length > 0 && (
                  <>
                    <div className="sp-divider" />
                    <div>
                      <div className="sp-section-title">Connections ({connEdges.length})</div>
                      {connEdges.map(e => {
                        const otherId = e.from === node.id ? e.to : e.from;
                        const other = nodeMap[otherId];
                        const isOut = e.from === node.id;
                        const typeColor =
                          e.type === 'always' ? '#4f46e5' :
                          e.type === 'consults' ? '#7c3aed' : '#64748b';
                        return (
                          <div key={e.id} className="sp-conn-row">
                            <span style={{ color: typeColor, fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                              {isOut ? '→' : '←'}
                            </span>
                            <span style={{ flex: 1, fontSize: 12, color: 'var(--text)' }}>
                              {other?.label || otherId}
                            </span>
                            {e.label && (
                              <span className="sp-conn-label">{e.label}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────
function Legend() {
  return (
    <div className="legend">
      <div className="legend-title">Node Types</div>
      <div className="legend-grid">
        {Object.entries(TYPE_META).map(([key, meta]) => (
          <div key={key} className="legend-item">
            {key === 'file'
              ? <div className="legend-file" />
              : <div className="legend-dot" style={{ background: meta.color }} />
            }
            <span>{meta.label}</span>
          </div>
        ))}
      </div>
      <div className="legend-sep" />
      <div className="legend-title" style={{ marginTop: 6 }}>Edges</div>
      {[
        { label: 'Always fires',  stroke: '#4f46e5', dash: undefined   },
        { label: 'Conditional',   stroke: '#64748b', dash: '5,3'       },
        { label: 'Consults file', stroke: '#7c3aed', dash: '2.5,3'     },
      ].map(e => (
        <div key={e.label} className="legend-edge">
          <svg width="26" height="10" style={{ flexShrink: 0 }}>
            <line x1="0" y1="5" x2="26" y2="5"
              stroke={e.stroke} strokeWidth="1.5"
              strokeDasharray={e.dash}
            />
          </svg>
          {e.label}
        </div>
      ))}
    </div>
  );
}

// ── Zoom controls ─────────────────────────────────────────────────────────────
function ZoomControls({ onZoom, onReset }) {
  return (
    <div className="zoom-ctrls">
      <button className="zoom-btn" title="Zoom in"  onClick={() => onZoom(0.15)}>+</button>
      <button className="zoom-btn" title="Zoom out" onClick={() => onZoom(-0.15)}>−</button>
      <button className="zoom-btn" title="Reset"    onClick={onReset} style={{ fontSize: 11 }}>⌂</button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEST RUNS EXPLORER
// ══════════════════════════════════════════════════════════════════════════════

// ── Score colour helper ───────────────────────────────────────────────────────
function scoreColor(score, max) {
  const pct = score / max;
  if (pct >= 0.80) return '#16a34a';   // green
  if (pct >= 0.65) return '#d97706';   // amber
  return '#dc2626';                     // red
}

// ── Markdown viewer (marked + highlight.js) ───────────────────────────────────
function MarkdownViewer({ url }) {
  const [html, setHtml]     = useState('');
  const [status, setStatus] = useState('loading'); // loading | ok | error
  const bodyRef = useRef(null);

  // Fetch + parse markdown
  useEffect(() => {
    if (!url) return;
    setStatus('loading');
    setHtml('');
    fetch(url)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(text => {
        if (window.marked) {
          // marked@12: plain parse — no deprecated setOptions highlight callback
          setHtml(window.marked.parse(text, { gfm: true, breaks: false }));
        } else {
          setHtml(`<pre style="white-space:pre-wrap;font-size:13px">${text.replace(/</g,'&lt;')}</pre>`);
        }
        setStatus('ok');
      })
      .catch(() => setStatus('error'));
  }, [url]);

  // After HTML is injected into the DOM, highlight any <pre><code> blocks
  useEffect(() => {
    if (status !== 'ok' || !bodyRef.current || !window.hljs) return;
    bodyRef.current.querySelectorAll('pre code').forEach(block => {
      window.hljs.highlightElement(block);
    });
  }, [html, status]);

  if (status === 'loading') return (
    <div className="tr-loading"><div className="tr-spinner" /><span>Loading…</span></div>
  );
  if (status === 'error') return (
    <div className="tr-loading">⚠️ Could not load file.</div>
  );
  return (
    <div className="tr-md-wrap">
      <div ref={bodyRef} className="md-body" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

// ── Run sidebar card ──────────────────────────────────────────────────────────
function RunCard({ run, version, active, onClick }) {
  const color = scoreColor(run.eval_score ?? 0, run.eval_max);
  const fillPct = run.eval_score != null ? Math.round((run.eval_score / run.eval_max) * 100) : 0;
  return (
    <div className={`tr-run-card${active ? ' active' : ''}`} onClick={onClick}>
      {/* Row 1: CE ID + version badge */}
      <div className="tr-card-meta-row">
        <span className="tr-card-ce-id">CE {run.ce_id}</span>
        <span className="tr-card-version-badge">{version}</span>
      </div>
      {/* Row 2: CE name */}
      <div className="tr-card-ce-name">{run.ce_name}</div>
      {/* Row 3: date range */}
      <div className="tr-card-dates">
        <span title="Pre start">{run.pre_start}</span>
        {' → '}
        <span title="Post end">{run.post_end}</span>
      </div>
      {/* Row 4: score bar */}
      <div className="tr-card-score-row">
        <div className="tr-score-bar-wrap">
          <div className="tr-score-bar" style={{ width: `${fillPct}%`, background: color }} />
        </div>
        <span className="tr-score-label" style={{ color }}>
          {run.eval_score != null ? `${run.eval_score}/${run.eval_max}` : '—'}
        </span>
      </div>
      {/* Row 5: root cause snippet */}
      <div className="tr-card-rc">{run.root_cause_summary}</div>
    </div>
  );
}

// ── Main TestRunsExplorer ─────────────────────────────────────────────────────
function TestRunsExplorer() {
  const [versionIndex, setVersionIndex]     = useState([]);   // from runs/index.json
  const [manifests, setManifests]           = useState({});   // version → manifest data
  const [selectedVersion, setSelectedVersion] = useState('all');
  const [selectedRun, setSelectedRun]       = useState(null); // { run, version }
  const [activeSubTab, setActiveSubTab]     = useState('report');
  const [indexLoading, setIndexLoading]     = useState(true);
  const [indexError, setIndexError]         = useState(false);

  // Load index.json on mount
  useEffect(() => {
    fetch('runs/index.json')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        setVersionIndex(data.versions || []);
        // Fetch all manifests in parallel
        return Promise.all(
          (data.versions || []).map(v =>
            fetch(v.manifest)
              .then(r => r.json())
              .then(m => ({ version: v.version, manifest: m }))
          )
        );
      })
      .then(results => {
        const m = {};
        results.forEach(({ version, manifest }) => { m[version] = manifest; });
        setManifests(m);
        // Auto-select the most recent run (latest run_date across all versions)
        const allRuns = results.flatMap(r => (r.manifest.runs || []).map(run => ({ run, version: r.version })));
        const latestRun = allRuns.sort((a, b) => (b.run.run_date || '').localeCompare(a.run.run_date || ''))[0];
        if (latestRun) setSelectedRun({ run: latestRun.run, version: latestRun.version });
        setIndexLoading(false);
      })
      .catch(() => { setIndexError(true); setIndexLoading(false); });
  }, []);

  // Build flat run list filtered by selected version
  const filteredRuns = useMemo(() => {
    const all = [];
    Object.entries(manifests).forEach(([version, manifest]) => {
      (manifest.runs || []).forEach(run => {
        all.push({ run, version });
      });
    });
    if (selectedVersion === 'all') return all;
    return all.filter(({ version }) => version === selectedVersion);
  }, [manifests, selectedVersion]);

  const allVersions = useMemo(() => Object.keys(manifests).sort(), [manifests]);

  // Sub-tabs available for selected run
  const subTabs = useMemo(() => {
    if (!selectedRun) return [];
    const { run } = selectedRun;
    const tabs = [];
    if (run.files.report)     tabs.push({ id: 'report',     label: '📄 Report' });
    if (run.files.transcript) tabs.push({ id: 'transcript', label: '📝 Transcript' });
    if (run.files.evaluation) tabs.push({ id: 'evaluation', label: '⭐ Evaluation' });
    return tabs;
  }, [selectedRun]);

  // Reset subtab when run changes
  useEffect(() => {
    if (subTabs.length) setActiveSubTab(subTabs[0].id);
  }, [selectedRun]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (indexLoading) return (
    <div className="tr-shell">
      <div className="tr-loading" style={{ flex: 1 }}>
        <div className="tr-spinner" /><span>Loading test runs…</span>
      </div>
    </div>
  );

  if (indexError) return (
    <div className="tr-shell">
      <div className="tr-loading" style={{ flex: 1 }}>
        ⚠️ Could not load runs/index.json — make sure test runs have been pushed.
      </div>
    </div>
  );

  const activeRun = selectedRun?.run;
  const color = activeRun ? scoreColor(activeRun.eval_score, activeRun.eval_max) : '#64748b';

  return (
    <div className="tr-shell">

      {/* ── Sidebar ── */}
      <div className="tr-sidebar">
        <div className="tr-sidebar-header">
          <div className="tr-sidebar-title">Test Runs</div>
          <div className="tr-version-pills">
            <button
              className={`tr-vpill${selectedVersion === 'all' ? ' active' : ''}`}
              onClick={() => setSelectedVersion('all')}>
              All
            </button>
            {allVersions.map(v => (
              <button
                key={v}
                className={`tr-vpill${selectedVersion === v ? ' active' : ''}`}
                onClick={() => setSelectedVersion(v)}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="tr-run-list">
          {filteredRuns.length === 0 && (
            <div className="tr-empty">No runs for this version yet.</div>
          )}
          {filteredRuns.map(({ run, version }) => (
            <RunCard
              key={`${version}-${run.id}`}
              run={run}
              version={version}
              active={selectedRun?.run.id === run.id && selectedRun?.version === version}
              onClick={() => setSelectedRun({ run, version })}
            />
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="tr-main">
        {!selectedRun ? (
          <div className="tr-main-empty">
            <div className="tr-main-empty-icon">🧪</div>
            <div className="tr-main-empty-text">Select a run from the sidebar</div>
          </div>
        ) : (
          <>
            {/* Run header strip */}
            <div className="tr-run-header">
              <div>
                <div className="tr-run-header-name">{activeRun.ce_name} — CE {activeRun.ce_id}</div>
                <div className="tr-run-header-meta">
                  {activeRun.pre_start} → {activeRun.post_end}
                  {activeRun.run_date && ` · Evaluated ${activeRun.run_date}`}
                </div>
              </div>
              <div className="tr-run-header-score" style={{ color }}>
                {activeRun.eval_score != null ? `${activeRun.eval_score}/${activeRun.eval_max} pts` : 'Not evaluated'}
              </div>
            </div>

            {/* Sub-tab bar */}
            <div className="tr-subtab-bar">
              {subTabs.map(tab => (
                <button
                  key={tab.id}
                  className={`tr-subtab${activeSubTab === tab.id ? ' active' : ''}`}
                  onClick={() => setActiveSubTab(tab.id)}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            {activeSubTab === 'report' && (
              <iframe
                key={activeRun.files.report}
                src={activeRun.files.report}
                className="tr-report-frame"
                title={`Report — ${activeRun.ce_name}`}
                sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
              />
            )}
            {activeSubTab === 'transcript' && (
              <MarkdownViewer key={activeRun.files.transcript} url={activeRun.files.transcript} />
            )}
            {activeSubTab === 'evaluation' && (
              <MarkdownViewer key={activeRun.files.evaluation} url={activeRun.files.evaluation} />
            )}
          </>
        )}
      </div>

    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CHANGELOG EXPLORER
// ══════════════════════════════════════════════════════════════════════════════

// ── CHANGELOG.md parser ───────────────────────────────────────────────────────
function parseChangelog(text) {
  const results = [];
  const lines   = text.split('\n');

  let v            = null;   // current version object
  let f            = null;   // current file section
  let summaryMode  = false;
  let summaryLines = [];

  // Flush helpers
  const flushFile = () => {
    // Only keep file sections that actually have bullet changes
    if (f && v && f.changes.length > 0) v.files.push(f);
    f = null;
  };
  const flushVersion = () => {
    if (!v) return;
    if (summaryMode) {
      v.summary = summaryLines.join(' ').replace(/\s+/g, ' ').trim();
      summaryMode = false; summaryLines = [];
    }
    flushFile();
    results.push(v);
    v = null;
  };

  for (const raw of lines) {
    const line = raw;

    // ── Version heading  ## [v1.3] — 2026-04-28 — Title
    const vm = line.match(/^## \[(v[\d.]+)\] — (\d{4}-\d{2}-\d{2}) — (.+)/);
    if (vm) { flushVersion(); v = { version: vm[1], date: vm[2], title: vm[3].trim(), summary: '', files: [] }; continue; }
    if (!v) continue;

    // ── Summary start
    if (line.match(/^\*\*Summary:\*\*/)) {
      summaryMode = true;
      summaryLines.push(line.replace(/^\*\*Summary:\*\*\s*/, '').trim());
      continue;
    }

    // ── Section heading (### ...) — stop summary collection
    if (line.startsWith('###')) {
      if (summaryMode) { v.summary = summaryLines.join(' ').replace(/\s+/g, ' ').trim(); summaryMode = false; summaryLines = []; }
      continue;
    }

    // ── Trailing footer / hr
    if (line.trim() === '---' || line.startsWith('*Each future')) {
      if (summaryMode) { v.summary = summaryLines.join(' ').replace(/\s+/g, ' ').trim(); summaryMode = false; summaryLines = []; }
      continue;
    }

    // ── Continue collecting summary (multi-paragraph)
    // Stop if we hit a clear file-heading pattern (line is just **bold**)
    if (summaryMode) {
      const isBoldHeading = line.match(/^\*\*[^*\n]+\*\*(?:\s*\([^)]+\))?$/);
      if (!isBoldHeading) { summaryLines.push(line.trim()); continue; }
      // Otherwise fall through to file heading handling
      v.summary = summaryLines.join(' ').replace(/\s+/g, ' ').trim();
      summaryMode = false; summaryLines = [];
    }

    // ── File heading — **`SKILL.md`** (c003 → c007)  or  **Category name**
    const fm = line.match(/^\*\*(.+?)\*\*(?:\s*\(([^)]+)\))?$/);
    if (fm) {
      flushFile();
      const rawName = fm[1].replace(/`/g, '').trim();
      f = { fileName: rawName, commitRange: fm[2] || null, changes: [] };
      continue;
    }

    // ── Bullet under a file section
    if (f && line.match(/^[-*] /)) {
      const bulletText = line.replace(/^[-*]\s*/, '').trim();
      // Try commit pattern:  **c012 — Name:** detail  or  **c012:** detail
      const cm = bulletText.match(/^\*\*(c\d+)(?:\s*[—–-]\s*([^:*\n]+))?\*\*:?\s*([\s\S]*)/);
      if (cm) {
        f.changes.push({
          commitId: cm[1],
          name:     (cm[2] || '').replace(/\*\*/g, '').trim(),
          detail:   cm[3].replace(/\*\*/g, '').replace(/`/g, '').trim(),
          subItems: [],
        });
      } else {
        f.changes.push({
          commitId: null, name: null,
          detail: bulletText.replace(/\*\*/g, '').replace(/`/g, '').trim(),
          subItems: [],
        });
      }
      continue;
    }

    // ── Indented sub-bullet — attach to last change
    if (f && f.changes.length > 0 && line.match(/^\s{2,}[-*] /)) {
      const sub = line.replace(/^\s+[-*]\s*/, '').replace(/\*\*/g, '').replace(/`/g, '').trim();
      f.changes[f.changes.length - 1].subItems.push(sub);
    }
  }

  flushVersion();
  return results.reverse(); // newest first
}

// ── File card colour by type ──────────────────────────────────────────────────
function fileCardStyle(fileName) {
  const n = fileName.toLowerCase();
  if (n === 'skill.md' || n === 'skill' || n.includes('core skill'))
    return { bg: '#eef2ff', fg: '#4338ca', border: '#c7d2fe', dot: '#6366f1' };
  if (n.startsWith('references/') || n.includes('context') || n.includes('hypothesis')
      || n.includes('worked') || n.includes('actions') || n.includes('report_struct')
      || n.includes('evaluator') || n.includes('reference file') || n.includes('sql pipeline'))
    return { bg: '#f0fdfa', fg: '#0f766e', border: '#99f6e4', dot: '#14b8a6' };
  if (n.startsWith('scripts/') || n.includes('.sh') || n.includes('.py')
      || n.includes('script') || n.includes('report template') || n.includes('evaluation rubric'))
    return { bg: '#faf5ff', fg: '#7e22ce', border: '#e9d5ff', dot: '#a855f7' };
  if (n === 'removed' || n.startsWith('removed'))
    return { bg: '#fef2f2', fg: '#b91c1c', border: '#fecaca', dot: '#ef4444' };
  return { bg: '#f8fafc', fg: '#475569', border: '#e2e8f0', dot: '#94a3b8' };
}

// ── Version sidebar card ──────────────────────────────────────────────────────
function VersionCard({ v, isLatest, active, onClick }) {
  const changedCount = v.files.length;
  return (
    <div className={`cl-version-card${active ? ' active' : ''}`} onClick={onClick}>
      <div className="cl-version-row">
        <span className="cl-version-tag">{v.version}</span>
        {isLatest && <span className="cl-latest-tag">Latest</span>}
      </div>
      <div className="cl-version-date">{v.date}</div>
      <div className="cl-version-meta">
        {changedCount} file{changedCount !== 1 ? 's' : ''} changed
      </div>
    </div>
  );
}

// ── File change card ──────────────────────────────────────────────────────────
function FileChangeCard({ file }) {
  const s = fileCardStyle(file.fileName);
  return (
    <div className="cl-file-card" style={{ borderColor: s.border }}>
      <div className="cl-file-header" style={{ background: s.bg }}>
        <span className="cl-file-dot" style={{ background: s.dot }} />
        <span className="cl-file-name" style={{ color: s.fg }}>{file.fileName}</span>
        {file.commitRange && (
          <span className="cl-commit-range">{file.commitRange}</span>
        )}
      </div>
      <div className="cl-changes">
        {file.changes.map((change, i) => (
          <div key={i} className="cl-change">
            {change.commitId && (
              <span className="cl-commit-badge">{change.commitId}</span>
            )}
            <div className="cl-change-body">
              {change.name && <span className="cl-change-name">{change.name}</span>}
              <span className="cl-change-detail">{change.detail}</span>
              {change.subItems && change.subItems.length > 0 && (
                <ul className="cl-sub-items">
                  {change.subItems.map((sub, si) => <li key={si}>{sub}</li>)}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ChangelogExplorer ────────────────────────────────────────────────────
function ChangelogExplorer() {
  const [versions, setVersions]     = useState([]);
  const [status, setStatus]         = useState('loading');
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    fetch('changelog/CHANGELOG.md')
      .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(text => {
        const parsed = parseChangelog(text);
        setVersions(parsed);
        setStatus('ok');
      })
      .catch(() => setStatus('error'));
  }, []);

  if (status === 'loading') return (
    <div className="cl-shell">
      <div className="tr-loading" style={{ flex: 1 }}>
        <div className="tr-spinner" /><span>Loading changelog…</span>
      </div>
    </div>
  );
  if (status === 'error') return (
    <div className="cl-shell">
      <div className="tr-loading" style={{ flex: 1 }}>
        ⚠️ Could not load changelog/CHANGELOG.md
      </div>
    </div>
  );

  const selected = versions[selectedIdx];

  return (
    <div className="cl-shell">

      {/* ── Version sidebar ── */}
      <div className="cl-sidebar">
        <div className="cl-sidebar-header">
          <div className="cl-sidebar-title">Versions</div>
        </div>
        {versions.map((v, i) => (
          <VersionCard
            key={v.version}
            v={v}
            isLatest={i === 0}
            active={i === selectedIdx}
            onClick={() => setSelectedIdx(i)}
          />
        ))}
      </div>

      {/* ── Detail panel ── */}
      <div className="cl-main">
        {selected ? (
          <div className="cl-detail">

            {/* Header */}
            <div className="cl-detail-header">
              <div className="cl-detail-top">
                <span className="cl-detail-vtag">{selected.version}</span>
                <span className="cl-detail-date">{selected.date}</span>
                {selectedIdx === 0 && (
                  <span className="cl-detail-latest-badge">Latest</span>
                )}
              </div>
              <div className="cl-detail-title">{selected.title}</div>
            </div>

            {/* Summary */}
            {selected.summary && (
              <div className="cl-summary">{selected.summary}</div>
            )}

            {/* File change cards */}
            {selected.files.length > 0 && (
              <>
                <div className="cl-section-label">Changes by file</div>
                <div className="cl-files">
                  {selected.files.map((file, fi) => (
                    <FileChangeCard key={fi} file={file} />
                  ))}
                </div>
              </>
            )}

          </div>
        ) : (
          <div className="cl-empty">No changelog entries found.</div>
        )}
      </div>

    </div>
  );
}
