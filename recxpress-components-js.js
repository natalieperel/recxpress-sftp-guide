const { useState } = React;

// ── Shared UI ─────────────────────────────────────────────────────────────────

function SlideHeader({ title }) {
  return (
    <div style={{ borderBottom: `3px solid ${BRAND.accent}`, paddingBottom: 10, marginBottom: 14, flexShrink: 0 }}>
      <h2 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: BRAND.dark, lineHeight: 1.2 }}>{title}</h2>
    </div>
  );
}

function NumBadge({ n, bg }) {
  return (
    <span style={{ minWidth: 22, width: 22, height: 22, background: bg || BRAND.accent, color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
      {n}
    </span>
  );
}

function NavBtn({ label, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ background: "#444", color: "#fff", border: "none", borderRadius: 6, padding: "7px 14px", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1, fontSize: 13 }}>
      {label}
    </button>
  );
}

// ── Slide types ───────────────────────────────────────────────────────────────

function TitleSlide({ slide, client }) {
  const t = client ? slide.clientTitle : slide.title;
  const s = client ? slide.clientSubtitle : slide.subtitle;
  return (
    <div style={{ background: BRAND.dark, color: BRAND.white, width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", boxSizing: "border-box", padding: "32px 48px", overflow: "hidden" }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: BRAND.accent, letterSpacing: 1, marginBottom: 20 }}>Peresoft</div>
      <h1 style={{ fontSize: 34, fontWeight: 800, margin: "0 0 12px", lineHeight: 1.15 }}>{t}</h1>
      <p style={{ fontSize: 17, color: "#b0b8c1", margin: 0 }}>{s}</p>
      <div style={{ marginTop: 28, width: 50, height: 4, background: BRAND.accent, borderRadius: 2 }} />
    </div>
  );
}

function BulletsSlide({ slide, client }) {
  const pts = (client && slide.clientPoints) ? slide.clientPoints : slide.points;
  const title = (client && slide.clientTitle) ? slide.clientTitle : slide.title;
  return (
    <div style={{ width: "100%", height: "100%", boxSizing: "border-box", padding: "24px 32px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <SlideHeader title={(slide.icon ? slide.icon + " " : "") + title} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, overflow: "hidden" }}>
        {pts.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", flexShrink: 0 }}>
            <NumBadge n={i + 1} />
            <span style={{ fontSize: 14.5, color: BRAND.text, lineHeight: 1.45 }}>{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepsSlide({ slide, client }) {
  const title = (client && slide.clientTitle) ? slide.clientTitle : slide.title;
  const steps = (client && slide.clientSteps) ? slide.clientSteps : slide.steps;
  return (
    <div style={{ width: "100%", height: "100%", boxSizing: "border-box", padding: "24px 32px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <SlideHeader title={title} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, overflow: "hidden" }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", background: i % 2 === 0 ? BRAND.light : BRAND.mid, borderRadius: 7, padding: "10px 14px", flexShrink: 0 }}>
            <NumBadge n={s.step} bg={BRAND.dark} />
            <span style={{ fontSize: 14, color: BRAND.text, lineHeight: 1.35 }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MethodsSlide({ slide, client }) {
  const title = (client && slide.clientTitle) ? slide.clientTitle : slide.title;
  return (
    <div style={{ width: "100%", height: "100%", boxSizing: "border-box", padding: "24px 32px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <SlideHeader title={title} />
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, alignContent: "center", overflow: "hidden" }}>
        {slide.methods.map((m, i) => (
          <div key={i} style={{ borderLeft: `4px solid ${BRAND.accent}`, background: BRAND.light, borderRadius: 7, padding: "10px 14px", overflow: "hidden" }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{m.icon} {m.name}</div>
            <div style={{ fontSize: 12, color: "#444", lineHeight: 1.35 }}>{client && m.clientDesc ? m.clientDesc : m.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableSlide({ slide, client }) {
  const title = (client && slide.clientTitle) ? slide.clientTitle : slide.title;
  return (
    <div style={{ width: "100%", height: "100%", boxSizing: "border-box", padding: "24px 32px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <SlideHeader title={title} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, tableLayout: "fixed" }}>
          <colgroup><col style={{ width: "32%" }} /><col style={{ width: "68%" }} /></colgroup>
          <thead>
            <tr style={{ background: BRAND.dark, color: "#fff" }}>
              <th style={{ padding: "8px 12px", textAlign: "left" }}>{client ? "Detail" : "Field"}</th>
              <th style={{ padding: "8px 12px", textAlign: "left" }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {slide.rows.map((r, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? BRAND.light : BRAND.mid }}>
                <td style={{ padding: "8px 12px", fontWeight: 700, color: BRAND.accent, wordBreak: "break-word" }}>{r.field}</td>
                <td style={{ padding: "8px 12px", color: BRAND.text, wordBreak: "break-word" }}>{client && r.clientValue ? r.clientValue : r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KeyFileSlide({ slide, client }) {
  const title = (client && slide.clientTitle) ? slide.clientTitle : slide.title;
  const steps = (client && slide.clientSteps) ? slide.clientSteps : slide.steps;
  const note = client ? slide.clientNote : slide.warning;
  return (
    <div style={{ width: "100%", height: "100%", boxSizing: "border-box", padding: "24px 32px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <SlideHeader title={title} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 8, overflow: "hidden" }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", flexShrink: 0 }}>
            <NumBadge n={s.step} />
            <span style={{ fontSize: 13.5, color: BRAND.text, lineHeight: 1.4 }}>{s.label}</span>
          </div>
        ))}
        {note && (
          <div style={{ marginTop: 8, background: client ? "#e8f4fd" : "#fff3cd", border: `1px solid ${client ? "#90caf9" : "#f0c040"}`, borderRadius: 7, padding: "8px 14px", fontSize: 12, color: client ? "#1a5276" : "#7a5c00", flexShrink: 0 }}>
            {client ? "ℹ️" : "⚠️"} {note}
          </div>
        )}
      </div>
    </div>
  );
}

function RebexSlide({ slide, client }) {
  const title = (client && slide.clientTitle) ? slide.clientTitle : slide.title;
  const intro = (client && slide.clientIntro) ? slide.clientIntro : slide.intro;
  const steps = (client && slide.clientSteps) ? slide.clientSteps : slide.steps;
  return (
    <div style={{ width: "100%", height: "100%", boxSizing: "border-box", padding: "24px 32px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <SlideHeader title={title} />
      <div style={{ background: BRAND.dark, color: "#b0b8c1", borderRadius: 7, padding: "8px 14px", fontSize: 12, marginBottom: 12, flexShrink: 0 }}>{intro}</div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 9, overflow: "hidden" }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", flexShrink: 0 }}>
            <NumBadge n={s.step} bg={BRAND.dark} />
            <span style={{ fontSize: 13.5, color: BRAND.text, lineHeight: 1.4 }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TipsSlide({ slide, client }) {
  const title = (client && slide.clientTitle) ? slide.clientTitle : slide.title;
  return (
    <div style={{ width: "100%", height: "100%", boxSizing: "border-box", padding: "24px 32px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <SlideHeader title={title} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 9, overflow: "hidden" }}>
        {slide.tips.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: BRAND.light, borderRadius: 7, padding: "9px 14px", flexShrink: 0 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{t.icon}</span>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: BRAND.dark, marginBottom: 2 }}>{t.label}</div>
              <div style={{ fontSize: 12, color: "#555", lineHeight: 1.35 }}>{client && t.clientDesc ? t.clientDesc : t.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChecklistSlide({ slide, client }) {
  const items = (client && slide.clientChecklist) ? slide.clientChecklist : slide.checklist;
  const title = (client && slide.clientTitle) ? slide.clientTitle : slide.title;
  const [checked, setChecked] = useState(new Array(10).fill(false));
  const toggle = (i) => setChecked(c => { const n = [...c]; n[i] = !n[i]; return n; });
  return (
    <div style={{ width: "100%", height: "100%", boxSizing: "border-box", padding: "24px 32px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <SlideHeader title={title} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 8, overflow: "hidden" }}>
        {items.map((item, i) => (
          <div key={i} onClick={() => toggle(i)} style={{ display: "flex", gap: 12, alignItems: "center", background: checked[i] ? "#e6f9ec" : BRAND.light, borderRadius: 7, padding: "9px 14px", cursor: "pointer", border: `1px solid ${checked[i] ? "#4caf7d" : "transparent"}`, transition: "all 0.2s", flexShrink: 0 }}>
            <div style={{ minWidth: 20, width: 20, height: 20, borderRadius: "50%", border: `2px solid ${checked[i] ? "#4caf7d" : "#bbb"}`, background: checked[i] ? "#4caf7d" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {checked[i] && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
            </div>
            <span style={{ fontSize: 13, color: checked[i] ? "#2e7d50" : BRAND.text, textDecoration: checked[i] ? "line-through" : "none", lineHeight: 1.35 }}>{item}</span>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", fontSize: 11, color: "#aaa", marginTop: 6, flexShrink: 0 }}>Click items to mark complete</div>
    </div>
  );
}

function renderSlide(slide, client) {
  const p = { slide, client };
  switch (slide.type) {
    case "title":     return <TitleSlide {...p} />;
    case "bullets":   return <BulletsSlide {...p} />;
    case "steps":     return <StepsSlide {...p} />;
    case "methods":   return <MethodsSlide {...p} />;
    case "table":     return <TableSlide {...p} />;
    case "keyfile":   return <KeyFileSlide {...p} />;
    case "rebex":     return <RebexSlide {...p} />;
    case "tips":      return <TipsSlide {...p} />;
    case "checklist": return <ChecklistSlide {...p} />;
    default:          return null;
  }
}

// ── PDF Modal ─────────────────────────────────────────────────────────────────

function PDFModal({ client, onClose }) {
  const [page, setPage] = useState(0);
  const total = slides.length;
  const slide = slides[page];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, boxSizing: "border-box" }}>
      <div style={{ width: "100%", maxWidth: 820, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{client ? "🤝 Client Version" : "📋 Partner Version"}</span>
          <span style={{ color: "#aaa", fontSize: 12, marginLeft: 10 }}>Slide {page + 1} of {total}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => printSlides(client)} style={{ background: BRAND.accent, color: "#fff", border: "none", borderRadius: 6, padding: "7px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
            🖨 Print / Save as PDF
          </button>
          <button onClick={onClose} style={{ background: "#444", color: "#fff", border: "none", borderRadius: 6, padding: "7px 14px", cursor: "pointer", fontSize: 13 }}>✕ Close</button>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 820, position: "relative", paddingTop: "56.25%", flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }}
          dangerouslySetInnerHTML={{ __html: getSlideHTML(slide, client) }}
        />
      </div>

      {!client && slide.notes && (
        <div style={{ width: "100%", maxWidth: 820, marginTop: 8, background: "#fffde7", border: "1px solid #f0e060", borderRadius: 8, padding: "8px 14px", fontSize: 12, color: "#5a4a00" }}>
          <strong>🗒 Notes:</strong> {slide.notes}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center" }}>
        <NavBtn label="⏮" onClick={() => setPage(0)} disabled={page === 0} />
        <NavBtn label="‹" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} />
        <div style={{ display: "flex", gap: 5 }}>
          {slides.map((_, i) => (
            <div key={i} onClick={() => setPage(i)} style={{ width: i === page ? 18 : 6, height: 6, borderRadius: 3, background: i === page ? BRAND.accent : "#666", cursor: "pointer", transition: "all 0.2s" }} />
          ))}
        </div>
        <NavBtn label="›" onClick={() => setPage(p => Math.min(total - 1, p + 1))} disabled={page === total - 1} />
        <NavBtn label="⏭" onClick={() => setPage(total - 1)} disabled={page === total - 1} />
      </div>
    </div>
  );
}
