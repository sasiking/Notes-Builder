function openFormulaModalForCursor() {
  const sel = window.getSelection();
  if (sel.rangeCount > 0) {
    savedSelectionRange = sel.getRangeAt(0).cloneRange();
  } else {
    savedSelectionRange = null;
  }
  document.getElementById('formulaModal').style.display = 'flex';
  setTimeout(() => document.getElementById('basicFormulaInput').focus(), 50);
}

function closeFormulaModal() {
  document.getElementById('formulaModal').style.display = 'none';
  savedSelectionRange = null;
}

function switchFormulaTab(tabName) {
  activeFormulaTab = tabName;
  document.getElementById('tabBasic').classList.toggle('active', tabName === 'basic');
  document.getElementById('tabFraction').classList.toggle('active', tabName === 'fraction');
  document.getElementById('paneBasic').style.display = (tabName === 'basic') ? 'block' : 'none';
  document.getElementById('paneFraction').style.display = (tabName === 'fraction') ? 'block' : 'none';
}

function commitFormulaInsertion() {
  let formulaHTML = '';
  if (activeFormulaTab === 'basic') {
    const text = document.getElementById('basicFormulaInput').value.trim() || 'Formula';
    formulaHTML = `<span class="eq"><span contenteditable="true">${text}</span>${getFormulaDeleteButtonHTML()}</span>`;
  } else {
    const title = document.getElementById('fractionTitleInput').value.trim();
    const num = document.getElementById('fractionNumInput').value.trim() || 'Numerator';
    const den = document.getElementById('fractionDenInput').value.trim() || 'Denominator';
    const suffix = document.getElementById('fractionSuffixInput').value.trim();

    formulaHTML = `
      <div class="math-block" contenteditable="true">
        ${title ? `<span>${title}</span>` : ''}
        <div class="fraction">
          <span class="fraction-top">${num}</span>
          <span class="fraction-bottom">${den}</span>
        </div>
        ${suffix ? `<span>${suffix}</span>` : ''}
        ${getFormulaDeleteButtonHTML()}
      </div>
    `;
  }

  const canvas = document.getElementById('editorCanvas');
  if (savedSelectionRange && canvas.contains(savedSelectionRange.commonAncestorContainer)) {
    savedSelectionRange.deleteContents();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formulaHTML.trim();
    const fragment = document.createDocumentFragment();
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }
    savedSelectionRange.insertNode(fragment);
  } else {
    const fallbackTarget = canvas.querySelector('.card-note, .grid-col, .expand-content-inner') || canvas;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formulaHTML.trim();
    fallbackTarget.appendChild(tempDiv.firstElementChild);
  }
  closeFormulaModal();
}

function addFormulaToCard(btn) {
  const card = btn.closest('.card-note');
  const selection = window.getSelection();
  if (selection.rangeCount && card && card.contains(selection.anchorNode)) {
    savedSelectionRange = selection.getRangeAt(0).cloneRange();
  }
  openFormulaModalForCursor();
}

function removeFormulaFromCard(btn) {
  const card = btn.closest('.card-note, .grid-col');
  if (!card) return;
  const allEqs = card.querySelectorAll('.eq, .math-block');
  if (allEqs.length > 0) {
    allEqs[allEqs.length - 1].remove();
  }
}