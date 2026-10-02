const colorMap = {
  blue: '#0f3870',
  green: '#15803d',
  yellow: '#a16207',
  purple: '#6b21a8',
  red: '#b91c1c',
  teal: '#0f766e',
  amber: '#b45309',
  orange: '#c2410c',
  rose: '#be123c'
};

function changeCardColor(swatchEl, colorName, event) {
  if (event) event.stopPropagation();
  const card = swatchEl.closest('.card-note');
  if (!card) return;

  Object.keys(colorMap).forEach(c => card.classList.remove(c));
  card.classList.add(colorName);

  const heading = card.querySelector('h1, h2, h3, h4');
  if (heading && colorMap[colorName]) {
    heading.style.setProperty('color', colorMap[colorName], 'important');
  }
}

function changeExpandBoxColor(swatchEl, colorName, event) {
  if (event) event.stopPropagation();
  const boxWrapper = swatchEl.closest('.expand-block-wrapper');
  if (!boxWrapper) return;

  Object.keys(colorMap).forEach(c => boxWrapper.classList.remove(c));
  boxWrapper.classList.add(colorName);
}

/* ================= SELECTION HIGHLIGHTER HANDLERS ================= */
function handleHighlightClick(event, hlClass) {
  event.preventDefault(); // Prevents selection from disappearing
  const sel = window.getSelection();
  if (!sel.rangeCount || sel.isCollapsed) return;

  const range = sel.getRangeAt(0);
  const selectedText = range.extractContents();
  const span = document.createElement('span');
  span.className = hlClass;
  span.appendChild(selectedText);
  range.insertNode(span);

  sel.removeAllRanges();
}

function handleClearHighlightClick(event) {
  event.preventDefault();
  const sel = window.getSelection();
  if (!sel.rangeCount) return;

  const node = sel.anchorNode;
  const hlSpan = node.nodeType === 1 ? node.closest('[class*="hl-"]') : node.parentElement?.closest('[class*="hl-"]');
  if (hlSpan) {
    const parent = hlSpan.parentNode;
    while (hlSpan.firstChild) {
      parent.insertBefore(hlSpan.firstChild, hlSpan);
    }
    hlSpan.remove();
  }
}

/* ================= SELECTION TEXT SIZER HANDLERS ================= */
function handleTextSizeClick(event, sizeClass) {
  event.preventDefault();
  const sel = window.getSelection();
  if (!sel.rangeCount || sel.isCollapsed) return;

  const range = sel.getRangeAt(0);
  const selectedText = range.extractContents();
  const span = document.createElement('span');
  span.className = sizeClass;
  span.appendChild(selectedText);
  range.insertNode(span);

  sel.removeAllRanges();
}

function handleClearTextSizeClick(event) {
  event.preventDefault();
  const sel = window.getSelection();
  if (!sel.rangeCount) return;

  const node = sel.anchorNode;
  const sizeSpan = node.nodeType === 1 ? node.closest('[class*="fs-"]') : node.parentElement?.closest('[class*="fs-"]');
  if (sizeSpan) {
    const parent = sizeSpan.parentNode;
    while (sizeSpan.firstChild) {
      parent.insertBefore(sizeSpan.firstChild, sizeSpan);
    }
    sizeSpan.remove();
  }
}