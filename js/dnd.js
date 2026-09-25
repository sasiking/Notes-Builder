function attachDragHandlers(wrapper) {
  wrapper.setAttribute('draggable', 'false');

  const dragHandle = wrapper.querySelector('.drag-handle');
  if (dragHandle) {
    dragHandle.addEventListener('mousedown', () => {
      wrapper.setAttribute('draggable', 'true');
    });
    dragHandle.addEventListener('mouseup', () => {
      wrapper.setAttribute('draggable', 'false');
    });
  }

  wrapper.addEventListener('dragstart', (e) => {
    draggedElement = wrapper;
    wrapper.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  });

  wrapper.addEventListener('dragend', () => {
    wrapper.classList.remove('dragging');
    wrapper.setAttribute('draggable', 'false');
    document.querySelectorAll('.block-wrapper, .grid-col').forEach(el => el.classList.remove('drag-over'));
    draggedElement = null;
    updateTitleUI();
  });

  wrapper.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!draggedElement || draggedElement === wrapper) return;
    wrapper.classList.add('drag-over');
  });

  wrapper.addEventListener('dragleave', () => {
    wrapper.classList.remove('drag-over');
  });

  wrapper.addEventListener('drop', (e) => {
    e.preventDefault();
    wrapper.classList.remove('drag-over');
    if (!draggedElement || draggedElement === wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const isAfter = (e.clientY - rect.top) > (rect.height / 2);

    if (isAfter) {
      wrapper.parentNode.insertBefore(draggedElement, wrapper.nextSibling);
    } else {
      wrapper.parentNode.insertBefore(draggedElement, wrapper);
    }
  });
}

function initCanvasDropEvents(canvas) {
  canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
  });
  canvas.addEventListener('drop', (e) => {
    if (!draggedElement) return;
    if (e.target === canvas) {
      canvas.appendChild(draggedElement);
    }
  });
}

function insertBlock(type) {
  const canvas = document.getElementById('editorCanvas');
  if (!canvas) return;
  const html = getTemplateHTML(type);
  if (!html) return;

  const block = wrapInBlock(html);
  canvas.appendChild(block);
  block.scrollIntoView({ behavior: 'smooth', block: 'end' });
  makeEditable(block);
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
  updateTitleUI();
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
  if (block) block.remove(); 
  updateTitleUI();
}

function moveUp(btn) {
  const wrapper = btn.closest('.block-wrapper');
  if (wrapper && wrapper.previousElementSibling) wrapper.parentNode.insertBefore(wrapper, wrapper.previousElementSibling);
}

function moveDown(btn) {
  const wrapper = btn.closest('.block-wrapper');
  if (wrapper && wrapper.nextElementSibling) wrapper.parentNode.insertBefore(wrapper, wrapper.nextElementSibling);
}