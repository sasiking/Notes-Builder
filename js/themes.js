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

function changeCardColor(swatchEl, colorName, event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
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
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  const box = swatchEl.closest('.expand-block-wrapper');
  if (!box) return;

  Object.keys(colorMap).forEach(c => box.classList.remove(c));
  box.classList.add(colorName);
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