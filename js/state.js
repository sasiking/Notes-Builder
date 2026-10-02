let importedFileName = null;
let manualTitleOverride = null;
let savedSelectionRange = null;
let activeFormulaTab = 'basic';
let activeMidInsertTarget = null;
let draggedElement = null;

function broadcastTitleChange(title) {
  if (!title) return;
  const fileName = importedFileName;
  if (!fileName) return;

  try {
    const overrides = JSON.parse(localStorage.getItem('GROUP1_NOTES_TITLE_OVERRIDES') || '{}');
    overrides[fileName] = {
      title: title,
      updatedAt: Date.now()
    };
    localStorage.setItem('GROUP1_NOTES_TITLE_OVERRIDES', JSON.stringify(overrides));
  } catch (err) {
    console.warn('Storage sync error:', err);
  }

  try {
    if (window.opener && !window.opener.closed && typeof window.opener.refreshNoteTitle === 'function') {
      window.opener.refreshNoteTitle(fileName, title);
    }
  } catch (e) {}
}

function syncManualTitle(val) {
  const clean = val.trim();
  manualTitleOverride = clean || null;
  const currentTitle = resolveDocumentTitle();
  document.title = `${currentTitle} | Visual Notes Studio`;

  // Dynamically sync canvas heading if present
  const canvas = document.getElementById('editorCanvas');
  const bannerH1 = canvas ? canvas.querySelector('.title-section h1, h1') : null;
  if (bannerH1 && clean && bannerH1.innerText.trim() !== clean) {
    bannerH1.innerText = clean;
  }

  broadcastTitleChange(currentTitle);
}

function isGenericTitle(t) {
  if (!t) return true;
  const s = t.toLowerCase().trim();
  return (
    s === 'polity notes output' ||
    s === 'visual notes studio' ||
    s.includes('visual build') ||
    s === 'study notes' ||
    s === 'untitled' ||
    s === 'document'
  );
}

function resolveDocumentTitle() {
  if (manualTitleOverride && !isGenericTitle(manualTitleOverride)) return manualTitleOverride;
  const canvas = document.getElementById('editorCanvas');
  const mainH1 = canvas ? canvas.querySelector('.title-section h1, h1') : null;
  if (mainH1 && mainH1.innerText.trim() && mainH1.innerText.trim() !== 'Main Title Here' && !isGenericTitle(mainH1.innerText.trim())) {
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
  const currentTitle = resolveDocumentTitle();
  if (titleInput) {
    titleInput.value = currentTitle;
  }
  document.title = `${currentTitle} | Visual Notes Studio`;
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('editorCanvas');
  if (canvas) {
    canvas.addEventListener('input', (e) => {
      const h1 = e.target.closest('h1');
      if (h1 && (h1.closest('.title-section') || h1 === canvas.querySelector('h1'))) {
        const newTitle = h1.innerText.trim();
        if (newTitle && !isGenericTitle(newTitle)) {
          manualTitleOverride = newTitle;
          const titleInput = document.getElementById('docTitleInput');
          if (titleInput) titleInput.value = newTitle;
          document.title = `${newTitle} | Visual Notes Studio`;
          broadcastTitleChange(newTitle);
          return;
        }
      }
      updateTitleUI();
    });
    
    canvas.addEventListener('keydown', handleEditorKeydown);
    initCanvasDropEvents(canvas);
  }

  // GLOBAL CTRL + S KEYBOARD INTERCEPTION
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault(); // Intercept browser's native webpage download
      saveDirect();
    }
  });
});

/* ================= KEYBOARD INTERCEPTION ================= */
function handleEditorKeydown(e) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;

  const node = sel.anchorNode;
  const targetElement = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;

  // 1. PREVENT SUMMARY AUTO-TOGGLE ON SPACEBAR
  const summaryEl = targetElement?.closest('summary');
  if (summaryEl) {
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      e.stopPropagation();

      const range = sel.getRangeAt(0);
      range.deleteContents();

      const spaceNode = document.createTextNode('\u00A0');
      range.insertNode(spaceNode);

      range.setStartAfter(spaceNode);
      range.setEndAfter(spaceNode);
      sel.removeAllRanges();
      sel.addRange(range);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  }

  const subPoint = targetElement?.closest('.sub-point');

  // 2. OUTDENT / EXIT TO PARENT SUB-POINT VIA SHIFT + TAB
  if (e.key === 'Tab' && subPoint) {
    e.preventDefault();
    if (e.shiftKey) {
      const parentSubPoint = subPoint.parentElement?.closest('.sub-point');
      if (parentSubPoint && parentSubPoint.parentElement) {
        parentSubPoint.insertAdjacentElement('afterend', subPoint);
        const newRange = document.createRange();
        newRange.selectNodeContents(subPoint.querySelector('.subpoint-text') || subPoint);
        newRange.collapse(false);
        sel.removeAllRanges();
        sel.addRange(newRange);
      }
    } else {
      const prevSiblingSubPoint = subPoint.previousElementSibling?.closest('.sub-point');
      if (prevSiblingSubPoint) {
        prevSiblingSubPoint.appendChild(subPoint);
        const newRange = document.createRange();
        newRange.selectNodeContents(subPoint.querySelector('.subpoint-text') || subPoint);
        newRange.collapse(false);
        sel.removeAllRanges();
        sel.addRange(newRange);
      }
    }
    return;
  }

  // 3. BACKSPACE: Cleanly remove empty sub-points
  if (e.key === 'Backspace' && subPoint) {
    const cleanText = subPoint.innerText.replace(/✕/g, '').replace(/▫/g, '').trim();
    const range = sel.getRangeAt(0);

    if (cleanText === '' || (range.startOffset === 0 && range.collapsed && sel.anchorNode === subPoint.firstChild)) {
      e.preventDefault();
      const parentSub = subPoint.parentElement?.closest('.sub-point');
      const prevSibling = subPoint.previousElementSibling || subPoint.previousSibling;
      const parent = parentSub || subPoint.parentElement;
      subPoint.remove();

      const newRange = document.createRange();
      if (prevSibling) {
        newRange.selectNodeContents(prevSibling);
        newRange.collapse(false);
      } else if (parent) {
        newRange.selectNodeContents(parent);
        newRange.collapse(false);
      }
      sel.removeAllRanges();
      sel.addRange(newRange);
      return;
    }
  }

  // 4. ENTER KEY: Soft line break
  if (e.key === 'Enter') {
    const editableContainer = targetElement?.closest('.card-note, .reveal-content, .expand-content-inner, .mains-framework, .sticky, .exam-trick');
    if (!editableContainer) return;

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