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
    // 1. Inject Card Toolbar with INK swatches
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
      if (heading && colorMap[matchedColor]) {
        heading.style.setProperty('color', colorMap[matchedColor], 'important');
      }
    });

    // 2. Inject INK toolbar into all Expandable dropdown boxes
    const expandBoxes = contentEl.classList.contains('expand-block-wrapper') 
      ? [contentEl] 
      : Array.from(contentEl.querySelectorAll('.expand-block-wrapper'));

    expandBoxes.forEach(box => {
      if (!box.querySelector('.expand-box-toolbar')) {
        box.insertAdjacentHTML('afterbegin', getExpandBoxToolbarHTML());
      }
    });

    // 3. Inject Table toolbars (Left-Aligned)
    let processedHTML = contentEl.outerHTML;
    if (contentEl.tagName === 'TABLE' && !contentEl.closest('.mains-section') && !contentEl.closest('.expand-content-inner')) {
      processedHTML = `
        <div class="table-block-wrapper">
          ${getTableToolbarHTML()}
          ${contentEl.outerHTML}
        </div>
      `;
    } else if (contentEl.querySelector('table:not(.mains-section table):not(.expand-content-inner table)')) {
      const tempWrapper = document.createElement('div');
      tempWrapper.innerHTML = contentEl.outerHTML;
      tempWrapper.querySelectorAll('table:not(.mains-section table):not(.expand-content-inner table)').forEach(tbl => {
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

    // 4. Inject sticky delete buttons
    wrapped.querySelectorAll('.sticky').forEach(st => {
      if (!st.querySelector('.sticky-del-btn')) {
        st.insertAdjacentHTML('afterbegin', getStickyDeleteButtonHTML());
      }
    });

    // 5. Inject image toolbars
    wrapped.querySelectorAll('.note-image-container').forEach(container => {
      if (!container.querySelector('.note-image-toolbar')) {
        container.insertAdjacentHTML('afterbegin', getImageToolbarHTML());
      }
      const wrapper = container.querySelector('.note-image-wrapper');
      if (wrapper && !wrapper.querySelector('.note-image-del')) {
        wrapper.insertAdjacentHTML('afterbegin', `<button class="note-image-del" contenteditable="false" onclick="this.closest('.block-wrapper').remove()" title="Delete Image">✕</button>`);
      }
    });

    // 6. Inject formula delete buttons
    wrapped.querySelectorAll('.eq, .math-block').forEach(eq => {
      if (!eq.querySelector('.eq-del-btn')) {
        eq.insertAdjacentHTML('beforeend', getFormulaDeleteButtonHTML());
      }
    });

    // 7. Inject mains toolbars
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

function exportCleanHTML() {
  const canvasClone = document.getElementById('editorCanvas').cloneNode(true);
  
  // Strip all editor-specific controls, toolbars, and delete buttons
  canvasClone.querySelectorAll(
    '.block-controls, .card-toolbar, .table-toolbar, .mains-box-toolbar, ' +
    '.mains-item-controls, .sticky-del-btn, .text-del-btn, .note-image-del, ' +
    '.note-image-toolbar, .mid-insert-menu, .eq-del-btn, .expand-box-toolbar, .table-del-btn'
  ).forEach(el => el.remove());
  
  // Remove contenteditable attributes so the exported file is read-only
  canvasClone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));

  const resolvedTitle = resolveDocumentTitle();
  let downloadFilename = importedFileName || ((resolvedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'notes_output') + '.html');

  // Embed the complete, self-contained CSS stylesheet into the export
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