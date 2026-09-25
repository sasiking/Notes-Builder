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

function insertTableInMains(btn) {
  const mainsItem = btn.closest('.mains-q-item');
  if (!mainsItem) return;
  const framework = mainsItem.querySelector('.mains-framework');
  if (!framework) return;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = getBlankTableHTML().trim();
  const tableWrapper = tempDiv.firstElementChild;

  framework.appendChild(tableWrapper);
  makeEditable(tableWrapper);
  tableWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ================= EXPAND BOX ACTIONS ================= */
function getActiveExpandBoxInner(btn) {
  const boxWrapper = btn.closest('.expand-block-wrapper');
  if (!boxWrapper) return null;
  return boxWrapper.querySelector('.expand-content-inner');
}

function addSymbolToExpandBox(btn, symbol) {
  const inner = getActiveExpandBoxInner(btn);
  if (!inner) return;
  inner.focus();
  const sel = window.getSelection();
  const symbolNode = document.createTextNode('\n' + symbol + ' ');
  if (sel.rangeCount > 0 && inner.contains(sel.anchorNode)) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(symbolNode);
    range.setStartAfter(symbolNode);
    sel.removeAllRanges();
    sel.addRange(range);
  } else {
    inner.appendChild(symbolNode);
  }
}

function addDotPointToExpandBox(btn) {
  const inner = getActiveExpandBoxInner(btn);
  if (!inner) return;
  inner.focus();
  const sel = window.getSelection();
  const dotNode = document.createTextNode('\n• ');
  if (sel.rangeCount > 0 && inner.contains(sel.anchorNode)) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(dotNode);
    range.setStartAfter(dotNode);
    sel.removeAllRanges();
    sel.addRange(range);
  } else {
    inner.appendChild(dotNode);
  }
}

function addSubpointToExpandBox(btn) {
  const inner = getActiveExpandBoxInner(btn);
  if (!inner) return;
  inner.focus();

  const sub = document.createElement('div');
  sub.className = 'sub-point';
  sub.contentEditable = 'true';
  sub.innerHTML = '▫ <strong>Note:</strong> Detailed sub-point...';

  const sel = window.getSelection();
  if (sel.rangeCount > 0 && inner.contains(sel.anchorNode)) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(sub);
  } else {
    inner.appendChild(sub);
  }

  const newRange = document.createRange();
  newRange.selectNodeContents(sub);
  newRange.collapse(false);
  sel.removeAllRanges();
  sel.addRange(newRange);
}

function handleExpandBoxTab(btn, direction) {
  const inner = getActiveExpandBoxInner(btn);
  if (!inner) return;
  inner.focus();
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const range = sel.getRangeAt(0);

  if (direction === 'in') {
    const tabNode = document.createTextNode('    ');
    range.insertNode(tabNode);
    range.setStartAfter(tabNode);
    sel.removeAllRanges();
    sel.addRange(range);
  } else {
    const textNode = range.startContainer;
    if (textNode.nodeType === 3 && textNode.nodeValue.startsWith('    ')) {
      textNode.nodeValue = textNode.nodeValue.substring(4);
    }
  }
}

function insertTableInExpandBox(btn) {
  const inner = getActiveExpandBoxInner(btn);
  if (!inner) return;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = getBlankTableHTML().trim();
  const tableWrapper = tempDiv.firstElementChild;

  inner.appendChild(tableWrapper);
  makeEditable(tableWrapper);
  tableWrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* Card list additions */
function addBulletToCard(btn) {
  const card = btn.closest('.card-note, .grid-col');
  if (!card) return;
  const li = document.createElement('li');
  li.innerHTML = '<strong>Point:</strong> Description...';
  li.setAttribute('contenteditable', 'true');
  card.querySelector('.bullet-list')?.appendChild(li);
}

function addDotPointToCard(btn) {
  const card = btn.closest('.card-note, .grid-col');
  if (!card) return;
  const dotNode = document.createTextNode('• ');
  card.appendChild(dotNode);
}

function addSubpointToCard(btn) {
  const card = btn.closest('.card-note, .grid-col');
  if (!card) return;
  const sub = document.createElement('div');
  sub.className = 'sub-point';
  sub.innerHTML = '▫ <strong>Note:</strong> Details...';
  sub.setAttribute('contenteditable', 'true');
  card.appendChild(sub);
}