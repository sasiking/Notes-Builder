/* ================= COORDINATE-BASED BIDIRECTIONAL DRAG & DROP ================= */
let dropIndicator = null;

function getOrCreateDropIndicator() {
  if (!dropIndicator) {
    dropIndicator = document.createElement('div');
    dropIndicator.className = 'canvas-drop-indicator';
    document.body.appendChild(dropIndicator);
  }
  return dropIndicator;
}

function removeDropIndicator() {
  if (dropIndicator && dropIndicator.parentNode) {
    dropIndicator.style.display = 'none';
  }
}

function updateDropIndicator(targetEl, placement) {
  const indicator = getOrCreateDropIndicator();
  const rect = targetEl.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  indicator.style.display = 'block';
  indicator.className = 'canvas-drop-indicator ' + placement;

  if (placement === 'before') {
    indicator.style.top = `${rect.top + scrollY - 2}px`;
    indicator.style.left = `${rect.left + scrollX}px`;
    indicator.style.width = `${rect.width}px`;
    indicator.style.height = `4px`;
  } else if (placement === 'after') {
    indicator.style.top = `${rect.bottom + scrollY - 2}px`;
    indicator.style.left = `${rect.left + scrollX}px`;
    indicator.style.width = `${rect.width}px`;
    indicator.style.height = `4px`;
  } else if (placement === 'left') {
    indicator.style.top = `${rect.top + scrollY}px`;
    indicator.style.left = `${rect.left + scrollX - 2}px`;
    indicator.style.width = `4px`;
    indicator.style.height = `${rect.height}px`;
  } else if (placement === 'right') {
    indicator.style.top = `${rect.top + scrollY}px`;
    indicator.style.left = `${rect.right + scrollX - 2}px`;
    indicator.style.width = `4px`;
    indicator.style.height = `${rect.height}px`;
  }
}

function attachDragHandlers(wrapper) {
  wrapper.setAttribute('draggable', 'false');

  const dragHandle = wrapper.querySelector('.drag-handle');
  if (dragHandle) {
    dragHandle.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      wrapper.setAttribute('draggable', 'true');
    });
    dragHandle.addEventListener('mouseup', () => {
      wrapper.setAttribute('draggable', 'false');
    });
  }

  wrapper.addEventListener('dragstart', (e) => {
    draggedElement = wrapper;
    wrapper.classList.add('dragging');
    document.body.classList.add('dragging-active');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
    e.stopPropagation();
  });

  wrapper.addEventListener('dragend', () => {
    if (draggedElement) {
      draggedElement.classList.remove('dragging');
      draggedElement.setAttribute('draggable', 'false');
    }
    document.body.classList.remove('dragging-active');
    removeDropIndicator();
    document.querySelectorAll('.expand-drop-target').forEach(el => el.classList.remove('expand-drop-target'));
    draggedElement = null;
    syncPopOutButtons();
    cleanupEmptyMultiRows();
    updateTitleUI();
  });
}

function syncPopOutButtons() {
  document.querySelectorAll('.block-wrapper').forEach(wrapper => {
    const popOutBtn = wrapper.querySelector('.btn-popout');
    if (!popOutBtn) return;
    if (wrapper.closest('.expand-content-inner')) {
      popOutBtn.style.display = 'inline-block';
    } else {
      popOutBtn.style.display = 'none';
    }
  });
}

function cleanupEmptyMultiRows() {
  document.querySelectorAll('.canvas-multi-row').forEach(row => {
    const children = Array.from(row.children).filter(c => c.classList.contains('block-wrapper'));
    if (children.length === 0) {
      row.remove();
    } else if (children.length === 1) {
      row.parentNode.insertBefore(children[0], row);
      row.remove();
    }
  });
}

/* ================= CENTRAL ROOT DROP COORDINATOR ================= */
function initCanvasDropEvents(canvas) {
  canvas.addEventListener('dragover', (e) => {
    if (!draggedElement) return;
    e.preventDefault();

    // Temporarily disable pointer events on draggedElement so elementFromPoint hits underlying elements
    draggedElement.style.pointerEvents = 'none';
    const elUnderPointer = document.elementFromPoint(e.clientX, e.clientY);
    draggedElement.style.pointerEvents = '';

    if (!elUnderPointer) return;

    // 1. Check if hovering over an expandable drawer
    const drawer = elUnderPointer.closest('.expand-content-inner');
    if (drawer && !drawer.contains(draggedElement)) {
      removeDropIndicator();
      drawer.classList.add('expand-drop-target');
      return;
    } else {
      document.querySelectorAll('.expand-drop-target').forEach(el => el.classList.remove('expand-drop-target'));
    }

    // 2. Check if hovering over another block wrapper
    const targetBlock = elUnderPointer.closest('.block-wrapper');
    if (targetBlock && targetBlock !== draggedElement && !draggedElement.contains(targetBlock)) {
      const rect = targetBlock.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      const widthRatio = relX / rect.width;
      const heightRatio = relY / rect.height;

      let placement = 'after';
      if (widthRatio < 0.22 && !targetBlock.classList.contains('title-section') && !targetBlock.closest('.expand-content-inner')) {
        placement = 'left';
      } else if (widthRatio > 0.78 && !targetBlock.classList.contains('title-section') && !targetBlock.closest('.expand-content-inner')) {
        placement = 'right';
      } else if (heightRatio < 0.5) {
        placement = 'before';
      } else {
        placement = 'after';
      }

      updateDropIndicator(targetBlock, placement);
      return;
    }

    removeDropIndicator();
  });

  canvas.addEventListener('dragleave', (e) => {
    if (!canvas.contains(e.relatedTarget)) {
      removeDropIndicator();
      document.querySelectorAll('.expand-drop-target').forEach(el => el.classList.remove('expand-drop-target'));
    }
  });

  canvas.addEventListener('drop', (e) => {
    if (!draggedElement) return;
    e.preventDefault();
    e.stopPropagation();

    removeDropIndicator();
    document.querySelectorAll('.expand-drop-target').forEach(el => el.classList.remove('expand-drop-target'));

    // Disable pointer events on dragged element to detect drop target directly underneath
    draggedElement.style.pointerEvents = 'none';
    const elUnderPointer = document.elementFromPoint(e.clientX, e.clientY);
    draggedElement.style.pointerEvents = '';

    if (!elUnderPointer) return;

    // CASE 1: Dropped into an expandable drawer
    const targetDrawer = elUnderPointer.closest('.expand-content-inner');
    if (targetDrawer && !targetDrawer.contains(draggedElement)) {
      targetDrawer.appendChild(draggedElement);
      draggedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      syncPopOutButtons();
      cleanupEmptyMultiRows();
      updateTitleUI();
      return;
    }

    // CASE 2: Dropped relative to another block wrapper
    const targetBlock = elUnderPointer.closest('.block-wrapper');
    if (targetBlock && targetBlock !== draggedElement && !draggedElement.contains(targetBlock)) {
      const rect = targetBlock.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      const widthRatio = relX / rect.width;
      const heightRatio = relY / rect.height;

      const targetRow = targetBlock.closest('.canvas-multi-row');
      const isTargetInDrawer = !!targetBlock.closest('.expand-content-inner');

      // Side-by-side multi-column placement
      if ((widthRatio < 0.22 || widthRatio > 0.78) && !isTargetInDrawer) {
        if (targetRow) {
          if (widthRatio < 0.22) {
            targetRow.insertBefore(draggedElement, targetBlock);
          } else {
            targetRow.insertBefore(draggedElement, targetBlock.nextSibling);
          }
        } else {
          const newRow = document.createElement('div');
          newRow.className = 'canvas-multi-row';
          targetBlock.parentNode.insertBefore(newRow, targetBlock);

          if (widthRatio < 0.22) {
            newRow.appendChild(draggedElement);
            newRow.appendChild(targetBlock);
          } else {
            newRow.appendChild(targetBlock);
            newRow.appendChild(draggedElement);
          }
        }
      } 
      // Vertical placement (before or after target)
      else {
        let insertParent = targetBlock.parentElement;
        let refNode = targetBlock;

        if (draggedElement.closest('.expand-content-inner') && !isTargetInDrawer) {
          insertParent = canvas;
          refNode = targetBlock.closest('#editorCanvas > .block-wrapper, #editorCanvas > .canvas-multi-row') || targetBlock;
        }

        if (heightRatio < 0.5) {
          insertParent.insertBefore(draggedElement, refNode);
        } else {
          insertParent.insertBefore(draggedElement, refNode.nextSibling);
        }
      }

      draggedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      syncPopOutButtons();
      cleanupEmptyMultiRows();
      updateTitleUI();
      return;
    }

    // CASE 3: Dropped only when cursor is in the empty space below all blocks
    const rect = canvas.getBoundingClientRect();
    const lastChild = canvas.lastElementChild;
    const isBelowAll = !lastChild || (e.clientY > lastChild.getBoundingClientRect().bottom);

    if (isBelowAll) {
      canvas.appendChild(draggedElement);
      draggedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      syncPopOutButtons();
      cleanupEmptyMultiRows();
      updateTitleUI();
    }
  });
}

/* ================= BASIC BLOCK UTILITIES ================= */
function insertBlock(type) {
  const canvas = document.getElementById('editorCanvas');
  if (!canvas) return;
  const html = getTemplateHTML(type);
  if (!html) return;

  const block = wrapInBlock(html);
  canvas.appendChild(block);
  block.scrollIntoView({ behavior: 'smooth', block: 'end' });
  makeEditable(block);
  syncPopOutButtons();
  updateTitleUI();
}

function executeMidInsert(menuBtn, templateType) {
  const currentBlock = menuBtn.closest('.block-wrapper');
  if (!currentBlock) return;
  const html = getTemplateHTML(templateType);
  if (!html) return;

  const menu = menuBtn.closest('.mid-insert-menu');
  if (menu) menu.classList.remove('active');

  const newBlock = wrapInBlock(html);
  currentBlock.parentNode.insertBefore(newBlock, currentBlock.nextSibling);
  newBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
  makeEditable(newBlock);
  syncPopOutButtons();
  updateTitleUI();
}

function executeMidInsertImage(menuBtn) {
  activeMidInsertTarget = menuBtn.closest('.block-wrapper');
  const menu = menuBtn.closest('.mid-insert-menu');
  if (menu) menu.classList.remove('active');

  let fileInput = document.getElementById('midInsertFileInput');
  if (!fileInput) {
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'midInsertFileInput';
    fileInput.accept = 'image/*,.svg';
    fileInput.style.display = 'none';
    fileInput.onchange = handleMidInsertFileSelect;
    document.body.appendChild(fileInput);
  }
  fileInput.value = '';
  fileInput.click();
}

function handleMidInsertFileSelect(event) {
  const file = event.target.files[0];
  if (!file || !activeMidInsertTarget) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const newBlock = wrapInBlock(getImageContainerHTML(e.target.result));
    activeMidInsertTarget.parentNode.insertBefore(newBlock, activeMidInsertTarget.nextSibling);
    newBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
    syncPopOutButtons();
    activeMidInsertTarget = null;
  };
  reader.readAsDataURL(file);
}

function toggleMidInsertMenu(btn) {
  const menu = btn.parentElement.querySelector('.mid-insert-menu');
  document.querySelectorAll('.mid-insert-menu').forEach(m => {
    if (m !== menu) m.classList.remove('active');
  });
  if (menu) menu.classList.toggle('active');
}

function deleteBlock(btn) { 
  const block = btn.closest('.block-wrapper');
  const row = block ? block.closest('.canvas-multi-row') : null;
  if (block) block.remove(); 
  if (row) cleanupEmptyMultiRows();
  updateTitleUI();
}

function moveUp(btn) {
  const wrapper = btn.closest('.block-wrapper');
  if (wrapper && wrapper.previousElementSibling) {
    wrapper.parentNode.insertBefore(wrapper, wrapper.previousElementSibling);
    updateTitleUI();
  }
}

function moveDown(btn) {
  const wrapper = btn.closest('.block-wrapper');
  if (wrapper && wrapper.nextElementSibling) {
    wrapper.nextElementSibling.after(wrapper);
    updateTitleUI();
  }
}