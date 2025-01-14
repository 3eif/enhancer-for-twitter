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

    console.log('Drag and drop:', { draggedIndex, droppedIndex });

    if (draggedIndex > droppedIndex) {
        this.parentNode.insertBefore(draggedItem, this);
    } else {
        this.parentNode.insertBefore(draggedItem, this.nextSibling);
    }

    // Save menu order with logging
    const menuOrder = [...nav.querySelectorAll('a[role="link"]')]
        .map(item => item.querySelector('[dir="ltr"] span')?.textContent?.trim())
        .filter(Boolean)
        .filter(name => name.toLowerCase() !== 'more');

    console.log('Saving menu order:', menuOrder);

    chrome.storage.local.set({ menuOrder }, () => {
        console.log('Menu order saved to storage');
        // Verify storage
        chrome.storage.local.get(['menuOrder'], result => {
            console.log('Verified stored menu order:', result.menuOrder);
        });
    });
}

function setupDragAndDrop(menuItem) {
    menuItem.setAttribute('draggable', 'true');
    menuItem.addEventListener('dragstart', handleDragStart);
    menuItem.addEventListener('dragend', handleDragEnd);
    menuItem.addEventListener('dragover', handleDragOver);
    menuItem.addEventListener('drop', handleDrop);
}

window.setupDragAndDrop = setupDragAndDrop; 