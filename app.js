function App() {
  const [current, setCurrent] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [clientMode, setClientMode] = useState(false);
  const [showPDFMenu, setShowPDFMenu] = useState(false);
  const [printMode, setPrintMode] = useState(false);
  const [printClient, setPrintClient] = useState(false);

  const total = slides.length;
  const slide = slides[current];

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", background: "#2a2a2a", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px", boxSizing: "border-box" }}>

      {printMode && <PDFModal client={printClient} onClose={() => setPrintMode(false)} />}

      {/* Top bar */}
      <div style={{ width: "100%", maxWidth: 820, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexShrink: 0, gap: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#aaa", fontSize: 12 }}>Slide {current + 1} of {total}</span>
          {clientMode && <span style={{ background: "#4caf7d", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "2px 8px" }}>CLIENT VIEW</span>}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>

          {/* Partner / Client toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 7, background: "#3a3a3a", borderRadius: 8, padding: "5px 12px" }}>
            <span style={{ fontSize: 11, color: clientMode ? "#888" : "#fff", fontWeight: clientMode ? 400 : 600 }}>Partner</span>
            <div onClick={() => setClientMode(m => !m)} style={{ width: 36, height: 20, background: clientMode ? "#4caf7d" : "#666", borderRadius: 10, position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 2, left: clientMode ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
            </div>
            <span style={{ fontSize: 11, color: clientMode ? "#fff" : "#888", fontWeight: clientMode ? 600 : 400 }}>Client</span>
          </div>

          {/* PDF dropdown */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowPDFMenu(m => !m)} style={{ background: BRAND.accent, color: "#fff", border: "none", borderRadius: 6, padding: "6px 13px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
              ⬇ PDF {showPDFMenu ? "▲" : "▼"}
            </button>
            {showPDFMenu && (
              <div style={{ position: "absolute", right: 0, top: "110%", background: "#fff", borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.3)", overflow: "hidden", zIndex: 100, minWidth: 190 }}>
                <div
                  onClick={() => { setPrintClient(false); setPrintMode(true); setShowPDFMenu(false); }}
                  style={{ padding: "11px 16px", fontSize: 13, cursor: "pointer", borderBottom: "1px solid #eee", color: BRAND.dark }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                >
                  📋 Partner Version
                  <span style={{ fontSize: 11, color: "#888", display: "block" }}>With speaker notes</span>
                </div>
                <div
                  onClick={() => { setPrintClient(true); setPrintMode(true); setShowPDFMenu(false); }}
                  style={{ padding: "11px 16px", fontSize: 13, cursor: "pointer", color: BRAND.dark }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                >
                  🤝 Client Version
                  <span style={{ fontSize: 11, color: "#888", display: "block" }}>Plain language, no notes</span>
                </div>
              </div>
            )}
          </div>

          {/* Notes toggle */}
          <button onClick={() => setShowNotes(n => !n)} style={{ background: showNotes ? "#555" : "#444", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>
            🗒 Notes
          </button>
        </div>
      </div>

      {/* Slide frame */}
      <div style={{ width: "100%", maxWidth: 820, flexShrink: 0 }} onClick={() => { if (showPDFMenu) setShowPDFMenu(false); }}>
        <div style={{ position: "relative", width: "100%", paddingTop: "56.25%" }}>
          <div style={{ position: "absolute", inset: 0, background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.5)", border: `2px solid ${clientMode ? "#4caf7d" : "transparent"}`, transition: "border 0.3s" }}>
            {renderSlide(slide, clientMode)}
          </div>
        </div>
      </div>

      {/* Speaker notes */}
      {showNotes && !clientMode && slide.notes && (
        <div style={{ width: "100%", maxWidth: 820, marginTop: 8, background: "#fffde7", border: "1px solid #f0e060", borderRadius: 8, padding: "10px 16px", fontSize: 12, color: "#5a4a00", flexShrink: 0, boxSizing: "border-box" }}>
          <strong>🗒 Speaker Notes:</strong> {slide.notes}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center", flexShrink: 0, flexWrap: "wrap", justifyContent: "center" }}>
        <NavBtn label="⏮" onClick={() => setCurrent(0)} disabled={current === 0} />
        <NavBtn label="‹ Prev" onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} />
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {slides.map((_, i) => (
            <div key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? 20 : 7, height: 7, borderRadius: 4, background: i === current ? (clientMode ? "#4caf7d" : BRAND.accent) : "#666", cursor: "pointer", transition: "all 0.2s", flexShrink: 0 }} />
          ))}
        </div>
        <NavBtn label="Next ›" onClick={() => setCurrent(c => Math.min(total - 1, c + 1))} disabled={current === total - 1} />
        <NavBtn label="⏭" onClick={() => setCurrent(total - 1)} disabled={current === total - 1} />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
