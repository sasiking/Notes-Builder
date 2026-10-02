function getStickyDeleteButtonHTML() {
  return `<button class="sticky-del-btn" contenteditable="false" onclick="this.closest('.sticky').remove()">✕</button>`;
}

function getFormulaDeleteButtonHTML() {
  return `<button class="eq-del-btn" contenteditable="false" onclick="this.closest('.eq, .math-block').remove()" title="Delete">✕</button>`;
}

function getMcqCatchDeleteBtnHTML() {
  return `<button class="mcq-catch-del-btn" contenteditable="false" onmousedown="event.preventDefault(); deleteMcqCatch(this);" title="Delete Solution / Catch">✕</button>`;
}

function getCardToolbarHTML() {
  return `
    <div class="card-toolbar" contenteditable="false">
      <div class="color-swatches">
        <span style="font-size:10px; font-weight:700; color:#64748b; margin-right:3px;">INK:</span>
        <div class="swatch" style="background:#0f3870;" onmousedown="event.preventDefault()" onclick="changeCardColor(this, 'blue', event)"></div>
        <div class="swatch" style="background:#15803d;" onmousedown="event.preventDefault()" onclick="changeCardColor(this, 'green', event)"></div>
        <div class="swatch" style="background:#a16207;" onmousedown="event.preventDefault()" onclick="changeCardColor(this, 'yellow', event)"></div>
        <div class="swatch" style="background:#6b21a8;" onmousedown="event.preventDefault()" onclick="changeCardColor(this, 'purple', event)"></div>
        <div class="swatch" style="background:#b91c1c;" onmousedown="event.preventDefault()" onclick="changeCardColor(this, 'red', event)"></div>
        <div class="swatch" style="background:#0f766e;" onmousedown="event.preventDefault()" onclick="changeCardColor(this, 'teal', event)"></div>
        <div class="swatch" style="background:#b45309;" onmousedown="event.preventDefault()" onclick="changeCardColor(this, 'amber', event)"></div>
        <div class="swatch" style="background:#c2410c;" onmousedown="event.preventDefault()" onclick="changeCardColor(this, 'orange', event)"></div>
      </div>
      <div class="card-actions">
        <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="addBulletToCard(this)">+ Bullet</button>
        <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="addDotPointToCard(this)">• Dot</button>
        <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="addSubpointToCard(this)">+ Sub-point</button>
        <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="addParentSubpoint(this)" title="Add sibling to parent sub-point">⇤ Parent Pt</button>
        <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="addFormulaToCard(this)" style="background:#e0f2fe; color:#0369a1;">+ Formula</button>
        <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="removeFormulaFromCard(this)" style="background:#fee2e2; color:#991b1b;">- Formula</button>
      </div>
    </div>
  `;
}

function getExpandBoxToolbarHTML() {
  return `
    <div class="expand-box-toolbar" contenteditable="false">
      <div class="color-swatches">
        <span style="font-size:10px; font-weight:700; color:#64748b; margin-right:3px;">INK:</span>
        <div class="swatch" style="background:#0f3870;" onmousedown="event.preventDefault()" onclick="changeExpandBoxColor(this, 'blue', event)"></div>
        <div class="swatch" style="background:#15803d;" onmousedown="event.preventDefault()" onclick="changeExpandBoxColor(this, 'green', event)"></div>
        <div class="swatch" style="background:#a16207;" onmousedown="event.preventDefault()" onclick="changeExpandBoxColor(this, 'yellow', event)"></div>
        <div class="swatch" style="background:#6b21a8;" onmousedown="event.preventDefault()" onclick="changeExpandBoxColor(this, 'purple', event)"></div>
        <div class="swatch" style="background:#b91c1c;" onmousedown="event.preventDefault()" onclick="changeExpandBoxColor(this, 'red', event)"></div>
        <div class="swatch" style="background:#0f766e;" onmousedown="event.preventDefault()" onclick="changeExpandBoxColor(this, 'teal', event)"></div>
        <div class="swatch" style="background:#b45309;" onmousedown="event.preventDefault()" onclick="changeExpandBoxColor(this, 'amber', event)"></div>
        <div class="swatch" style="background:#c2410c;" onmousedown="event.preventDefault()" onclick="changeExpandBoxColor(this, 'orange', event)"></div>
        <div class="swatch" style="background:#be123c;" onmousedown="event.preventDefault()" onclick="changeExpandBoxColor(this, 'rose', event)"></div>
      </div>
      <div class="expand-box-actions">
        <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="addSymbolToExpandBox(this, '•')">• Bullet</button>
        <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="addDotPointToExpandBox(this)">• Dot</button>
        <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="addSubpointToExpandBox(this)">▫ Sub-point</button>
        <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="addParentSubpoint(this)" title="Add sibling to parent sub-point">⇤ Parent Pt</button>
        <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="addSymbolToExpandBox(this, '★')">★ Star</button>
        <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="addSymbolToExpandBox(this, '▫')">▫ Square</button>
        <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="addSymbolToExpandBox(this, '❖')">❖ Diamond</button>
        <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="handleExpandBoxTab(this, 'in')">⇥ Tab</button>
        <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="handleExpandBoxTab(this, 'out')">⇤ Untab</button>
        <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="insertTableInExpandBox(this)" style="background:#e0f2fe; color:#0369a1; border-color:#93c5fd;">📊 Table</button>
      </div>
    </div>
  `;
}

function getBlankExpandBoxHTML() {
  return `
    <div class="expand-block-wrapper blue">
      ${getExpandBoxToolbarHTML()}
      <details class="reveal-box" open="">
        <summary contenteditable="true">Click to View Details / Analysis</summary>
        <div class="reveal-content">
          <div class="expand-content-inner" contenteditable="true" style="background-color: #ffffff; padding: 12px; margin-top: 2px; border-radius: 4px; font-size: 15px; line-height: 23px; min-height: 60px;">
          </div>
        </div>
      </details>
    </div>
  `;
}

function getTableToolbarHTML() {
  return `
    <div class="table-toolbar" contenteditable="false">
      <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="addTableRow(this)">+ Row</button>
      <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="deleteTableRow(this)" style="color:#b91c1c;">- Row</button>
      <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="addTableColumn(this)">+ Col</button>
      <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="deleteTableColumn(this)" style="color:#b91c1c;">- Col</button>
      <button class="card-tool-btn table-del-btn" onmousedown="event.preventDefault()" onclick="deleteWholeTable(this)" title="Delete Entire Table">✕ Delete Table</button>
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
      <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="addSymbolToMains(this, '•')">• Bullet</button>
      <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="addSubpointToMains(this)">▫ Sub-point</button>
      <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="addParentSubpoint(this)">⇤ Parent Pt</button>
      <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="addSymbolToMains(this, '★')">★ Star</button>
      <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="addSymbolToMains(this, '▫')">▫ Square</button>
      <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="addSymbolToMains(this, '❖')">❖ Diamond</button>
      <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="handleMainsTab(this, 'in')">⇥ Tab</button>
      <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="handleMainsTab(this, 'out')">⇤ Untab</button>
      <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="insertTableInMains(this)" style="background:#e0f2fe; color:#0369a1; border-color:#93c5fd;">📊 Table</button>
      <button class="card-tool-btn" onmousedown="event.preventDefault()" onclick="insertMainsQuestionDirect(this)" style="background:#fee2e2; border-color:#f87171; color:#991b1b;">
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

function extractBlockToCanvasRoot(btn) {
  const wrapper = btn.closest('.block-wrapper');
  if (!wrapper) return;
  const canvas = document.getElementById('editorCanvas');
  const expandWrapper = wrapper.closest('.expand-block-wrapper');
  const parentContainer = expandWrapper ? expandWrapper.closest('.block-wrapper') : null;

  if (parentContainer && parentContainer.parentNode) {
    parentContainer.parentNode.insertBefore(wrapper, parentContainer.nextSibling);
  } else if (canvas) {
    canvas.appendChild(wrapper);
  }

  wrapper.classList.remove('inside-expand-drawer');
  wrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  cleanupEmptyMultiRows();
  updateTitleUI();
}

function getControlsHTML() {
  return `
    <div class="block-controls" contenteditable="false">
      <span class="control-btn drag-handle" title="Drag to reorder section">⠿ Drag</span>
      <button class="control-btn btn-popout" onclick="extractBlockToCanvasRoot(this)" title="Pop Out to Main Canvas">⇪ Pop Out</button>
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
        <button class="mid-insert-btn" onclick="executeMidInsert(this, 'page-break')">📄 Page Break (A4)</button>
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
            <div class="card-text-body" contenteditable="true">
              <ul class="bullet-list">
                <li><strong>Point 1:</strong> Start typing notes here...</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="grid-col">
          <div class="card-note green">
            ${getCardToolbarHTML()}
            <h3 contenteditable="true" style="color:var(--ink-green); font-size:20px;">Column 2 Title</h3>
            <div class="card-text-body" contenteditable="true">
              <ul class="bullet-list">
                <li><strong>Point 1:</strong> Start typing notes here...</li>
              </ul>
            </div>
          </div>
        </div>
      </div>`,
    'card-blue': `<div class="card-note blue">${getCardToolbarHTML()}<h3 contenteditable="true" style="color:var(--ink-blue); font-size:20px;">Card Title</h3><div class="card-text-body" contenteditable="true"><ul class="bullet-list"><li><strong>Point 1:</strong> Start typing notes here...</li></ul></div></div>`,
    'card-green': `<div class="card-note green">${getCardToolbarHTML()}<h3 contenteditable="true" style="color:var(--ink-green); font-size:20px;">Card Title</h3><div class="card-text-body" contenteditable="true"><ul class="bullet-list"><li><strong>Point 1:</strong> Start typing notes here...</li></ul></div></div>`,
    'card-yellow': `<div class="card-note yellow">${getCardToolbarHTML()}<h3 contenteditable="true" style="color:var(--ink-yellow); font-size:20px;">Card Title</h3><div class="card-text-body" contenteditable="true"><ul class="bullet-list"><li><strong>Point 1:</strong> Start typing notes here...</li></ul></div></div>`,
    'card-purple': `<div class="card-note purple">${getCardToolbarHTML()}<h3 contenteditable="true" style="color:var(--ink-purple); font-size:20px;">Card Title</h3><div class="card-text-body" contenteditable="true"><ul class="bullet-list"><li><strong>Point 1:</strong> Start typing notes here...</li></ul></div></div>`,
    'sticky-yellow': `<div class="sticky yellow">${getStickyDeleteButtonHTML()}<div contenteditable="true">📌 <strong>Exam Catch / Summary Note:</strong><br>Write shortcut or caveats here.</div></div>`,
    'sticky-pink': `<div class="sticky pink">${getStickyDeleteButtonHTML()}<div contenteditable="true">📌 <strong>Recent Update / Fact:</strong><br>Add recent details here.</div></div>`,
    'exam-trap': `<div class="exam-trick" contenteditable="true"><strong>TRAP: "Common incorrect statement."</strong> ➔ <strong>WRONG!</strong><div class="sub-point" contenteditable="true">▫ <strong>Reason:</strong> Actual correct fact...</div></div>`,
    'mcq-dropdown': `
      <div class="mcq-card">
        <div class="mcq-header-row" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span class="mcq-badge" contenteditable="true">EXAM BADGE</span>
          <button class="mcq-add-catch-btn" contenteditable="false" style="display:none;" onmousedown="event.preventDefault()" onclick="addMcqCatch(this)">+ Catch</button>
        </div>
        <div contenteditable="true" style="font-weight: 600; font-size: 15px; margin-bottom: 4px;">Q. Question prompt?</div>
        <div class="mcq-options" contenteditable="true">1) Option 1<br>2) Option 2<br>3) Option 3<br>4) Option 4</div>
        <div class="mcq-solution-wrapper" style="position:relative; margin-top:8px;">
          ${getMcqCatchDeleteBtnHTML()}
          <details class="reveal-box mcq-solution-box" open="">
            <summary>Show Answer & Catch</summary>
            <div class="reveal-content"><div contenteditable="true" style="background-color: #ffffff; padding: 8px 10px; margin-top: 2px;">➔ <strong>Correct Answer:</strong> <span class="hl-pink">Option 1</span><br>▫ <strong>Explanation:</strong> Explanation here...</div></div>
          </details>
        </div>
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
      </div>`,
    'page-break': `
      <div class="page-break-block" contenteditable="false">
        <div class="page-break-line"></div>
        <div class="page-break-badge">📄 Page Break (New A4 Sheet)</div>
        <div class="page-break-line"></div>
      </div>`
  };
  return map[type] || '';
}

function wrapInBlock(htmlContent) {
  const wrapper = document.createElement('div');
  wrapper.className = 'block-wrapper';
  if (typeof htmlContent === 'string' && htmlContent.includes('page-break-block')) {
    wrapper.classList.add('page-break-wrapper');
  }
  wrapper.innerHTML = `${getControlsHTML()}${htmlContent}`;
  attachDragHandlers(wrapper);
  return wrapper;
}