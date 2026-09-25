function makeEditable(node) {
  const editableSelectors = [
    'h1', 'h2', 'h3', 'h4', 'span:not(.eq-del-btn)', 'p', 'li', 'ul', 'div.sub-point', 'div.dot-point',
    'div.sticky', 'div.title-section', 'div.section-header', 'div.mains-q-title',
    'div.mains-framework', 'div.mcq-options', 'table.hand-table', 'div.exam-trick',
    'div.regular-text-content', 'div.math-block', 'td', 'th', 'summary', 'div.expand-content-inner'
  ];
  editableSelectors.forEach(sel => {
    node.querySelectorAll(sel).forEach(el => {
      if (!el.closest('.card-toolbar') && !el.closest('.table-toolbar') && 
          !el.closest('.block-controls') && !el.closest('.mains-box-toolbar') && 
          !el.closest('.mains-item-controls') && !el.closest('.note-image-toolbar') && 
          !el.closest('.expand-box-toolbar') && !el.classList.contains('sticky-del-btn') && 
          !el.classList.contains('text-del-btn') && !el.classList.contains('eq-del-btn') && 
          !el.classList.contains('note-image-del')) {
        el.setAttribute('contenteditable', 'true');
      }
    });
  });
  if (editableSelectors.some(sel => node.matches && node.matches(sel)) && 
      !node.classList.contains('sticky-del-btn') && !node.classList.contains('text-del-btn') && 
      !node.classList.contains('eq-del-btn') && !node.classList.contains('note-image-del')) {
    node.setAttribute('contenteditable', 'true');
  }
}

function clearCanvas() {
  if (confirm('Clear the entire notebook canvas?')) {
    document.getElementById('editorCanvas').innerHTML = '';
    manualTitleOverride = null;
    importedFileName = null;
    updateTitleUI();
  }
}