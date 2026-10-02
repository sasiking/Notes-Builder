/* ================= DOM UTILITIES FOR PRECISE CARET INSERTION ================= */
function getSubpointDeleteBtnHTML() {
  return `<button class="subpoint-del-btn" contenteditable="false" onmousedown="event.preventDefault(); this.closest('.sub-point').remove();" title="Delete Sub-point">✕</button>`;
}

function insertNodeDirectlyAtCaret(newNode, fallbackContainer) {
  const sel = window.getSelection();

  if (sel.rangeCount > 0 && fallbackContainer.contains(sel.anchorNode)) {
    const range = sel.getRangeAt(0);
    range.deleteContents();

    range.insertNode(newNode);

    const newRange = document.createRange();
    const textTarget = newNode.querySelector('.subpoint-text') || newNode;
    newRange.selectNodeContents(textTarget);
    newRange.collapse(false);
    sel.removeAllRanges();
    sel.addRange(newRange);
  } else {
    fallbackContainer.focus();
    fallbackContainer.appendChild(newNode);

    const newRange = document.createRange();
    const textTarget = newNode.querySelector('.subpoint-text') || newNode;
    newRange.selectNodeContents(textTarget);
    newRange.collapse(false);
    sel.removeAllRanges();
    sel.addRange(newRange);
  }

  newNode.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ================= CARD INLINE ACTIONS ================= */
function addBulletToCard(btn) {
  const card = btn.closest('.card-note, .grid-col');
  if (!card) return;

  const li = document.createElement('li');
  li.innerHTML = '<strong>Point:</strong> Description...';
  li.setAttribute('contenteditable', 'true');

  const sel = window.getSelection();
  if (sel.rangeCount > 0 && card.contains(sel.anchorNode)) {
    let activeLi = sel.anchorNode.nodeType === 1 ? sel.anchorNode.closest('li') : sel.anchorNode.parentElement?.closest('li');
    if (activeLi && activeLi.parentElement) {
      if (activeLi.parentElement.tagName !== 'UL') {
        const ul = document.createElement('ul');
        ul.className = 'bullet-list';
        activeLi.parentElement.insertBefore(ul, activeLi);
        ul.appendChild(activeLi);
      } else if (!activeLi.parentElement.classList.contains('bullet-list')) {
        activeLi.parentElement.classList.add('bullet-list');
      }
      activeLi.insertAdjacentElement('afterend', li);
      const range = document.createRange();
      range.selectNodeContents(li);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      return;
    }
  }

  const body = card.querySelector('.card-text-body') || card;
  let targetUl = body.querySelector('ul.bullet-list');
  if (!targetUl) {
    targetUl = document.createElement('ul');
    targetUl.className = 'bullet-list';
    insertNodeDirectlyAtCaret(targetUl, body);
  }
  targetUl.appendChild(li);

  const range = document.createRange();
  range.selectNodeContents(li);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}

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
  }
}

function addSubpointToCard(btn) {
  const card = btn.closest('.card-note, .grid-col');
  if (!card) return;

  const sub = document.createElement('div');
  sub.className = 'sub-point';
  sub.setAttribute('contenteditable', 'true');
  sub.innerHTML = `${getSubpointDeleteBtnHTML()}▫ <span class="subpoint-text"><strong>Note:</strong> Details...</span>`;

  insertNodeDirectlyAtCaret(sub, card);
}

function addParentSubpoint(btn) {
  const container = btn.closest('.card-note, .grid-col, .expand-content-inner, .mains-framework');
  if (!container) return;

  const sel = window.getSelection();
  if (!sel.rangeCount) return;

  const activeNode = sel.anchorNode;
  const currentSub = activeNode.nodeType === 1 ? activeNode.closest('.sub-point') : activeNode.parentElement?.closest('.sub-point');

  const newSub = document.createElement('div');
  newSub.className = 'sub-point';
  newSub.setAttribute('contenteditable', 'true');
  newSub.innerHTML = `${getSubpointDeleteBtnHTML()}▫ <span class="subpoint-text"><strong>Note:</strong> Details...</span>`;

  if (currentSub) {
    const parentSub = currentSub.parentElement?.closest('.sub-point');
    const targetElement = parentSub || currentSub;
    targetElement.insertAdjacentElement('afterend', newSub);

    const range = document.createRange();
    const textTarget = newSub.querySelector('.subpoint-text') || newSub;
    range.selectNodeContents(textTarget);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  } else {
    insertNodeDirectlyAtCaret(newSub, container);
  }
}

/* ================= MCQ CATCH DELETE & RESTORE HANDLERS ================= */
function deleteMcqCatch(delBtn) {
  const wrapper = delBtn.closest('.mcq-solution-wrapper');
  const card = delBtn.closest('.mcq-card');
  if (wrapper) wrapper.remove();
  
  if (card) {
    const addBtn = card.querySelector('.mcq-add-catch-btn');
    if (addBtn) addBtn.style.display = 'inline-block';
  }
}

function addMcqCatch(addBtn) {
  const card = addBtn.closest('.mcq-card');
  if (!card) return;

  if (card.querySelector('.mcq-solution-wrapper')) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'mcq-solution-wrapper';
  wrapper.style.cssText = 'position:relative; margin-top:8px;';
  wrapper.innerHTML = `
    ${getMcqCatchDeleteBtnHTML()}
    <details class="reveal-box mcq-solution-box" open="">
      <summary>Show Answer & Catch</summary>
      <div class="reveal-content">
        <div contenteditable="true" style="background-color: #ffffff; padding: 8px 10px; margin-top: 2px;">
          ➔ <strong>Correct Answer:</strong> <span class="hl-pink">Option 1</span><br>
          ▫ <strong>Explanation:</strong> Explanation or step-by-step calculation here...
        </div>
      </div>
    </details>
  `;
  card.appendChild(wrapper);
  addBtn.style.display = 'none';
}

/* ================= EXPAND BOX INLINE ACTIONS ================= */
function getActiveExpandBoxInner(btn) {
  const boxWrapper = btn.closest('.expand-block-wrapper');
  if (!boxWrapper) return null;
  return boxWrapper.querySelector('.expand-content-inner');
}

function addSymbolToExpandBox(btn, symbol) {
  const inner = getActiveExpandBoxInner(btn);
  if (!inner) return;

  const sel = window.getSelection();
  const symbolNode = document.createTextNode(symbol + ' ');

  if (sel.rangeCount > 0 && inner.contains(sel.anchorNode)) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(symbolNode);
    range.setStartAfter(symbolNode);
    range.setEndAfter(symbolNode);
    sel.removeAllRanges();
    sel.addRange(range);
  } else {
    inner.focus();
    inner.appendChild(symbolNode);
  }
}

function addDotPointToExpandBox(btn) {
  addSymbolToExpandBox(btn, '•');
}

function addSubpointToExpandBox(btn) {
  const inner = getActiveExpandBoxInner(btn);
  if (!inner) return;

  const sub = document.createElement('div');
  sub.className = 'sub-point';
  sub.setAttribute('contenteditable', 'true');
  sub.innerHTML = `${getSubpointDeleteBtnHTML()}▫ <span class="subpoint-text"><strong>Detail:</strong> Sub-point elaboration...</span>`;

  insertNodeDirectlyAtCaret(sub, inner);
}

function handleExpandBoxTab(btn, direction) {
  const inner = getActiveExpandBoxInner(btn);
  if (!inner) return;
  const sel = window.getSelection();
  if (!sel.rangeCount || !inner.contains(sel.anchorNode)) return;
  const range = sel.getRangeAt(0);

  if (direction === 'in') {
    const tabNode = document.createTextNode('    ');
    range.insertNode(tabNode);
    range.setStartAfter(tabNode);
    range.setEndAfter(tabNode);
    sel.removeAllRanges();
    sel.addRange(range);
  } else {
    const textNode = range.startContainer;
    if (textNode.nodeType === 3 && textNode.nodeValue.startsWith('    ')) {
      textNode.nodeValue = textNode.nodeValue.substring(4);
    }
  }
}

/* FIX: Table inside Expandable Box is wrapped in full draggable block */
function insertTableInExpandBox(btn) {
  const inner = getActiveExpandBoxInner(btn);
  if (!inner) return;

  const tableBlock = wrapInBlock(getBlankTableHTML().trim());
  insertNodeDirectlyAtCaret(tableBlock, inner);
  makeEditable(tableBlock);
}

/* ================= MAINS INLINE ACTIONS ================= */
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

  const sel = window.getSelection();
  const symbolNode = document.createTextNode(symbol + ' ');

  if (sel.rangeCount > 0 && framework.contains(sel.anchorNode)) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(symbolNode);
    range.setStartAfter(symbolNode);
    range.setEndAfter(symbolNode);
    sel.removeAllRanges();
    sel.addRange(range);
  } else {
    framework.focus();
    framework.appendChild(symbolNode);
  }
}

function addSubpointToMains(btn) {
  const framework = btn.closest('.mains-q-item').querySelector('.mains-framework');
  if (!framework) return;

  const subDiv = document.createElement('div');
  subDiv.className = 'sub-point';
  subDiv.setAttribute('contenteditable', 'true');
  subDiv.innerHTML = `${getSubpointDeleteBtnHTML()}▫ <span class="subpoint-text"><strong>Note:</strong> Mains sub-point detail...</span>`;

  insertNodeDirectlyAtCaret(subDiv, framework);
}

function handleMainsTab(btn, direction) {
  const framework = btn.closest('.mains-q-item').querySelector('.mains-framework');
  if (!framework) return;
  const sel = window.getSelection();
  if (!sel.rangeCount || !framework.contains(sel.anchorNode)) return;
  const range = sel.getRangeAt(0);

  if (direction === 'in') {
    const tabNode = document.createTextNode('    ');
    range.insertNode(tabNode);
    range.setStartAfter(tabNode);
    range.setEndAfter(tabNode);
    sel.removeAllRanges();
    sel.addRange(range);
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

  const tableBlock = wrapInBlock(getBlankTableHTML().trim());
  insertNodeDirectlyAtCaret(tableBlock, framework);
  makeEditable(tableBlock);
}