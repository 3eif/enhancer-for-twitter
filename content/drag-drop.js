let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
    this.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    this.style.opacity = '1';
    draggedItem = null;
    saveMenuOrder();
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    if (!draggedItem || draggedItem === this) return;
    e.preventDefault();

    const nav = document.querySelector('nav[role="navigation"]');
    const items = [...nav.querySelectorAll('a[role="link"]')];
    const draggedIndex = items.indexOf(draggedItem);
    const droppedIndex = items.indexOf(this);

    if (draggedIndex > droppedIndex) {
        this.parentNode.insertBefore(draggedItem, this);
    } else {
        this.parentNode.insertBefore(draggedItem, this.nextSibling);
    }

    saveMenuOrder();
}

function setupDragAndDrop(menuItem) {
    menuItem.setAttribute('draggable', 'true');
    menuItem.addEventListener('dragstart', handleDragStart);
    menuItem.addEventListener('dragend', handleDragEnd);
    menuItem.addEventListener('dragover', handleDragOver);
    menuItem.addEventListener('drop', handleDrop);
}

window.setupDragAndDrop = setupDragAndDrop; 