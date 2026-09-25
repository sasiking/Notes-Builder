function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  importedFileName = file.name;
  manualTitleOverride = null;
  const reader = new FileReader();
  reader.onload = function(e) {
    importHTMLContent(e.target.result);
  };
  reader.readAsText(file);
  event.target.value = '';
}

function importHTMLContent(rawHTML) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHTML, 'text/html');
  const sourceContainer = doc.querySelector('.notebook-container') || doc.body;
  if (!sourceContainer) {
    alert('Could not locate content in file.');
    return;
  }

  const canvas = document.getElementById('editorCanvas');
  canvas.innerHTML = '';
  
  sourceContainer.querySelectorAll(
    '.block-controls, .card-toolbar, .table-toolbar, .mains-box-toolbar, .mains-item-controls, ' +
    '.sticky-del-btn, .text-del-btn, .mid-insert-menu, .eq-del-btn, .note-image-del, .note-image-toolbar, .expand-box-toolbar'
  ).forEach(el => el.remove());

  const rawBlocks = [];
  Array.from(sourceContainer.children).forEach(child => {
    if (child.tagName === 'SCRIPT' || child.tagName === 'STYLE') return;
    if (child.classList.contains('block-wrapper')) {
      Array.from(child.children).forEach(innerChild => {
        if (!innerChild.classList.contains('block-controls')) {
          rawBlocks.push(innerChild);
        }
      });
    } else {
      rawBlocks.push(child);
    }
  });

  rawBlocks.forEach(contentEl => {
    const wrapped = wrapInBlock(contentEl.outerHTML);
    canvas.appendChild(wrapped);
    makeEditable(wrapped);
  });

  updateTitleUI();
}

function exportCleanHTML() {
  const canvasClone = document.getElementById('editorCanvas').cloneNode(true);
  
  canvasClone.querySelectorAll(
    '.block-controls, .card-toolbar, .table-toolbar, .mains-box-toolbar, ' +
    '.mains-item-controls, .sticky-del-btn, .text-del-btn, .note-image-del, ' +
    '.note-image-toolbar, .mid-insert-menu, .eq-del-btn, .expand-box-toolbar'
  ).forEach(el => el.remove());
  
  canvasClone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));

  const resolvedTitle = resolveDocumentTitle();
  let downloadFilename = importedFileName || ((resolvedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'notes_output') + '.html');

  // Load stylesheet definitions directly
  const fullCSS = `
:root {
  --bg-page: #fbfbf9; --ruled-line: #e3ebf5; --margin-line: #f7a8b8;
  --ink-blue: #0f3870; --ink-dark: #1e293b; --ink-red: #b91c1c; --ink-green: #15803d;
  --ink-purple: #6b21a8; --ink-orange: #c2410c; --ink-yellow: #a16207; --ink-teal: #0f766e;
  --ink-cyan: #0369a1; --ink-indigo: #4338ca; --ink-rose: #be123c; --ink-amber: #b45309;
  --highlight-yellow: rgba(254, 240, 138, 0.85); --highlight-green: rgba(187, 247, 208, 0.75);
  --highlight-pink: rgba(251, 207, 232, 0.75); --highlight-blue: rgba(186, 230, 253, 0.75);
  --highlight-orange: rgba(254, 215, 170, 0.85); --highlight-purple: rgba(233, 213, 255, 0.75);
  --highlight-teal: rgba(153, 246, 228, 0.75); --highlight-amber: rgba(253, 230, 138, 0.85);
  --sticky-yellow: #fef9c3; --sticky-pink: #ffe4e6; --sticky-blue: #e0f2fe; --shadow: 0 4px 12px rgba(0,0,0,0.06);
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background-color: #cbd5e1; display: flex; justify-content: center; padding: 25px 10px; height: auto; overflow: visible; font-family: 'Kalam', cursive, sans-serif; color: var(--ink-dark); }
.notebook-container { width: 100%; max-width: 940px; min-height: 1200px; background-color: var(--bg-page); background-image: linear-gradient(90deg, transparent 48px, var(--margin-line) 48px, var(--margin-line) 50px, transparent 50px), linear-gradient(var(--ruled-line) 1px, transparent 1px); background-size: 100% 28px, 100% 28px; background-repeat: repeat-y, repeat; padding: 35px 35px 80px 65px; border-radius: 4px; box-shadow: 0 12px 30px rgba(0,0,0,0.15); line-height: 28px; position: relative; }
.block-wrapper { position: relative; margin-bottom: 16px; break-inside: avoid; }
h1, h2, h3, h4 { font-family: 'Caveat', cursive; font-weight: 700; }
.title-section { text-align: center; border-bottom: 3px double var(--ink-blue); padding-bottom: 12px; margin-bottom: 20px; }
.title-section h1 { font-size: 38px; color: var(--ink-blue); letter-spacing: 0.5px; line-height: 1.15; }
.title-section .subtitle { font-size: 19px; color: var(--ink-red); font-family: 'Patrick Hand', cursive; }
.badge-tag { display: inline-block; background: var(--ink-purple); color: #fff; padding: 2px 14px; border-radius: 12px; font-family: 'Inter', sans-serif; font-size: 11.5px; font-weight: 800; margin-top: 4px; }
.section-header { font-size: 26px; color: var(--ink-red); margin: 24px 0 10px 0; display: flex; align-items: center; border-bottom: 2px dashed rgba(185, 28, 28, 0.4); padding-bottom: 2px; }
.section-header span { background: var(--highlight-yellow); padding: 0 8px; border-radius: 4px; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 12px; }
.grid-col { display: flex; flex-direction: column; }
.card-note { background: rgba(255,255,255,0.88); border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 12px 16px; box-shadow: var(--shadow); margin-bottom: 12px; }
.card-note.blue   { border-left: 6px solid var(--ink-blue) !important; }
.card-note.green  { border-left: 6px solid var(--ink-green) !important; }
.card-note.purple { border-left: 6px solid var(--ink-purple) !important; }
.card-note.red    { border-left: 6px solid var(--ink-red) !important; }
.card-note.yellow { border-left: 6px solid var(--ink-yellow) !important; }
.card-note.teal   { border-left: 6px solid var(--ink-teal) !important; }
.card-note.amber  { border-left: 6px solid var(--ink-amber) !important; }
.card-note.orange { border-left: 6px solid var(--ink-orange) !important; }
.card-note.rose   { border-left: 6px solid var(--ink-rose) !important; }
.card-note.blue h3   { color: var(--ink-blue) !important; }
.card-note.green h3  { color: var(--ink-green) !important; }
.card-note.purple h3 { color: var(--ink-purple) !important; }
.card-note.red h3    { color: var(--ink-red) !important; }
.card-note.yellow h3 { color: var(--ink-yellow) !important; }
.card-note.teal h3   { color: var(--ink-teal) !important; }
.card-note.amber h3  { color: var(--ink-amber) !important; }
.card-note.orange h3 { color: var(--ink-orange) !important; }
.card-note.rose h3   { color: var(--ink-rose) !important; }
.bullet-list { list-style: none; padding-left: 2px; }
.bullet-list li { margin-bottom: 5px; position: relative; padding-left: 22px; font-size: 16px; line-height: 24px; }
.bullet-list li::before { content: "➔"; position: absolute; left: 0; color: var(--ink-blue); font-weight: bold; }
.sub-point { margin-left: 18px; padding-left: 10px; border-left: 2px dashed #94a3b8; font-size: 15px; line-height: 22px; margin-top: 4px; margin-bottom: 8px; }
.dot-point { margin-left: 14px; position: relative; padding-left: 16px; font-size: 15.5px; line-height: 23px; margin-top: 3px; margin-bottom: 5px; }
.dot-point::before { content: "•"; position: absolute; left: 2px; color: var(--ink-dark); font-weight: 900; font-size: 16px; }
.sticky { position: relative; padding: 14px 16px; border-radius: 2px; box-shadow: 2px 4px 10px rgba(0,0,0,0.1); transform: rotate(-0.5deg); margin: 12px 0; font-size: 15.5px; line-height: 22px; font-family: 'Patrick Hand', cursive; }
.sticky.yellow { background: var(--sticky-yellow); border-top: 8px solid #fef08a; }
.sticky.pink { background: var(--sticky-pink); border-top: 8px solid #fbcfe8; transform: rotate(0.6deg); }
.sticky.blue { background: var(--sticky-blue); border-top: 8px solid #bae6fd; }
.table-block-wrapper { position: relative; margin: 14px 0 18px 0; }
.hand-table { width: 100%; border-collapse: collapse; margin: 4px 0 10px 0; background: rgba(255,255,255,0.85); font-size: 15px; }
.hand-table th, .hand-table td { border: 1px solid #94a3b8; padding: 7px 10px; text-align: left; line-height: 20px; }
.hand-table th { background: #e2e8f0; color: var(--ink-blue); font-family: 'Caveat', cursive; font-size: 19px; }
.exam-trick { background: #fff1f2; border: 2px dashed var(--ink-red); border-radius: 8px; padding: 14px 18px; margin: 16px 0; position: relative; }
.exam-trick::before { content: "⚡ TOPPER'S SPEED TRICKS & FORMULA HACKS ⚡"; font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 800; color: var(--ink-red); position: absolute; top: -11px; left: 18px; background: #fff; padding: 0 8px; border: 1px solid var(--ink-red); border-radius: 4px; }
.hl-yellow { background: var(--highlight-yellow); padding: 1px 4px; border-radius: 3px; }
.hl-green  { background: var(--highlight-green); padding: 1px 4px; border-radius: 3px; }
.hl-pink   { background: var(--highlight-pink); padding: 1px 4px; border-radius: 3px; }
.hl-blue   { background: var(--highlight-blue); padding: 1px 4px; border-radius: 3px; }
.hl-orange { background: var(--highlight-orange); padding: 1px 4px; border-radius: 3px; }
.hl-purple { background: var(--highlight-purple); padding: 1px 4px; border-radius: 3px; }
.hl-teal   { background: var(--highlight-teal); padding: 1px 4px; border-radius: 3px; }
.hl-amber  { background: var(--highlight-amber); padding: 1px 4px; border-radius: 3px; }
.fs-sm { font-size: 12px !important; line-height: 18px !important; }
.fs-md { font-size: 16px !important; line-height: 24px !important; }
.fs-lg { font-size: 20px !important; line-height: 28px !important; }
.fs-xl { font-size: 25px !important; line-height: 32px !important; }
.reveal-box { margin-top: 8px; border-radius: 5px; overflow: hidden; }
.reveal-box summary { cursor: pointer; user-select: none; font-family: 'Inter', sans-serif; font-size: 13.5px; font-weight: 700; color: #1e40af; background: #eff6ff; border: 1px dashed #93c5fd; padding: 6px 12px; border-radius: 5px; outline: none; list-style: none; display: flex; align-items: center; gap: 6px; }
.reveal-box summary::-webkit-details-marker { display: none; }
.reveal-box summary::before { content: "▶"; font-size: 11px; color: #2563eb; transition: transform 0.2s ease; }
.reveal-box[open] summary::before { transform: rotate(90deg); }
.reveal-box[open] summary { background: #dbeafe; border-bottom-left-radius: 0; border-bottom-right-radius: 0; }
.reveal-content { background: #f8fafc; border: 1px dashed #93c5fd; border-top: none; padding: 8px 12px; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px; }
.expand-block-wrapper { position: relative; margin: 12px 0; width: 100%; }
.expand-block-wrapper.blue .reveal-box summary { color: var(--ink-blue); background: #eff6ff; border-color: #93c5fd; }
.expand-block-wrapper.blue .reveal-box summary::before { color: var(--ink-blue); }
.expand-block-wrapper.blue .reveal-box[open] summary { background: #dbeafe; }
.expand-block-wrapper.blue .reveal-content { border-color: #93c5fd; }
.expand-block-wrapper.green .reveal-box summary { color: var(--ink-green); background: #f0fdf4; border-color: #86efac; }
.expand-block-wrapper.green .reveal-box summary::before { color: var(--ink-green); }
.expand-block-wrapper.green .reveal-box[open] summary { background: #dcfce7; }
.expand-block-wrapper.green .reveal-content { border-color: #86efac; }
.expand-block-wrapper.yellow .reveal-box summary { color: var(--ink-yellow); background: #fefce8; border-color: #fde047; }
.expand-block-wrapper.yellow .reveal-box summary::before { color: var(--ink-yellow); }
.expand-block-wrapper.yellow .reveal-box[open] summary { background: #fef08a; }
.expand-block-wrapper.yellow .reveal-content { border-color: #fde047; }
.expand-block-wrapper.purple .reveal-box summary { color: var(--ink-purple); background: #faf5ff; border-color: #d8b4fe; }
.expand-block-wrapper.purple .reveal-box summary::before { color: var(--ink-purple); }
.expand-block-wrapper.purple .reveal-box[open] summary { background: #f3e8ff; }
.expand-block-wrapper.purple .reveal-content { border-color: #d8b4fe; }
.expand-block-wrapper.red .reveal-box summary { color: var(--ink-red); background: #fef2f2; border-color: #fca5a5; }
.expand-block-wrapper.red .reveal-box summary::before { color: var(--ink-red); }
.expand-block-wrapper.red .reveal-box[open] summary { background: #fee2e2; }
.expand-block-wrapper.red .reveal-content { border-color: #fca5a5; }
.expand-block-wrapper.teal .reveal-box summary { color: var(--ink-teal); background: #f0fdfa; border-color: #5eead4; }
.expand-block-wrapper.teal .reveal-box summary::before { color: var(--ink-teal); }
.expand-block-wrapper.teal .reveal-box[open] summary { background: #ccfbf1; }
.expand-block-wrapper.teal .reveal-content { border-color: #5eead4; }
.expand-block-wrapper.amber .reveal-box summary { color: var(--ink-amber); background: #fffbeb; border-color: #fcd34d; }
.expand-block-wrapper.amber .reveal-box summary::before { color: var(--ink-amber); }
.expand-block-wrapper.amber .reveal-box[open] summary { background: #fef3c7; }
.expand-block-wrapper.amber .reveal-content { border-color: #fcd34d; }
.expand-block-wrapper.orange .reveal-box summary { color: var(--ink-orange); background: #fff7ed; border-color: #fdba74; }
.expand-block-wrapper.orange .reveal-box summary::before { color: var(--ink-orange); }
.expand-block-wrapper.orange .reveal-box[open] summary { background: #ffedd5; }
.expand-block-wrapper.orange .reveal-content { border-color: #fdba74; }
.expand-block-wrapper.rose .reveal-box summary { color: var(--ink-rose); background: #fff1f2; border-color: #fda4af; }
.expand-block-wrapper.rose .reveal-box summary::before { color: var(--ink-rose); }
.expand-block-wrapper.rose .reveal-box[open] summary { background: #ffe4e6; }
.expand-block-wrapper.rose .reveal-content { border-color: #fda4af; }
.mcq-card { background: #ffffff; border: 1px solid #cbd5e1; border-left: 5px solid #2563eb; border-radius: 6px; padding: 12px 14px; margin-bottom: 12px; box-shadow: 2px 2px 5px rgba(0,0,0,0.04); }
.mcq-badge { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; background-color: #dbeafe; color: #1e40af; padding: 2px 7px; border-radius: 4px; margin-bottom: 6px; font-family: 'Inter', sans-serif; }
.mcq-options { margin: 6px 0 8px 14px; font-size: 14.5px; line-height: 22px; }
.mains-section { background: #fffafa; border: 2px solid #7f1d1d; border-radius: 8px; padding: 20px 20px 14px 20px; margin: 24px 0 10px 0; position: relative; box-shadow: 0 5px 15px rgba(127, 29, 29, 0.08); }
.mains-section::before { content: "✍ UPSC & STATE PSC MAINS PRACTICE QUESTIONS"; font-family: 'Inter', sans-serif; font-size: 11.5px; font-weight: 900; letter-spacing: 0.5px; color: #ffffff; position: absolute; top: -12px; left: 20px; background: #991b1b; padding: 2px 12px; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
.hl-dark-red { background-color: #991b1b; color: #ffffff; padding: 1px 7px; border-radius: 4px; font-weight: bold; font-size: 14px; display: inline-block; font-family: 'Inter', sans-serif; }
.mains-q-item { position: relative; margin-bottom: 14px; border-bottom: 1px dashed rgba(153, 27, 27, 0.25); padding-bottom: 12px; }
.mains-q-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.mains-q-title { font-size: 17px; color: #7f1d1d; font-weight: 700; line-height: 24px; padding-right: 40px; }
.mains-framework { font-size: 15px; color: #334155; margin-top: 4px; padding-left: 10px; border-left: 2.5px solid #991b1b; line-height: 22px; }
.eq { position: relative; font-family: 'Inter', sans-serif; font-weight: 700; color: #0f3870; background: rgba(224, 242, 254, 0.75); padding: 1px 6px; border-radius: 4px; border: 1px solid rgba(186, 230, 253, 0.95); display: inline-flex; align-items: center; gap: 4px; line-height: 1.35; margin: 1px 2px; vertical-align: middle; }
.math-block { position: relative; display: flex; align-items: center; justify-content: center; gap: 10px; background: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid var(--ink-purple); border-radius: 6px; padding: 10px 14px; margin: 10px 0; font-family: 'Inter', sans-serif; font-weight: 700; color: var(--ink-dark); font-size: 15px; }
.fraction { display: inline-flex; flex-direction: column; vertical-align: middle; text-align: center; padding: 0 4px; }
.fraction-top { border-bottom: 2px solid var(--ink-dark); padding-bottom: 2px; }
.fraction-bottom { padding-top: 2px; }
.note-image-container { position: relative; margin: 16px auto; display: flex; flex-direction: column; align-items: center; justify-content: center; max-width: 100%; }
.note-image-wrapper { position: relative; overflow: hidden; display: inline-block; min-width: 140px; max-width: 100%; border: 1.5px dashed #94a3b8; border-radius: 6px; padding: 6px; background: #ffffff; box-shadow: var(--shadow); }
.note-image-wrapper img { width: 100%; height: 100%; object-fit: contain; border-radius: 4px; display: block; }
@media print {
  body { background: none !important; padding: 0 !important; }
  .notebook-container { box-shadow: none !important; width: 100% !important; max-width: 100% !important; padding: 10px 15px 15px 45px !important; }
}
  `;

  const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${resolvedTitle}</title>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Kalam:wght@300;400;700&family=Patrick+Hand&family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet">
<style>
${fullCSS}
</style>
</head>
<body>
  ${canvasClone.outerHTML}
</body>
</html>`;

  const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = downloadFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}