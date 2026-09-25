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
        <div class="swatch" style="background:#0f3870;" onclick="changeCardColor(this, 'blue', event)"></div>
        <div class="swatch" style="background:#15803d;" onclick="changeCardColor(this, 'green', event)"></div>
        <div class="swatch" style="background:#a16207;" onclick="changeCardColor(this, 'yellow', event)"></div>
        <div class="swatch" style="background:#6b21a8;" onclick="changeCardColor(this, 'purple', event)"></div>
        <div class="swatch" style="background:#b91c1c;" onclick="changeCardColor(this, 'red', event)"></div>
        <div class="swatch" style="background:#0f766e;" onclick="changeCardColor(this, 'teal', event)"></div>
        <div class="swatch" style="background:#b45309;" onclick="changeCardColor(this, 'amber', event)"></div>
        <div class="swatch" style="background:#c2410c;" onclick="changeCardColor(this, 'orange', event)"></div>
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

function getExpandBoxToolbarHTML() {
  return `
    <div class="expand-box-toolbar" contenteditable="false">
      <div class="color-swatches">
        <span style="font-size:10px; font-weight:700; color:#64748b; margin-right:3px;">INK:</span>
        <div class="swatch" style="background:#0f3870;" onclick="changeExpandBoxColor(this, 'blue', event)"></div>
        <div class="swatch" style="background:#15803d;" onclick="changeExpandBoxColor(this, 'green', event)"></div>
        <div class="swatch" style="background:#a16207;" onclick="changeExpandBoxColor(this, 'yellow', event)"></div>
        <div class="swatch" style="background:#6b21a8;" onclick="changeExpandBoxColor(this, 'purple', event)"></div>
        <div class="swatch" style="background:#b91c1c;" onclick="changeExpandBoxColor(this, 'red', event)"></div>
        <div class="swatch" style="background:#0f766e;" onclick="changeExpandBoxColor(this, 'teal', event)"></div>
        <div class="swatch" style="background:#b45309;" onclick="changeExpandBoxColor(this, 'amber', event)"></div>
        <div class="swatch" style="background:#c2410c;" onclick="changeExpandBoxColor(this, 'orange', event)"></div>
        <div class="swatch" style="background:#be123c;" onclick="changeExpandBoxColor(this, 'rose', event)"></div>
      </div>
      <div class="expand-box-actions">
        <button class="card-tool-btn" onclick="addSymbolToExpandBox(this, '•')">• Bullet</button>
        <button class="card-tool-btn" onclick="addDotPointToExpandBox(this)">• Dot</button>
        <button class="card-tool-btn" onclick="addSubpointToExpandBox(this)">▫ Sub-point</button>
        <button class="card-tool-btn" onclick="addSymbolToExpandBox(this, '★')">★ Star</button>
        <button class="card-tool-btn" onclick="addSymbolToExpandBox(this, '▫')">▫ Square</button>
        <button class="card-tool-btn" onclick="addSymbolToExpandBox(this, '❖')">❖ Diamond</button>
        <button class="card-tool-btn" onclick="handleExpandBoxTab(this, 'in')">⇥ Tab</button>
        <button class="card-tool-btn" onclick="handleExpandBoxTab(this, 'out')">⇤ Untab</button>
        <button class="card-tool-btn" onclick="insertTableInExpandBox(this)" style="background:#e0f2fe; color:#0369a1; border-color:#93c5fd;">📊 Table</button>
      </div>
    </div>
  `;
}

function getBlankExpandBoxHTML() {
  return `
    <div class="expand-block-wrapper blue">
      ${getExpandBoxToolbarHTML()}
      <details class="reveal-box">
        <summary contenteditable="true">Click to View Details / Analysis</summary>
        <div class="reveal-content">
          <div class="expand-content-inner" contenteditable="true" style="background-color: #ffffff; padding: 10px 12px; margin-top: 2px; border-radius: 4px; font-size: 15px; line-height: 23px;">
            • <strong>Key Concept:</strong> Main descriptive takeaway or point here...<br>
            <div class="sub-point" contenteditable="true">▫ <strong>Detail:</strong> Sub-point elaboration or evidence...</div>
          </div>
        </div>
      </details>
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
        <button class="mid-insert-btn" onclick="executeMidInsert(this, 'expand-box')">🔽 Expandable Box (Dropdown)</button>
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
    'expand-box': getBlankExpandBoxHTML(),
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

function wrapInBlock(htmlContent) {
  const wrapper = document.createElement('div');
  wrapper.className = 'block-wrapper';
  wrapper.innerHTML = `${getControlsHTML()}${htmlContent}`;
  attachDragHandlers(wrapper);
  return wrapper;
}