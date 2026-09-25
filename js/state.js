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

function handleCardEnterKey(e) {
  if (e.key !== 'Enter') return;

  const sel = window.getSelection();
  if (!sel.rangeCount) return;

  const node = sel.anchorNode;
  const card = node.nodeType === Node.ELEMENT_NODE 
    ? node.closest('.card-note, .reveal-content') 
    : node.parentElement?.closest('.card-note, .reveal-content');

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