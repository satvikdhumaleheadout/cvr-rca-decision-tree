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
