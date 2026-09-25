function getActiveTableFromBtn(btn) {
  if (!btn) return null;
  const parentWrapper = btn.closest('.table-block-wrapper') || btn.closest('.block-wrapper') || btn.parentElement;
  if (parentWrapper) {
    const tbl = parentWrapper.querySelector('table');
    if (tbl) return tbl;
  }
  return btn.parentElement?.nextElementSibling?.tagName === 'TABLE' 
    ? btn.parentElement.nextElementSibling 
    : document.querySelector('#editorCanvas table');
}

function addTableRow(btn) {
  const table = getActiveTableFromBtn(btn);
  if (!table) return;

  const headerRow = table.rows[0];
  const colCount = headerRow ? headerRow.cells.length : 3;
  const sel = window.getSelection();
  let targetRow = null;

  if (sel.rangeCount > 0 && table.contains(sel.anchorNode)) {
    targetRow = sel.anchorNode.nodeType === 1 ? sel.anchorNode.closest('tr') : sel.anchorNode.parentElement?.closest('tr');
  }

  const tbody = table.querySelector('tbody') || table;
  const newRow = document.createElement('tr');
  for (let i = 0; i < colCount; i++) {
    const td = document.createElement('td');
    td.innerHTML = i === 0 ? '<strong>Dimension</strong>' : 'Details...';
    td.setAttribute('contenteditable', 'true');
    newRow.appendChild(td);
  }

  if (targetRow && targetRow !== headerRow && targetRow.parentElement) {
    targetRow.insertAdjacentElement('afterend', newRow);
  } else {
    tbody.appendChild(newRow);
  }

  makeEditable(newRow);
  const firstCell = newRow.cells[0];
  if (firstCell) {
    const range = document.createRange();
    range.selectNodeContents(firstCell);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    newRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function deleteTableRow(btn) {
  const table = getActiveTableFromBtn(btn);
  if (!table) return;

  const dataRows = Array.from(table.rows).filter(r => !r.querySelector('th') && r !== table.rows[0]);
  if (dataRows.length <= 1) {
    alert('At least one data row must be maintained in the table.');
    return;
  }

  const sel = window.getSelection();
  let targetRow = null;

  if (sel.rangeCount > 0 && table.contains(sel.anchorNode)) {
    targetRow = sel.anchorNode.nodeType === 1 ? sel.anchorNode.closest('tr') : sel.anchorNode.parentElement?.closest('tr');
  }

  if (targetRow && !targetRow.querySelector('th') && targetRow !== table.rows[0]) {
    targetRow.remove();
  } else {
    dataRows[dataRows.length - 1].remove();
  }
}

function addTableColumn(btn) {
  const table = getActiveTableFromBtn(btn);
  if (!table) return;

  let targetColIdx = -1;
  const sel = window.getSelection();
  if (sel.rangeCount > 0 && table.contains(sel.anchorNode)) {
    const activeCell = sel.anchorNode.nodeType === 1 
      ? sel.anchorNode.closest('td, th') 
      : sel.anchorNode.parentElement?.closest('td, th');
    if (activeCell) {
      targetColIdx = activeCell.cellIndex;
    }
  }

  Array.from(table.rows).forEach((row, rIdx) => {
    const isHeader = (rIdx === 0 && row.parentElement?.tagName !== 'TBODY') || row.querySelector('th');
    const cell = document.createElement(isHeader ? 'th' : 'td');
    cell.innerHTML = isHeader ? `Category ${row.cells.length + 1}` : 'Details...';
    cell.setAttribute('contenteditable', 'true');

    if (targetColIdx >= 0 && targetColIdx < row.cells.length) {
      row.cells[targetColIdx].insertAdjacentElement('afterend', cell);
    } else {
      row.appendChild(cell);
    }
  });

  makeEditable(table);
}

function deleteTableColumn(btn) {
  const table = getActiveTableFromBtn(btn);
  if (!table) return;

  const firstRow = table.rows[0];
  if (!firstRow || firstRow.cells.length <= 2) {
    alert('A comparison table requires at least 2 columns.');
    return;
  }

  let targetColIdx = -1;
  const sel = window.getSelection();

  if (sel.rangeCount > 0 && table.contains(sel.anchorNode)) {
    const activeCell = sel.anchorNode.nodeType === 1 
      ? sel.anchorNode.closest('td, th') 
      : sel.anchorNode.parentElement?.closest('td, th');

    if (activeCell) {
      targetColIdx = activeCell.cellIndex;
    }
  }

  if (targetColIdx < 0) {
    targetColIdx = firstRow.cells.length - 1;
  }

  Array.from(table.rows).forEach(row => {
    if (row.cells.length > targetColIdx) {
      row.deleteCell(targetColIdx);
    } else if (row.cells.length > 0) {
      row.deleteCell(row.cells.length - 1);
    }
  });
}

function deleteWholeTable(btn) {
  if (!confirm('Are you sure you want to delete this entire table?')) return;

  // Check if the table is wrapped in a .table-block-wrapper
  const tableWrapper = btn.closest('.table-block-wrapper');
  if (tableWrapper) {
    // If the table is inside an expand box or mains section, delete only the table wrapper
    if (tableWrapper.closest('.expand-content-inner, .mains-framework')) {
      tableWrapper.remove();
      return;
    }

    // If it is a top-level canvas block, remove the parent block wrapper
    const blockWrapper = tableWrapper.closest('.block-wrapper');
    if (blockWrapper && !blockWrapper.querySelector('.card-note, .mains-section, .expand-block-wrapper')) {
      blockWrapper.remove();
      updateTitleUI();
      return;
    }

    tableWrapper.remove();
    return;
  }

  // Fallback for unwrapped tables
  const table = getActiveTableFromBtn(btn);
  if (table) {
    const parent = table.parentElement;
    table.remove();
    btn.closest('.table-toolbar')?.remove();
    if (parent && parent.children.length === 0) parent.remove();
  }
}