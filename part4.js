// ── App (Decision Tree view) ──────────────────────────────────────────────────
function DecisionTreeView() {
  // Compute initial zoom based on viewport — targets the ~1450px-wide main action column
  const INIT_ZOOM = Math.min(0.92, Math.max(0.70, (window.innerWidth - 60) / 1500));
  const INIT_PAN_X = Math.max(20, (window.innerWidth - 1450 * INIT_ZOOM) / 2);

  const [zoom, setZoom]             = useState(INIT_ZOOM);
  const [pan,  setPan]              = useState({ x: INIT_PAN_X, y: 10 });
  const [selectedNode, setSelected] = useState(null);
  const [dragging, setDragging]     = useState(false);

  const dragAnchor  = useRef(null);  // { clientX, clientY, panX, panY }
  const dragMoved   = useRef(false); // true once mouse moves >4px after mousedown
  const wrapRef     = useRef(null);

  // ── Derived ──────────────────────────────────────────────────────────────
  const nodeMap = useMemo(
    () => Object.fromEntries(NODES.map(n => [n.id, n])),
    []
  );

  // IDs that stay fully lit when something is selected (selected + its neighbours)
  const litIds = useMemo(() => {
    if (!selectedNode) return null;
    const s = new Set([selectedNode.id]);
    EDGES.forEach(e => {
      if (e.from === selectedNode.id) s.add(e.to);
      if (e.to   === selectedNode.id) s.add(e.from);
    });
    return s;
  }, [selectedNode]);

  const panelOpen = selectedNode !== null;

  // ── Zoom ─────────────────────────────────────────────────────────────────
  const applyZoom = useCallback(delta => {
    setZoom(z => Math.max(0.22, Math.min(2.0, z + delta)));
  }, []);

  const resetView = useCallback(() => {
    const z = Math.min(0.92, Math.max(0.70, (window.innerWidth - 60) / 1500));
    setZoom(z);
    setPan({ x: Math.max(20, (window.innerWidth - 1450 * z) / 2), y: 10 });
  }, []);

  // Non-passive wheel listener so we can preventDefault
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = e => {
      e.preventDefault();
      applyZoom(e.deltaY < 0 ? 0.07 : -0.07);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [applyZoom]);

  // ── Pan (drag) ────────────────────────────────────────────────────────────
  const onMouseDown = useCallback(e => {
    if (e.button !== 0) return;
    setDragging(true);
    dragMoved.current = false;
    dragAnchor.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  }, [pan]);

  const onMouseMove = useCallback(e => {
    if (!dragging || !dragAnchor.current) return;
    const dx = e.clientX - dragAnchor.current.clientX;
    const dy = e.clientY - dragAnchor.current.clientY;
    if (!dragMoved.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      dragMoved.current = true;
    }
    setPan({ x: dragAnchor.current.panX + dx, y: dragAnchor.current.panY + dy });
  }, [dragging]);

  const onMouseUp = useCallback(() => {
    setDragging(false);
    dragAnchor.current = null;
  }, []);

  // ── Selection ─────────────────────────────────────────────────────────────
  const handleNodeClick = useCallback(node => {
    setSelected(prev => prev?.id === node.id ? null : node);
  }, []);

  const handleClose = useCallback(() => setSelected(null), []);

  const onClickCapture = useCallback(e => {
    if (dragMoved.current) {
      e.stopPropagation();
      dragMoved.current = false;
    }
  }, []);

  const onCanvasClick = useCallback(e => {
    const t = e.target;
    if (
      t === wrapRef.current ||
      t.classList.contains('canvas-inner') ||
      t.tagName === 'svg' ||
      t.classList.contains('edges-svg')
    ) {
      setSelected(null);
    }
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Canvas ── */}
      <div
        ref={wrapRef}
        className={[
          'canvas-wrap',
          dragging  ? 'dragging'   : '',
          panelOpen ? 'panel-open' : '',
        ].filter(Boolean).join(' ')}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClickCapture={onClickCapture}
        onClick={onCanvasClick}
      >
        <div
          className="canvas-inner"
          style={{
            width:  CANVAS_W,
            height: CANVAS_H,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          <SvgEdges edges={EDGES} nodeMap={nodeMap} selectedId={selectedNode?.id || null} />

          {SECTION_LABELS.slice(1).map(sec => (
            <div key={`sep-${sec.text}`} className="phase-line" style={{ top: sec.y - 20 }} />
          ))}
          {SECTION_LABELS.map(sec => (
            <div key={sec.text} className="section-label" style={{ left: sec.x, top: sec.y }}>
              {sec.text}
            </div>
          ))}
          {NODES.map(node => (
            <NodeCard
              key={node.id}
              node={node}
              selected={selectedNode?.id === node.id}
              dimmed={litIds !== null && !litIds.has(node.id)}
              onClick={handleNodeClick}
            />
          ))}
        </div>
      </div>

      <SidePanel node={selectedNode} nodeMap={nodeMap} edges={EDGES} onClose={handleClose} />
      <Legend />
      <ZoomControls onZoom={applyZoom} onReset={resetView} />
    </>
  );
}

// ── Root App — owns the top-level tab switcher ────────────────────────────────
function App() {
  const [activeTab, setActiveTab] = useState('tree'); // 'tree' | 'runs'

  return (
    <div className="app-shell">

      {/* ── Top navigation bar ── */}
      <div className="top-nav">
        <span className="top-nav-logo">CVR · RCA</span>
        <div className="top-nav-divider" />
        <button
          className={`tab-pill${activeTab === 'tree' ? ' active' : ''}`}
          onClick={() => setActiveTab('tree')}>
          🗺 Decision Tree
        </button>
        <button
          className={`tab-pill${activeTab === 'runs' ? ' active' : ''}`}
          onClick={() => setActiveTab('runs')}>
          🧪 Test Runs
        </button>

        {/* Stats pill — only visible on tree tab */}
        {activeTab === 'tree' && (
          <div className="topbar-pill" style={{
            marginLeft: 4,
            background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0'
          }}>
            {NODES.length} nodes · {EDGES.length} edges
          </div>
        )}

        {activeTab === 'tree' && (
          <div className="topbar-hint">
            Click any node to inspect &nbsp;·&nbsp; Drag to pan &nbsp;·&nbsp; Scroll to zoom
          </div>
        )}
      </div>

      {/* ── Tab content ── */}
      <div className="tab-content">
        {activeTab === 'tree' && <DecisionTreeView />}
        {activeTab === 'runs' && <TestRunsExplorer />}
      </div>

    </div>
  );
}

// ── Mount ─────────────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
