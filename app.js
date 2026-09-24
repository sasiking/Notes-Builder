let importedFileName = null;
let manualTitleOverride = null;
let savedSelectionRange = null;
let activeFormulaTab = 'basic';
let activeMidInsertTarget = null;
let draggedElement = null;

function syncManualTitle(val) {
  manualTitleOverride = val.trim() || null;
}

function resolveDocumentTitle() {
  if (manualTitleOverride) return manualTitleOverride;
  const canvas = document.getElementById('editorCanvas');
  const mainH1 = canvas ? canvas.querySelector('.title-section h1') : null;
  if (mainH1 && mainH1.innerText.trim() && mainH1.innerText.trim() !== 'Main Title Here') {
    return mainH1.innerText.trim();
  }
  const firstSectionHeader = canvas ? canvas.querySelector('.section-header span') : null;
  if (firstSectionHeader && firstSectionHeader.innerText.trim() && firstSectionHeader.innerText.trim() !== 'Section Header') {
    return firstSectionHeader.innerText.trim();
  }
  if (importedFileName) {
    return importedFileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
  }
  return 'Study Notes';
}

function updateTitleUI() {
  const titleInput = document.getElementById('docTitleInput');
  if (!manualTitleOverride && titleInput) {
    titleInput.value = resolveDocumentTitle();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('editorCanvas');
  if (canvas) {
    canvas.addEventListener('input', () => {
      if (!manualTitleOverride) updateTitleUI();
    });
    
    canvas.addEventListener('keydown', handleCardEnterKey);
    initCanvasDropEvents(canvas);
  }
});

/* ================= ENTER KEY INTERCEPTION ================= */
function handleCardEnterKey(e) {
  if (e.key !== 'Enter') return;

  const sel = window.getSelection();
  if (!sel.rangeCount) return;

  const node = sel.anchorNode;
  const card = node.nodeType === Node.ELEMENT_NODE ? node.closest('.card-note') : node.parentElement?.closest('.card-note');

  if (!card) return;

  if (!e.shiftKey) {
    e.preventDefault();

    const range = sel.getRangeAt(0);
    range.deleteContents();

    const br = document.createElement('br');
    range.insertNode(br);

    range.setStartAfter(br);
    range.setEndAfter(br);
    sel.removeAllRanges();
    sel.addRange(range);

    br.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/* ================= COLOR & THEME MAP ================= */
const colorMap = {
  blue:   'var(--ink-blue)',
  yellow: 'var(--ink-yellow)',
  teal:   'var(--ink-teal)',
  green:  'var(--ink-green)',
  purple: 'var(--ink-purple)',
  red:    'var(--ink-red)',
  rose:   'var(--ink-rose)',
  amber:  'var(--ink-amber)',
  orange: 'var(--ink-orange)'
};

function changeCardColor(swatchEl, colorName) {
  const card = swatchEl.closest('.card-note');
  if (!card) return;

  Object.keys(colorMap).forEach(c => card.classList.remove(c));
  card.classList.add(colorName);

  const heading = card.querySelector('h1, h2, h3, h4');
  if (heading && colorMap[colorName]) {
    heading.style.setProperty('color', colorMap[colorName], 'important');
  }
}

/* ================= TOOLBAR & HTML BUILDERS ================= */
function getStickyDeleteButtonHTML() {
  return `<button class="sticky-del-btn" contenteditable="false" onclick="this.closest('.sticky').remove()">✕</button>`;
}

function getFormulaDeleteButtonHTML() {
  return `<button class="eq-del-btn" contenteditable="false" onclick="this.closest('.eq, .math-block').remove()" title="Delete">✕</button>`;
}

function getCardToolbarHTML() {
  return `
    <div class="card-toolbar" contenteditable="false">
      <div class="color-swatches">
        <span style="font-size:10px; font-weight:700; color:#64748b; margin-right:3px;">INK:</span>
        <div class="swatch" style="background:#0f3870;" onclick="changeCardColor(this, 'blue')"></div>
        <div class="swatch" style="background:#15803d;" onclick="changeCardColor(this, 'green')"></div>
        <div class="swatch" style="background:#a16207;" onclick="changeCardColor(this, 'yellow')"></div>
        <div class="swatch" style="background:#6b21a8;" onclick="changeCardColor(this, 'purple')"></div>
        <div class="swatch" style="background:#b91c1c;" onclick="changeCardColor(this, 'red')"></div>
        <div class="swatch" style="background:#0f766e;" onclick="changeCardColor(this, 'teal')"></div>
        <div class="swatch" style="background:#b45309;" onclick="changeCardColor(this, 'amber')"></div>
        <div class="swatch" style="background:#c2410c;" onclick="changeCardColor(this, 'orange')"></div>
      </div>
      <div class="card-actions">
        <button class="card-tool-btn" onclick="addBulletToCard(this)">+ Bullet</button>
        <button class="card-tool-btn" onclick="addDotPointToCard(this)">• Dot</button>
        <button class="card-tool-btn" onclick="addSubpointToCard(this)">+ Sub-point</button>
        <button class="card-tool-btn" onclick="addFormulaToCard(this)" style="background:#e0f2fe; color:#0369a1;">+ Formula</button>
        <button class="card-tool-btn" onclick="removeFormulaFromCard(this)" style="background:#fee2e2; color:#991b1b;">- Formula</button>
      </div>
    </div>
  `;
}

function getTableToolbarHTML() {
  return `
    <div class="table-toolbar" contenteditable="false">
      <button class="card-tool-btn" onclick="addTableRow(this)">+ Row</button>
      <button class="card-tool-btn" onclick="deleteTableRow(this)" style="color:#b91c1c;">- Row</button>
      <button class="card-tool-btn" onclick="addTableColumn(this)">+ Col</button>
      <button class="card-tool-btn" onclick="deleteTableColumn(this)" style="color:#b91c1c;">- Col</button>
    </div>
  `;
}

function getBlankTableHTML() {
  return `
    <div class="table-block-wrapper">
      ${getTableToolbarHTML()}
      <table class="hand-table" contenteditable="true" style="margin: 10px 0 12px 0; font-size: 14px;">
        <thead><tr><th style="width: 25%;">Parameter</th><th style="width: 37.5%;">Category A</th><th style="width: 37.5%;">Category B</th></tr></thead>
        <tbody><tr><td><strong>Dimension 1</strong></td><td>Details...</td><td>Details...</td></tr></tbody>
      </table>
    </div>
  `;
}

function getMainsBoxToolbarHTML() {
  return `
    <div class="mains-box-toolbar" contenteditable="false">
      <button class="card-tool-btn" onclick="addSymbolToMains(this, '•')">• Bullet</button>
      <button class="card-tool-btn" onclick="addSubpointToMains(this)">▫ Sub-point</button>
      <button class="card-tool-btn" onclick="addSymbolToMains(this, '★')">★ Star</button>
      <button class="card-tool-btn" onclick="addSymbolToMains(this, '▫')">▫ Square</button>
      <button class="card-tool-btn" onclick="addSymbolToMains(this, '❖')">❖ Diamond</button>
      <button class="card-tool-btn" onclick="handleMainsTab(this, 'in')">⇥ Tab</button>
      <button class="card-tool-btn" onclick="handleMainsTab(this, 'out')">⇤ Untab</button>
      <button class="card-tool-btn" onclick="insertTableInMains(this)" style="background:#e0f2fe; color:#0369a1; border-color:#93c5fd;">📊 Table</button>
      <button class="card-tool-btn" onclick="insertMainsQuestionDirect(this)" style="background:#fee2e2; border-color:#f87171; color:#991b1b;">
        + Add Another Question
      </button>
    </div>
  `;
}

function getSingleMainsQuestionItemHTML(qNum) {
  return `
    <div class="mains-q-item">
      <div class="mains-item-controls" contenteditable="false">
        <button class="control-btn btn-del" style="background:#991b1b;" onclick="this.closest('.mains-q-item').remove()">✕</button>
      </div>
      <div class="mains-q-title" contenteditable="true">
        <span class="hl-dark-red">Mains Practice • 10 Marks</span> 
        <strong>Q${qNum}. "Write descriptive analytical question statement here."</strong>
      </div>
      <details class="reveal-box" style="margin-top:8px;">
        <summary>View Model Answer Structuring Framework</summary>
        <div class="reveal-content">
          <div class="mains-framework" contenteditable="true" style="background-color: #ffffff; padding: 8px 10px; margin-top: 2px;">
            <strong>Answer Framework:</strong><br>
            • <em>Introduction:</em> Contextualize premises.<br>
            <div class="sub-point" contenteditable="true">▫ <strong>Note:</strong> Sub-point elaboration...</div>
            • <em>Core Analysis:</em> Arguments and empirical evidence.<br>
            • <em>Conclusion:</em> Long-term impact and way forward.
          </div>
        </div>
      </details>
      ${getMainsBoxToolbarHTML()}
    </div>
  `;
}

function getImageToolbarHTML() {
  return `
    <div class="note-image-toolbar" contenteditable="false">
      <span style="font-size:10px; font-weight:700; color:#64748b; margin-right:2px;">SCALE:</span>
      <button class="image-scale-btn" onclick="resizeNoteImage(this, '25%')">25%</button>
      <button class="image-scale-btn" onclick="resizeNoteImage(this, '50%')">50%</button>
      <button class="image-scale-btn" onclick="resizeNoteImage(this, '75%')">75%</button>
      <button class="image-scale-btn" onclick="resizeNoteImage(this, '100%')">100%</button>
      <span style="font-size:10px; font-weight:700; color:#64748b; margin: 0 2px 0 6px;">ALIGN:</span>
      <button class="image-scale-btn" onclick="alignNoteImage(this, 'flex-start')">Left</button>
      <button class="image-scale-btn" onclick="alignNoteImage(this, 'center')">Center</button>
      <button class="image-scale-btn" onclick="alignNoteImage(this, 'flex-end')">Right</button>
    </div>
  `;
}

function getImageContainerHTML(base64Data) {
  return `
    <div class="note-image-container">
      ${getImageToolbarHTML()}
      <div class="note-image-wrapper" style="width: 70%; height: auto;">
        <button class="note-image-del" contenteditable="false" onclick="this.closest('.block-wrapper').remove()" title="Delete Image">✕</button>
        <img src="${base64Data}" alt="Study Map / Diagram">
      </div>
    </div>
  `;
}

/* ================= TEMPLATE RESOLUTION ================= */
function getTemplateHTML(type) {
  const map = {
    banner: `
      <div class="title-section" contenteditable="true">
        <div class="badge-tag">EXAM TAG / PAPER SPECIFICATION</div>
        <h1>Main Title Here</h1>
        <div class="subtitle">Subtitle • Scope of Topic • Core Framework</div>
      </div>`,
    header: `
      <div class="section-header" contenteditable="true">
        <span>Section Header</span>
      </div>`,
    'grid-2': `
      <div class="grid-2">
        <div class="grid-col">
          <div class="card-note blue">
            ${getCardToolbarHTML()}
            <h3 contenteditable="true" style="color:var(--ink-blue); font-size:20px;">Column 1 Title</h3>
            <ul class="bullet-list" contenteditable="true">
              <li><strong>Point 1:</strong> Description...</li>
              <div class="sub-point">▫ <strong>Detail:</strong> Elaboration...</div>
            </ul>
          </div>
        </div>
        <div class="grid-col">
          <div class="card-note green">
            ${getCardToolbarHTML()}
            <h3 contenteditable="true" style="color:var(--ink-green); font-size:20px;">Column 2 Title</h3>
            <ul class="bullet-list" contenteditable="true">
              <li><strong>Point 1:</strong> Description...</li>
              <div class="sub-point">▫ <strong>Detail:</strong> Elaboration...</div>
            </ul>
          </div>
        </div>
      </div>`,
    'card-blue': `<div class="card-note blue">${getCardToolbarHTML()}<h3 contenteditable="true" style="color:var(--ink-blue); font-size:20px;">Card Title</h3><ul class="bullet-list" contenteditable="true"><li><strong>Point:</strong> Description...</li><div class="sub-point">▫ <strong>Note:</strong> Details...</div></ul></div>`,
    'card-green': `<div class="card-note green">${getCardToolbarHTML()}<h3 contenteditable="true" style="color:var(--ink-green); font-size:20px;">Card Title</h3><ul class="bullet-list" contenteditable="true"><li><strong>Point:</strong> Description...</li><div class="sub-point">▫ <strong>Note:</strong> Details...</div></ul></div>`,
    'card-yellow': `<div class="card-note yellow">${getCardToolbarHTML()}<h3 contenteditable="true" style="color:var(--ink-yellow); font-size:20px;">Card Title</h3><ul class="bullet-list" contenteditable="true"><li><strong>Point:</strong> Description...</li><div class="sub-point">▫ <strong>Note:</strong> Details...</div></ul></div>`,
    'card-purple': `<div class="card-note purple">${getCardToolbarHTML()}<h3 contenteditable="true" style="color:var(--ink-purple); font-size:20px;">Card Title</h3><ul class="bullet-list" contenteditable="true"><li><strong>Point:</strong> Description...</li><div class="sub-point">▫ <strong>Note:</strong> Details...</div></ul></div>`,
    'sticky-yellow': `<div class="sticky yellow">${getStickyDeleteButtonHTML()}<div contenteditable="true">📌 <strong>Exam Catch / Summary Note:</strong><br>Write shortcut or caveats here.</div></div>`,
    'sticky-pink': `<div class="sticky pink">${getStickyDeleteButtonHTML()}<div contenteditable="true">📌 <strong>Recent Update / Fact:</strong><br>Add recent details here.</div></div>`,
    'exam-trap': `<div class="exam-trick"><ul class="bullet-list" contenteditable="true" style="margin-top:2px;"><li><strong>TRAP: "Common incorrect statement."</strong> ➔ <strong>WRONG!</strong><div class="sub-point">▫ <strong>Reason:</strong> Actual correct fact...</div></li></ul></div>`,
    'mcq-dropdown': `
      <div class="mcq-card">
        <span class="mcq-badge" contenteditable="true">EXAM BADGE</span>
        <div contenteditable="true" style="font-weight: 600; font-size: 15px; margin-bottom: 4px;">Q. Question prompt?</div>
        <div class="mcq-options" contenteditable="true">1) Option 1<br>2) Option 2<br>3) Option 3<br>4) Option 4</div>
        <details class="reveal-box">
          <summary>Show Answer & Catch</summary>
          <div class="reveal-content"><div contenteditable="true" style="background-color: #ffffff; padding: 8px 10px; margin-top: 2px;">➔ <strong>Correct Answer:</strong> <span class="hl-pink">Option 1</span><br>▫ <strong>Explanation:</strong> Explanation here...</div></div>
        </details>
      </div>`,
    'table-blank': getBlankTableHTML(),
    'math-block': `
      <div class="math-block" contenteditable="true">
        <span>Formula =</span>
        <div class="fraction">
          <span class="fraction-top">Numerator Variable</span>
          <span class="fraction-bottom">Denominator Variable</span>
        </div>
        <span>× 100</span>
        ${getFormulaDeleteButtonHTML()}
      </div>`
  };
  return map[type] || '';
}

function getControlsHTML() {
  return `
    <div class="block-controls" contenteditable="false">
      <span class="control-btn drag-handle" title="Drag to reorder section">⠿ Drag</span>
      <button class="control-btn btn-insert-mid" onclick="toggleMidInsertMenu(this)" title="Insert section after">+ Insert Here</button>
      <button class="control-btn" onclick="moveUp(this)" title="Move Up">▲</button>
      <button class="control-btn" onclick="moveDown(this)" title="Move Down">▼</button>
      <button class="control-btn btn-del" onclick="deleteBlock(this)" title="Delete Block">✕</button>

      <div class="mid-insert-menu">
        <button class="mid-insert-btn" onclick="executeMidInsert(this, 'header')">📌 Section Header</button>
        <button class="mid-insert-btn" onclick="executeMidInsert(this, 'grid-2')">🔲 2-Column Side-by-Side</button>
        <button class="mid-insert-btn" onclick="executeMidInsert(this, 'card-blue')">📘 Card (Blue)</button>
        <button class="mid-insert-btn" onclick="executeMidInsert(this, 'card-green')">📗 Card (Green)</button>
        <button class="mid-insert-btn" onclick="executeMidInsertImage(this)">🖼️ Image Block</button>
        <button class="mid-insert-btn" onclick="openFormulaModalForCursor()">∑ Math / Formula Block</button>
        <button class="mid-insert-btn" onclick="executeMidInsert(this, 'table-blank')">📊 Comparison Table</button>
        <button class="mid-insert-btn" onclick="executeMidInsert(this, 'sticky-yellow')">📌 Sticky Note</button>
        <button class="mid-insert-btn" onclick="executeMidInsert(this, 'exam-trap')">⚡ Exam Trap Box</button>
        <button class="mid-insert-btn" onclick="executeMidInsert(this, 'mcq-dropdown')">❓ Prelims MCQ Card</button>
      </div>
    </div>
  `;
}

function wrapInBlock(htmlContent) {
  const wrapper = document.createElement('div');
  wrapper.className = 'block-wrapper';
  wrapper.innerHTML = `${getControlsHTML()}${htmlContent}`;
  attachDragHandlers(wrapper);
  return wrapper;
}

/* ================= ROBUST TABLE ROW & COLUMN ENGINE ================= */
function getActiveTableFromBtn(btn) {
  if (!btn) return null;
  const parentWrapper = btn.closest('.table-block-wrapper') || btn.closest('.block-wrapper') || btn.parentElement;
  if (parentWrapper) {
    const tbl = parentWrapper.querySelector('table');
    if (tbl) return tbl;
  }
  return btn.parentElement?.nextElementSibling?.tagName === 'TABLE' 
    ? btn.parentElement.nextElementSibling 
    : document.querySelector('#editorCanvas table');
}

function addTableRow(btn) {
  const table = getActiveTableFromBtn(btn);
  if (!table) return;

  const headerRow = table.rows[0];
  const colCount = headerRow ? headerRow.cells.length : 3;
  const sel = window.getSelection();
  let targetRow = null;

  if (sel.rangeCount > 0 && table.contains(sel.anchorNode)) {
    targetRow = sel.anchorNode.nodeType === 1 ? sel.anchorNode.closest('tr') : sel.anchorNode.parentElement?.closest('tr');
  }

  const tbody = table.querySelector('tbody') || table;
  const newRow = document.createElement('tr');
  for (let i = 0; i < colCount; i++) {
    const td = document.createElement('td');
    td.innerHTML = i === 0 ? '<strong>Dimension</strong>' : 'Details...';
    td.setAttribute('contenteditable', 'true');
    newRow.appendChild(td);
  }

  if (targetRow && targetRow !== headerRow && targetRow.parentElement) {
    targetRow.insertAdjacentElement('afterend', newRow);
  } else {
    tbody.appendChild(newRow);
  }

  makeEditable(newRow);
  const firstCell = newRow.cells[0];
  if (firstCell) {
    const range = document.createRange();
    range.selectNodeContents(firstCell);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    newRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function deleteTableRow(btn) {
  const table = getActiveTableFromBtn(btn);
  if (!table) return;

  const tbody = table.querySelector('tbody') || table;
  const dataRows = Array.from(table.rows).filter(r => !r.querySelector('th') && r !== table.rows[0]);
  
  if (dataRows.length <= 1) {
    alert('At least one data row must be maintained in the table.');
    return;
  }

  const sel = window.getSelection();
  let targetRow = null;

  if (sel.rangeCount > 0 && table.contains(sel.anchorNode)) {
    targetRow = sel.anchorNode.nodeType === 1 ? sel.anchorNode.closest('tr') : sel.anchorNode.parentElement?.closest('tr');
  }

  if (targetRow && !targetRow.querySelector('th') && targetRow !== table.rows[0]) {
    targetRow.remove();
  } else {
    dataRows[dataRows.length - 1].remove();
  }
}

function addTableColumn(btn) {
  const table = getActiveTableFromBtn(btn);
  if (!table) return;

  const headerRow = table.querySelector('thead tr') || table.rows[0];
  let targetColIdx = -1;

  const sel = window.getSelection();
  if (sel.rangeCount > 0 && table.contains(sel.anchorNode)) {
    const activeCell = sel.anchorNode.nodeType === 1 
      ? sel.anchorNode.closest('td, th') 
      : sel.anchorNode.parentElement?.closest('td, th');
    if (activeCell) {
      targetColIdx = activeCell.cellIndex;
    }
  }

  Array.from(table.rows).forEach((row, rIdx) => {
    const isHeader = (rIdx === 0 && row.parentElement?.tagName !== 'TBODY') || row.querySelector('th');
    const cell = document.createElement(isHeader ? 'th' : 'td');
    cell.innerHTML = isHeader ? `Category ${row.cells.length + 1}` : 'Details...';
    cell.setAttribute('contenteditable', 'true');

    if (targetColIdx >= 0 && targetColIdx < row.cells.length) {
      row.cells[targetColIdx].insertAdjacentElement('afterend', cell);
    } else {
      row.appendChild(cell);
    }
  });

  makeEditable(table);
}

function deleteTableColumn(btn) {
  const table = getActiveTableFromBtn(btn);
  if (!table) return;

  const firstRow = table.rows[0];
  if (!firstRow || firstRow.cells.length <= 2) {
    alert('A comparison table requires at least 2 columns.');
    return;
  }

  let targetColIdx = -1;
  const sel = window.getSelection();

  if (sel.rangeCount > 0 && table.contains(sel.anchorNode)) {
    const activeCell = sel.anchorNode.nodeType === 1 
      ? sel.anchorNode.closest('td, th') 
      : sel.anchorNode.parentElement?.closest('td, th');

    if (activeCell) {
      targetColIdx = activeCell.cellIndex;
    }
  }

  if (targetColIdx < 0) {
    targetColIdx = firstRow.cells.length - 1;
  }

  Array.from(table.rows).forEach(row => {
    if (row.cells.length > targetColIdx) {
      row.deleteCell(targetColIdx);
    } else if (row.cells.length > 0) {
      row.deleteCell(row.cells.length - 1);
    }
  });
}

/* ================= DRAG AND DROP REORDERING ENGINE ================= */
function attachDragHandlers(wrapper) {
  wrapper.setAttribute('draggable', 'false');

  const dragHandle = wrapper.querySelector('.drag-handle');
  if (dragHandle) {
    dragHandle.addEventListener('mousedown', () => {
      wrapper.setAttribute('draggable', 'true');
    });
    dragHandle.addEventListener('mouseup', () => {
      wrapper.setAttribute('draggable', 'false');
    });
  }

  wrapper.addEventListener('dragstart', (e) => {
    draggedElement = wrapper;
    wrapper.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  });

  wrapper.addEventListener('dragend', () => {
    wrapper.classList.remove('dragging');
    wrapper.setAttribute('draggable', 'false');
    document.querySelectorAll('.block-wrapper, .grid-col').forEach(el => el.classList.remove('drag-over'));
    draggedElement = null;
    updateTitleUI();
  });

  wrapper.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!draggedElement || draggedElement === wrapper) return;
    wrapper.classList.add('drag-over');
  });

  wrapper.addEventListener('dragleave', () => {
    wrapper.classList.remove('drag-over');
  });

  wrapper.addEventListener('drop', (e) => {
    e.preventDefault();
    wrapper.classList.remove('drag-over');
    if (!draggedElement || draggedElement === wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const isAfter = (e.clientY - rect.top) > (rect.height / 2);

    if (isAfter) {
      wrapper.parentNode.insertBefore(draggedElement, wrapper.nextSibling);
    } else {
      wrapper.parentNode.insertBefore(draggedElement, wrapper);
    }
  });
}

function initCanvasDropEvents(canvas) {
  canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
  });
  canvas.addEventListener('drop', (e) => {
    if (!draggedElement) return;
    if (e.target === canvas) {
      canvas.appendChild(draggedElement);
    }
  });
}

function insertBlock(type) {
  const canvas = document.getElementById('editorCanvas');
  if (!canvas) return;
  const html = getTemplateHTML(type);
  if (!html) return;

  const block = wrapInBlock(html);
  canvas.appendChild(block);
  block.scrollIntoView({ behavior: 'smooth', block: 'end' });
  makeEditable(block);
  updateTitleUI();
}

/* ================= CONTEXT-AWARE MID INSERTION ================= */
function executeMidInsert(menuBtn, templateType) {
  const currentBlock = menuBtn.closest('.block-wrapper');
  if (!currentBlock) return;
  const html = getTemplateHTML(templateType);
  if (!html) return;

  const menu = menuBtn.closest('.mid-insert-menu');
  if (menu) menu.classList.remove('active');

  if (templateType.startsWith('sticky')) {
    const parentCol = currentBlock.closest('.grid-col');
    if (parentCol) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html.trim();
      const stickyEl = tempDiv.firstElementChild;
      currentBlock.insertAdjacentElement('afterend', stickyEl);
      stickyEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      makeEditable(stickyEl);
      return;
    }

    const gridEl = currentBlock.querySelector('.grid-2');
    if (gridEl) {
      const cols = gridEl.querySelectorAll('.grid-col');
      const targetCol = cols.length > 1 ? cols[1] : cols[0];
      if (targetCol) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html.trim();
        const stickyEl = tempDiv.firstElementChild;
        targetCol.appendChild(stickyEl);
        stickyEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        makeEditable(stickyEl);
        return;
      }
    }
  }

  const newBlock = wrapInBlock(html);
  currentBlock.parentNode.insertBefore(newBlock, currentBlock.nextSibling);
  newBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
  makeEditable(newBlock);
  updateTitleUI();
}

function executeMidInsertImage(menuBtn) {
  activeMidInsertTarget = menuBtn.closest('.block-wrapper');
  const menu = menuBtn.closest('.mid-insert-menu');
  if (menu) menu.classList.remove('active');

  let fileInput = document.getElementById('midInsertFileInput');
  if (!fileInput) {
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'midInsertFileInput';
    fileInput.accept = 'image/*,.svg';
    fileInput.style.display = 'none';
    fileInput.onchange = handleMidInsertFileSelect;
    document.body.appendChild(fileInput);
  }
  fileInput.value = '';
  fileInput.click();
}

function handleMidInsertFileSelect(event) {
  const file = event.target.files[0];
  if (!file || !activeMidInsertTarget) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const newBlock = wrapInBlock(getImageContainerHTML(e.target.result));
    activeMidInsertTarget.parentNode.insertBefore(newBlock, activeMidInsertTarget.nextSibling);
    newBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
    activeMidInsertTarget = null;
  };
  reader.readAsDataURL(file);
}

function toggleMidInsertMenu(btn) {
  const menu = btn.parentElement.querySelector('.mid-insert-menu');
  document.querySelectorAll('.mid-insert-menu').forEach(m => {
    if (m !== menu) m.classList.remove('active');
  });
  if (menu) menu.classList.toggle('active');
}

/* ================= MAINS ENGINE ================= */
function insertMainsQuestion() {
  const canvas = document.getElementById('editorCanvas');
  if (!canvas) return;
  let mainsSection = canvas.querySelector('.mains-section');
  if (!mainsSection) {
    const initialHTML = `
      <div class="mains-section">
        ${getSingleMainsQuestionItemHTML(1)}
      </div>
    `;
    const block = wrapInBlock(initialHTML);
    canvas.appendChild(block);
    block.scrollIntoView({ behavior: 'smooth', block: 'end' });
    makeEditable(block);
  } else {
    const currentCount = mainsSection.querySelectorAll('.mains-q-item').length;
    const qNum = currentCount + 1;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = getSingleMainsQuestionItemHTML(qNum).trim();
    const newItem = tempDiv.firstElementChild;
    mainsSection.appendChild(newItem);
    newItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    makeEditable(newItem);
  }
}

function insertMainsQuestionDirect(btn) {
  const mainsSection = btn.closest('.mains-section');
  if (!mainsSection) return;
  const currentCount = mainsSection.querySelectorAll('.mains-q-item').length;
  const qNum = currentCount + 1;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = getSingleMainsQuestionItemHTML(qNum).trim();
  const newItem = tempDiv.firstElementChild;
  mainsSection.appendChild(newItem);
  newItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
  makeEditable(newItem);
}

function insertTableInMains(btn) {
  const mainsItem = btn.closest('.mains-q-item');
  if (!mainsItem) return;

  const framework = mainsItem.querySelector('.mains-framework');
  if (!framework) return;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = getBlankTableHTML().trim();
  const tableWrapper = tempDiv.firstElementChild;

  const sel = window.getSelection();
  let inserted = false;

  if (sel.rangeCount > 0 && framework.contains(sel.anchorNode)) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(tableWrapper);
    inserted = true;
  }

  if (!inserted) {
    framework.appendChild(tableWrapper);
  }

  makeEditable(tableWrapper);
  tableWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ================= DIRECT IMAGE INSERTION ================= */
function handleDirectCanvasImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    insertImageDirectlyToCanvas(e.target.result);
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function insertImageDirectlyToCanvas(base64Data) {
  const canvas = document.getElementById('editorCanvas');
  const block = wrapInBlock(getImageContainerHTML(base64Data));
  canvas.appendChild(block);
  block.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resizeNoteImage(btn, widthPercent) {
  const container = btn.closest('.note-image-container');
  if (!container) return;
  const wrapper = container.querySelector('.note-image-wrapper');
  if (wrapper) {
    wrapper.style.width = widthPercent;
    wrapper.style.height = 'auto';
  }
}

function alignNoteImage(btn, alignPos) {
  const container = btn.closest('.note-image-container');
  if (!container) return;
  container.style.alignItems = alignPos;
}

/* ================= FORMULA MODAL ================= */
function openFormulaModalForCursor() {
  const sel = window.getSelection();
  if (sel.rangeCount > 0) {
    savedSelectionRange = sel.getRangeAt(0).cloneRange();
  } else {
    savedSelectionRange = null;
  }
  document.getElementById('formulaModal').style.display = 'flex';
  setTimeout(() => document.getElementById('basicFormulaInput').focus(), 50);
}

function closeFormulaModal() {
  document.getElementById('formulaModal').style.display = 'none';
  savedSelectionRange = null;
}

function switchFormulaTab(tabName) {
  activeFormulaTab = tabName;
  document.getElementById('tabBasic').classList.toggle('active', tabName === 'basic');
  document.getElementById('tabFraction').classList.toggle('active', tabName === 'fraction');
  document.getElementById('paneBasic').style.display = (tabName === 'basic') ? 'block' : 'none';
  document.getElementById('paneFraction').style.display = (tabName === 'fraction') ? 'block' : 'none';
}

function commitFormulaInsertion() {
  let formulaHTML = '';
  if (activeFormulaTab === 'basic') {
    const text = document.getElementById('basicFormulaInput').value.trim() || 'Formula';
    formulaHTML = `<span class="eq"><span contenteditable="true">${text}</span>${getFormulaDeleteButtonHTML()}</span>`;
  } else {
    const title = document.getElementById('fractionTitleInput').value.trim();
    const num = document.getElementById('fractionNumInput').value.trim() || 'Numerator';
    const den = document.getElementById('fractionDenInput').value.trim() || 'Denominator';
    const suffix = document.getElementById('fractionSuffixInput').value.trim();

    formulaHTML = `
      <div class="math-block" contenteditable="true">
        ${title ? `<span>${title}</span>` : ''}
        <div class="fraction">
          <span class="fraction-top">${num}</span>
          <span class="fraction-bottom">${den}</span>
        </div>
        ${suffix ? `<span>${suffix}</span>` : ''}
        ${getFormulaDeleteButtonHTML()}
      </div>
    `;
  }

  const canvas = document.getElementById('editorCanvas');
  if (savedSelectionRange && canvas.contains(savedSelectionRange.commonAncestorContainer)) {
    savedSelectionRange.deleteContents();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formulaHTML.trim();
    const fragment = document.createDocumentFragment();
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }
    savedSelectionRange.insertNode(fragment);
  } else {
    const fallbackTarget = canvas.querySelector('.card-note, .grid-col') || canvas;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formulaHTML.trim();
    fallbackTarget.appendChild(tempDiv.firstElementChild);
  }
  closeFormulaModal();
}

function addFormulaToCard(btn) {
  const card = btn.closest('.card-note');
  const selection = window.getSelection();
  if (selection.rangeCount && card && card.contains(selection.anchorNode)) {
    savedSelectionRange = selection.getRangeAt(0).cloneRange();
  } else if (card) {
    const range = document.createRange();
    range.selectNodeContents(card);
    range.collapse(false);
    savedSelectionRange = range;
  }
  openFormulaModalForCursor();
}

function removeFormulaFromCard(btn) {
  const card = btn.closest('.card-note, .grid-col');
  if (!card) return;
  const allEqs = card.querySelectorAll('.eq, .math-block');
  if (allEqs.length > 0) {
    allEqs[allEqs.length - 1].remove();
  }
}

/* ================= EDITING TOOLS ================= */
function addSymbolToMains(btn, symbol) {
  const framework = btn.closest('.mains-q-item').querySelector('.mains-framework');
  if (!framework) return;
  framework.focus();
  const sel = window.getSelection();
  const symbolNode = document.createTextNode('\n' + symbol + ' ');
  if (sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(symbolNode);
    range.collapse(false);
  } else {
    framework.appendChild(symbolNode);
  }
}

function addSubpointToMains(btn) {
  const framework = btn.closest('.mains-q-item').querySelector('.mains-framework');
  if (!framework) return;
  framework.focus();
  
  const subDiv = document.createElement('div');
  subDiv.className = 'sub-point';
  subDiv.contentEditable = 'true';
  subDiv.innerHTML = '▫ <strong>Note:</strong> Mains sub-point detail...';
  
  const sel = window.getSelection();
  if (sel.rangeCount > 0 && framework.contains(sel.anchorNode)) {
    const range = sel.getRangeAt(0);
    range.insertNode(subDiv);
  } else {
    framework.appendChild(subDiv);
  }
}

function handleMainsTab(btn, direction) {
  const framework = btn.closest('.mains-q-item').querySelector('.mains-framework');
  if (!framework) return;
  framework.focus();
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  
  if (direction === 'in') {
    const tabNode = document.createTextNode('    ');
    range.insertNode(tabNode);
    range.collapse(false);
  } else {
    const textNode = range.startContainer;
    if (textNode.nodeType === 3 && textNode.nodeValue.startsWith('    ')) {
      textNode.nodeValue = textNode.nodeValue.substring(4);
    }
  }
}

function addBulletToCard(btn) {
  const card = btn.closest('.card-note, .grid-col');
  if (!card) return;

  const li = document.createElement('li');
  li.innerHTML = '<strong>Point:</strong> Description...';
  li.setAttribute('contenteditable', 'true');

  const sel = window.getSelection();
  let inserted = false;

  if (sel.rangeCount > 0 && card.contains(sel.anchorNode)) {
    let target = sel.anchorNode;
    while (target && target.parentNode !== card && !target.classList?.contains('bullet-list')) {
      if (target.tagName === 'LI' || target.classList?.contains('sub-point') || target.classList?.contains('dot-point')) break;
      target = target.parentNode;
    }
    if (target && (target.tagName === 'LI' || target.classList?.contains('sub-point') || target.classList?.contains('dot-point'))) {
      target.insertAdjacentElement('afterend', li);
      inserted = true;
    }
  }

  if (!inserted) {
    let list = card.querySelector('.bullet-list');
    if (!list) {
      list = document.createElement('ul');
      list.className = 'bullet-list';
      list.contentEditable = 'true';
      card.appendChild(list);
    }
    list.appendChild(li);
  }

  const range = document.createRange();
  range.selectNodeContents(li);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}

/* ================= EXACT INLINE DOT INSERTION AT CURSOR ================= */
function addDotPointToCard(btn) {
  const card = btn.closest('.card-note, .grid-col');
  if (!card) return;

  const sel = window.getSelection();

  if (sel.rangeCount > 0 && card.contains(sel.anchorNode)) {
    const range = sel.getRangeAt(0);
    range.deleteContents();

    const dotNode = document.createTextNode('• ');
    range.insertNode(dotNode);

    range.setStartAfter(dotNode);
    range.setEndAfter(dotNode);
    sel.removeAllRanges();
    sel.addRange(range);
  } else {
    card.focus();
    const dotNode = document.createTextNode('• ');
    card.appendChild(dotNode);

    const range = document.createRange();
    range.setStartAfter(dotNode);
    range.setEndAfter(dotNode);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

/* ================= NESTED SUB-POINT FUNCTIONALITY ================= */
function addSubpointToCard(btn) {
  const card = btn.closest('.card-note, .grid-col');
  if (!card) return;

  const sub = document.createElement('div');
  sub.className = 'sub-point';
  sub.innerHTML = '▫ <strong>Note:</strong> Details...';
  sub.setAttribute('contenteditable', 'true');

  const sel = window.getSelection();
  let inserted = false;

  if (sel.rangeCount > 0 && card.contains(sel.anchorNode)) {
    const range = sel.getRangeAt(0);
    let node = sel.anchorNode;
    let closestSub = null;
    let closestLi = null;

    while (node && node !== card) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.classList?.contains('sub-point') && !closestSub) closestSub = node;
        if (node.tagName === 'LI' && !closestLi) closestLi = node;
      }
      node = node.parentNode;
    }

    if (closestSub || closestLi) {
      range.deleteContents();
      range.insertNode(sub);
      inserted = true;
    } else {
      range.deleteContents();
      range.insertNode(sub);
      inserted = true;
    }
  }

  if (!inserted) {
    const list = card.querySelector('.bullet-list');
    if (list) {
      list.appendChild(sub);
    } else {
      card.appendChild(sub);
    }
  }

  const newRange = document.createRange();
  newRange.selectNodeContents(sub);
  newRange.collapse(false);
  sel.removeAllRanges();
  sel.addRange(newRange);
}

function deleteBlock(btn) { 
  const block = btn.closest('.block-wrapper');
  if (block) block.remove(); 
  updateTitleUI();
}

function moveUp(btn) {
  const wrapper = btn.closest('.block-wrapper');
  if (wrapper && wrapper.previousElementSibling) wrapper.parentNode.insertBefore(wrapper, wrapper.previousElementSibling);
}

function moveDown(btn) {
  const wrapper = btn.closest('.block-wrapper');
  if (wrapper && wrapper.nextElementSibling) wrapper.parentNode.insertBefore(wrapper, wrapper.nextElementSibling);
}

function clearCanvas() {
  if (confirm('Clear the entire notebook canvas?')) {
    document.getElementById('editorCanvas').innerHTML = '';
    manualTitleOverride = null;
    importedFileName = null;
    updateTitleUI();
  }
}

function handleHighlightClick(e, colorClass) {
  e.preventDefault();
  const sel = window.getSelection();
  if (!sel.rangeCount || sel.isCollapsed) return;
  const range = sel.getRangeAt(0);
  const span = document.createElement('span');
  span.className = colorClass;
  span.appendChild(range.extractContents());
  range.insertNode(span);
}

function handleClearHighlightClick(e) {
  e.preventDefault();
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const el = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
  const hl = el.closest('[class*="hl-"]');
  if (hl) {
    const parent = hl.parentNode;
    while (hl.firstChild) parent.insertBefore(hl.firstChild, hl);
    hl.remove();
  }
}

function handleTextSizeClick(e, sizeClass) {
  e.preventDefault();
  const sel = window.getSelection();
  if (!sel.rangeCount || sel.isCollapsed) return;
  const range = sel.getRangeAt(0);
  const span = document.createElement('span');
  span.className = sizeClass;
  span.appendChild(range.extractContents());
  range.insertNode(span);
}

function handleClearTextSizeClick(e) {
  e.preventDefault();
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const el = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
  const sizeSpan = el.closest('.fs-sm, .fs-md, .fs-lg, .fs-xl');
  if (sizeSpan) {
    const parent = sizeSpan.parentNode;
    while (sizeSpan.firstChild) parent.insertBefore(sizeSpan.firstChild, sizeSpan);
    sizeSpan.remove();
  }
}

function makeEditable(node) {
  const editableSelectors = [
    'h1', 'h2', 'h3', 'h4', 'span:not(.eq-del-btn)', 'p', 'li', 'ul', 'div.sub-point', 'div.dot-point',
    'div.sticky', 'div.title-section', 'div.section-header', 'div.mains-q-title',
    'div.mains-framework', 'div.mcq-options', 'table.hand-table', 'div.exam-trick',
    'div.regular-text-content', 'div.math-block', 'td', 'th'
  ];
  editableSelectors.forEach(sel => {
    node.querySelectorAll(sel).forEach(el => {
      if (!el.closest('.card-toolbar') && !el.closest('.table-toolbar') && !el.closest('.block-controls') && !el.closest('.mains-box-toolbar') && !el.closest('.mains-item-controls') && !el.closest('.note-image-toolbar') && !el.classList.contains('sticky-del-btn') && !el.classList.contains('text-del-btn') && !el.classList.contains('eq-del-btn') && !el.classList.contains('note-image-del')) {
        el.setAttribute('contenteditable', 'true');
      }
    });
  });
  if (editableSelectors.some(sel => node.matches && node.matches(sel)) && !node.classList.contains('sticky-del-btn') && !node.classList.contains('text-del-btn') && !node.classList.contains('eq-del-btn') && !node.classList.contains('note-image-del')) {
    node.setAttribute('contenteditable', 'true');
  }
}

/* ================= IMPORT & EXPORT ================= */
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

  if (doc.title && doc.title !== 'Polity Notes Output' && doc.title !== 'Notes Visual Builder Studio') {
    manualTitleOverride = doc.title;
  }

  const canvas = document.getElementById('editorCanvas');
  canvas.innerHTML = '';
  
  sourceContainer.querySelectorAll(
    '.block-controls, .card-toolbar, .table-toolbar, .mains-box-toolbar, .mains-item-controls, ' +
    '.sticky-del-btn, .text-del-btn, .mid-insert-menu, .eq-del-btn, .note-image-del, .note-image-toolbar'
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
    const cards = contentEl.classList.contains('card-note') 
      ? [contentEl] 
      : Array.from(contentEl.querySelectorAll('.card-note'));

    cards.forEach(card => {
      if (!card.querySelector('.card-toolbar')) {
        card.insertAdjacentHTML('afterbegin', getCardToolbarHTML());
      }

      let matchedColor = null;
      for (const cName of Object.keys(colorMap)) {
        if (card.classList.contains(cName)) {
          matchedColor = cName;
          break;
        }
      }

      if (!matchedColor) {
        matchedColor = 'blue';
        card.classList.add('blue');
      }

      const heading = card.querySelector('h1, h2, h3, h4');
      if (heading) {
        heading.style.setProperty('color', colorMap[matchedColor], 'important');
      }
    });

    let processedHTML = contentEl.outerHTML;
    if (contentEl.tagName === 'TABLE' && !contentEl.closest('.mains-section')) {
      processedHTML = `
        <div class="table-block-wrapper">
          ${getTableToolbarHTML()}
          ${contentEl.outerHTML}
        </div>
      `;
    } else if (contentEl.querySelector('table:not(.mains-section table)')) {
      const tempWrapper = document.createElement('div');
      tempWrapper.innerHTML = contentEl.outerHTML;
      tempWrapper.querySelectorAll('table:not(.mains-section table)').forEach(tbl => {
        tbl.classList.add('hand-table');
        if (!tbl.closest('.table-block-wrapper')) {
          const wrapper = document.createElement('div');
          wrapper.className = 'table-block-wrapper';
          wrapper.innerHTML = `${getTableToolbarHTML()}${tbl.outerHTML}`;
          tbl.replaceWith(wrapper);
        } else if (!tbl.closest('.table-block-wrapper').querySelector('.table-toolbar')) {
          tbl.closest('.table-block-wrapper').insertAdjacentHTML('afterbegin', getTableToolbarHTML());
        }
      });
      processedHTML = tempWrapper.innerHTML;
    }

    const wrapped = wrapInBlock(processedHTML);
    canvas.appendChild(wrapped);

    wrapped.querySelectorAll('.sticky').forEach(st => {
      if (!st.querySelector('.sticky-del-btn')) {
        st.insertAdjacentHTML('afterbegin', getStickyDeleteButtonHTML());
      }
    });

    wrapped.querySelectorAll('.note-image-container').forEach(container => {
      if (!container.querySelector('.note-image-toolbar')) {
        container.insertAdjacentHTML('afterbegin', getImageToolbarHTML());
      }
      const wrapper = container.querySelector('.note-image-wrapper');
      if (wrapper && !wrapper.querySelector('.note-image-del')) {
        wrapper.insertAdjacentHTML('afterbegin', `<button class="note-image-del" contenteditable="false" onclick="this.closest('.block-wrapper').remove()" title="Delete Image">✕</button>`);
      }
    });

    wrapped.querySelectorAll('.eq, .math-block').forEach(eq => {
      if (!eq.querySelector('.eq-del-btn')) {
        eq.insertAdjacentHTML('beforeend', getFormulaDeleteButtonHTML());
      }
    });

    const mainsSection = wrapped.classList.contains('mains-section') ? wrapped : wrapped.querySelector('.mains-section');
    if (mainsSection) {
      mainsSection.querySelectorAll('.mains-q-item').forEach(item => {
        if (!item.querySelector('.mains-box-toolbar')) {
          item.insertAdjacentHTML('beforeend', getMainsBoxToolbarHTML());
        }
        if (!item.querySelector('.mains-item-controls')) {
          item.insertAdjacentHTML('afterbegin', `
            <div class="mains-item-controls" contenteditable="false">
              <button class="control-btn btn-del" style="background:#991b1b;" onclick="this.closest('.mains-q-item').remove()">✕</button>
            </div>
          `);
        }
      });
    }

    makeEditable(wrapped);
  });

  updateTitleUI();
  alert('Document loaded successfully!');
}

/* ================= FAIL-SAFE DIRECT CSS EXPORT ================= */
function getCoreStyleSheetCSS() {
  let activeStyles = '';
  // Safely grab local rules while ignoring CORS-restricted cross-origin sheets like Google Fonts
  for (let sheet of document.styleSheets) {
    try {
      if (sheet.cssRules) {
        for (let rule of sheet.cssRules) {
          activeStyles += rule.cssText + '\n';
        }
      }
    } catch (e) {
      // Cross-origin stylesheet access blocked by browser CORS policy; skip safely
    }
  }

  // If browser security blocked cssRules extraction, supply the complete local CSS fallback
  if (!activeStyles || activeStyles.trim().length < 200) {
    activeStyles = `
:root {
  --bg-page: #fbfbf9;
  --ruled-line: #e3ebf5;
  --margin-line: #f7a8b8;
  --ink-blue: #0f3870;
  --ink-dark: #1e293b;
  --ink-red: #b91c1c;
  --ink-green: #15803d;
  --ink-purple: #6b21a8;
  --ink-orange: #c2410c;
  --ink-yellow: #a16207;
  --ink-teal: #0f766e;
  --ink-cyan: #0369a1;
  --ink-indigo: #4338ca;
  --ink-rose: #be123c;
  --ink-amber: #b45309;
  --highlight-yellow: rgba(254, 240, 138, 0.85);
  --highlight-green: rgba(187, 247, 208, 0.75);
  --highlight-pink: rgba(251, 207, 232, 0.75);
  --highlight-blue: rgba(186, 230, 253, 0.75);
  --highlight-orange: rgba(254, 215, 170, 0.85);
  --highlight-purple: rgba(233, 213, 255, 0.75);
  --highlight-teal: rgba(153, 246, 228, 0.75);
  --highlight-amber: rgba(253, 230, 138, 0.85);
  --sticky-yellow: #fef9c3;
  --sticky-pink: #ffe4e6;
  --sticky-blue: #e0f2fe;
  --shadow: 0 4px 12px rgba(0,0,0,0.06);
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { 
  background-color: #cbd5e1; 
  display: flex; 
  justify-content: center; 
  padding: 25px 10px; 
  height: auto; 
  overflow: visible; 
  font-family: 'Kalam', cursive, sans-serif;
  color: var(--ink-dark);
}
.notebook-container { 
  width: 100%;
  max-width: 940px;
  min-height: 1200px;
  background-color: var(--bg-page);
  background-image: 
    linear-gradient(90deg, transparent 48px, var(--margin-line) 48px, var(--margin-line) 50px, transparent 50px),
    linear-gradient(var(--ruled-line) 1px, transparent 1px);
  background-size: 100% 28px, 100% 28px;
  background-repeat: repeat-y, repeat;
  padding: 35px 35px 80px 65px;
  border-radius: 4px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.15); 
  line-height: 28px;
  position: relative;
}
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
.card-note.blue h3   { color: var(--ink-blue) !important; }
.card-note.green h3  { color: var(--ink-green) !important; }
.card-note.purple h3 { color: var(--ink-purple) !important; }
.card-note.red h3    { color: var(--ink-red) !important; }
.card-note.yellow h3 { color: var(--ink-yellow) !important; }
.card-note.teal h3   { color: var(--ink-teal) !important; }
.card-note.amber h3  { color: var(--ink-amber) !important; }
.bullet-list { list-style: none; padding-left: 2px; }
.bullet-list li { margin-bottom: 5px; position: relative; padding-left: 22px; font-size: 16px; line-height: 24px; }
.bullet-list li::before { content: "➔"; position: absolute; left: 0; color: var(--ink-blue); font-weight: bold; }
.sub-point { margin-left: 18px; padding-left: 10px; border-left: 2px dashed #94a3b8; font-size: 15px; line-height: 22px; margin-top: 4px; margin-bottom: 8px; }
.dot-point { margin-left: 14px; position: relative; padding-left: 16px; font-size: 15.5px; line-height: 23px; margin-top: 3px; margin-bottom: 5px; }
.dot-point::before { content: "•"; position: absolute; left: 2px; color: var(--ink-dark); font-weight: 900; font-size: 16px; }
.sticky { position: relative; padding: 14px 16px; border-radius: 2px; box-shadow: 2px 4px 10px rgba(0,0,0,0.1); transform: rotate(-0.5deg); margin: 12px 0; font-size: 15.5px; line-height: 22px; font-family: 'Patrick Hand', cursive; }
.sticky.yellow { background: var(--sticky-yellow); border-top: 8px solid #fef08a; }
.sticky.pink { background: var(--sticky-pink); border-top: 8px solid #fbcfe8; transform: rotate(0.6deg); }
.table-block-wrapper { position: relative; margin: 14px 0 18px 0; }
.hand-table { width: 100%; border-collapse: collapse; margin: 4px 0 10px 0; background: rgba(255,255,255,0.85); font-size: 15px; }
.hand-table th, .hand-table td { border: 1px solid #94a3b8; padding: 7px 10px; text-align: left; line-height: 20px; }
.hand-table th { background: #e2e8f0; color: var(--ink-blue); font-family: 'Caveat', cursive; font-size: 19px; }
.exam-trick { background: #fff1f2; border: 2px dashed var(--ink-red); border-radius: 8px; padding: 14px 18px; margin: 16px 0; position: relative; }
.exam-trick::before { content: "⚡ TOPPER'S RED ALERT: EXAM TRAPS ⚡"; font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 800; color: var(--ink-red); position: absolute; top: -11px; left: 18px; background: #fff; padding: 0 8px; border: 1px solid var(--ink-red); border-radius: 4px; }
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
  }
  return activeStyles;
}

function exportCleanHTML() {
  const canvasClone = document.getElementById('editorCanvas').cloneNode(true);
  
  // Clean all editor toolbars and controls from exported document
  canvasClone.querySelectorAll(
    '.block-controls, .card-toolbar, .table-toolbar, .mains-box-toolbar, ' +
    '.mains-item-controls, .sticky-del-btn, .text-del-btn, .note-image-del, ' +
    '.note-image-toolbar, .mid-insert-menu, .eq-del-btn'
  ).forEach(el => el.remove());
  
  canvasClone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));

  const resolvedTitle = resolveDocumentTitle();
  let downloadFilename = importedFileName || ((resolvedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'notes_output') + '.html');

  const fullCSS = getCoreStyleSheetCSS();

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