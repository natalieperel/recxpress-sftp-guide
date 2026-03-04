/**
 * Generates self-contained HTML for a single slide.
 * Used by the PDF/print iframe.
 */
function getSlideHTML(slide, client) {
  const title = client ? (slide.clientTitle || slide.title) : slide.title;
  const ac = BRAND.accent;
  const dk = BRAND.dark;

  const badge = (n, bg) =>
    `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:20px;width:20px;height:20px;background:${bg};color:#fff;border-radius:50%;font-weight:700;font-size:10px;flex-shrink:0;">${n}</span>`;

  const header =
    `<div style="border-bottom:3px solid ${ac};padding-bottom:8px;margin-bottom:12px;">
      <h2 style="margin:0;font-size:18px;font-weight:800;color:${dk};">${title}</h2>
    </div>`;

  if (slide.type === "title") {
    const t = client ? slide.clientTitle : slide.title;
    const s = client ? slide.clientSubtitle : slide.subtitle;
    return `<div style="background:${dk};color:#fff;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:32px 48px;box-sizing:border-box;">
      <div style="font-size:18px;font-weight:800;color:${ac};margin-bottom:16px;">Peresoft</div>
      <h1 style="font-size:26px;font-weight:800;margin:0 0 10px;">${t}</h1>
      <p style="font-size:14px;color:#b0b8c1;margin:0;">${s}</p>
      <div style="margin-top:20px;width:40px;height:4px;background:${ac};border-radius:2px;"></div>
    </div>`;
  }

  if (slide.type === "bullets") {
    const pts = (client && slide.clientPoints) ? slide.clientPoints : slide.points;
    return `<div style="padding:20px 24px;box-sizing:border-box;height:100%;">${header}
      ${pts.map((p, i) => `<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:9px;">${badge(i + 1, ac)}<span style="font-size:13px;line-height:1.4;">${p}</span></div>`).join("")}
    </div>`;
  }

  if (slide.type === "steps") {
    const st = (client && slide.clientSteps) ? slide.clientSteps : slide.steps;
    return `<div style="padding:20px 24px;box-sizing:border-box;height:100%;">${header}
      ${st.map((s, i) => `<div style="display:flex;gap:10px;align-items:center;background:${i % 2 === 0 ? "#f5f5f5" : "#e8e8e8"};border-radius:6px;padding:8px 12px;margin-bottom:7px;">${badge(s.step, dk)}<span style="font-size:13px;">${s.label}</span></div>`).join("")}
    </div>`;
  }

  if (slide.type === "methods") {
    return `<div style="padding:20px 24px;box-sizing:border-box;height:100%;">${header}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        ${slide.methods.map(m => `<div style="border-left:4px solid ${ac};background:#f5f5f5;border-radius:6px;padding:9px 12px;">
          <div style="font-weight:700;font-size:12px;margin-bottom:3px;">${m.icon} ${m.name}</div>
          <div style="font-size:11px;color:#444;">${client && m.clientDesc ? m.clientDesc : m.desc}</div>
        </div>`).join("")}
      </div>
    </div>`;
  }

  if (slide.type === "table") {
    return `<div style="padding:20px 24px;box-sizing:border-box;height:100%;">${header}
      <table style="width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed;">
        <colgroup><col style="width:32%"/><col style="width:68%"/></colgroup>
        <thead><tr style="background:${dk};color:#fff;">
          <th style="padding:7px 10px;text-align:left;">${client ? "Detail" : "Field"}</th>
          <th style="padding:7px 10px;text-align:left;">Description</th>
        </tr></thead>
        <tbody>
          ${slide.rows.map((r, i) => `<tr style="background:${i % 2 === 0 ? "#f5f5f5" : "#e8e8e8"};">
            <td style="padding:7px 10px;font-weight:700;color:${ac};word-break:break-word;">${r.field}</td>
            <td style="padding:7px 10px;word-break:break-word;">${client && r.clientValue ? r.clientValue : r.value}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
  }

  if (slide.type === "keyfile") {
    const kst = (client && slide.clientSteps) ? slide.clientSteps : slide.steps;
    const note = client ? slide.clientNote : slide.warning;
    return `<div style="padding:20px 24px;box-sizing:border-box;height:100%;">${header}
      ${kst.map(s => `<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:8px;">${badge(s.step, ac)}<span style="font-size:13px;line-height:1.4;">${s.label}</span></div>`).join("")}
      ${note ? `<div style="margin-top:8px;background:${client ? "#e8f4fd" : "#fff3cd"};border:1px solid ${client ? "#90caf9" : "#f0c040"};border-radius:6px;padding:7px 12px;font-size:11px;color:${client ? "#1a5276" : "#7a5c00"};">${client ? "ℹ️ " : "⚠️ "}${note}</div>` : ""}
    </div>`;
  }

  if (slide.type === "rebex") {
    const ri = (client && slide.clientIntro) ? slide.clientIntro : slide.intro;
    const rst = (client && slide.clientSteps) ? slide.clientSteps : slide.steps;
    return `<div style="padding:20px 24px;box-sizing:border-box;height:100%;">${header}
      <div style="background:${dk};color:#b0b8c1;border-radius:6px;padding:7px 12px;font-size:11px;margin-bottom:10px;">${ri}</div>
      ${rst.map(s => `<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:8px;">${badge(s.step, dk)}<span style="font-size:13px;line-height:1.4;">${s.label}</span></div>`).join("")}
    </div>`;
  }

  if (slide.type === "tips") {
    return `<div style="padding:20px 24px;box-sizing:border-box;height:100%;">${header}
      ${slide.tips.map(t => `<div style="display:flex;gap:10px;align-items:flex-start;background:#f5f5f5;border-radius:6px;padding:8px 12px;margin-bottom:8px;">
        <span style="font-size:16px;flex-shrink:0;">${t.icon}</span>
        <div>
          <div style="font-weight:700;font-size:12px;margin-bottom:2px;">${t.label}</div>
          <div style="font-size:11px;color:#555;">${client && t.clientDesc ? t.clientDesc : t.desc}</div>
        </div>
      </div>`).join("")}
    </div>`;
  }

  if (slide.type === "checklist") {
    const items = (client && slide.clientChecklist) ? slide.clientChecklist : slide.checklist;
    return `<div style="padding:20px 24px;box-sizing:border-box;height:100%;">${header}
      ${items.map(item => `<div style="display:flex;gap:10px;align-items:center;background:#f5f5f5;border-radius:6px;padding:8px 12px;margin-bottom:7px;">
        <div style="width:18px;height:18px;border-radius:50%;border:2px solid #bbb;background:#fff;flex-shrink:0;"></div>
        <span style="font-size:13px;">${item}</span>
      </div>`).join("")}
    </div>`;
  }

  return `<div style="padding:24px;">${title}</div>`;
}

/**
 * Injects all slides into a hidden iframe and triggers the browser print dialog.
 */
function printSlides(client) {
  const slidePages = slides.map((s, idx) => {
    const content = getSlideHTML(s, client);
    const notes = (!client && s.notes)
      ? `<div style="margin-top:5px;background:#fffde7;border:1px solid #f0c040;border-radius:4px;padding:6px 10px;font-size:10px;color:#5a4a00;"><strong>Notes:</strong> ${s.notes}</div>`
      : "";
    return `<div style="page-break-after:always;padding:8mm;box-sizing:border-box;">
      <div style="font-size:9px;color:#999;text-align:right;margin-bottom:3px;">${idx + 1} / ${slides.length}</div>
      <div style="width:100%;aspect-ratio:16/9;overflow:hidden;border-radius:6px;border:1px solid #ddd;">${content}</div>
      ${notes}
    </div>`;
  }).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>RecXpress SFTP — ${client ? "Client" : "Partner"} Version</title>
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: Arial, sans-serif; }
      @page { size: A4 landscape; margin: 0; }
      @media print { body { margin: 0; } }
    </style>
  </head><body>${slidePages}</body></html>`;

  let iframe = document.getElementById("ps-print-frame");
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "ps-print-frame";
    iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:297mm;height:210mm;border:none;";
    document.body.appendChild(iframe);
  }
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();
  setTimeout(() => { iframe.contentWindow.focus(); iframe.contentWindow.print(); }, 900);
}
