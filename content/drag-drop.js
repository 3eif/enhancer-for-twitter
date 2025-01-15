let draggedItem = null;
let ghostElement = null;

function createGhostElement(element) {
    const ghost = element.cloneNode(true);
    ghost.style.cssText = `
        position: absolute;
        pointer-events: none;
        opacity: 0.5;
        transform: translateY(-50%);
        width: ${element.offsetWidth}px;
        z-index: 1000;
    `;
    ghost.id = 'dragGhost';
    return ghost;
}

function handleDragStart(e) {
    draggedItem = this;
    this.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';

    // Create and add ghost element
    ghostElement = createGhostElement(this);
    document.body.appendChild(ghostElement);

    // Hide the default drag image
    const dragImg = new Image();
    dragImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(dragImg, 0, 0);
}

function handleDrag(e) {
    if (ghostElement && e.clientY !== 0) {  // e.clientY === 0 means invalid drag position
        ghostElement.style.left = e.clientX + 'px';
        ghostElement.style.top = e.clientY + 'px';
    }
}

function handleDragEnd(e) {
    this.style.opacity = '1';
    draggedItem = null;

    // Remove ghost element
    if (ghostElement) {
        ghostElement.remove();
        ghostElement = null;
    }

    saveMenuOrder();
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const nav = document.querySelector('nav[role="navigation"]');
    const items = [...nav.querySelectorAll('a[role="link"]')];

    // Skip if dragging over the More button
    const isMoreButton = e.target.closest('[data-testid="AppTabBar_More_Menu"]');
    if (isMoreButton) return;

    // Find the closest menu item to the cursor
    const closestItem = items.reduce((closest, item) => {
        // Skip the More button in calculations
        if (item.getAttribute('data-testid') === 'AppTabBar_More_Menu') return closest;

        const box = item.getBoundingClientRect();
        const distance = Math.abs(e.clientY - (box.top + box.height / 2));

        if (closest.distance === null || distance < closest.distance) {
            return {
                distance: distance,
                element: item,
                box: box,
                isBelow: e.clientY > (box.top + box.height / 2)
            };
        }
        return closest;
    }, { distance: null, element: null, box: null, isBelow: false });

    // Remove existing preview line
    const existingPreview = document.querySelector('.drop-preview');
    if (existingPreview) existingPreview.remove();

    if (closestItem.element && closestItem.element !== draggedItem) {
        // Create preview line
        const preview = document.createElement('div');
        preview.className = 'drop-preview';
        preview.style.cssText = `
            position: fixed;
            height: 3px;
            background-color: rgb(29, 155, 240);
            left: ${closestItem.box.left}px;
            width: ${closestItem.box.width}px;
            z-index: 999;
            transition: top 0.1s ease;
            border-radius: 1.5px;
        `;

        // Position the line above or below the closest item
        preview.style.top = closestItem.isBelow ?
            `${closestItem.box.bottom}px` :
            `${closestItem.box.top}px`;

        document.body.appendChild(preview);
    }
}

function handleDrop(e) {
    if (!draggedItem || draggedItem === this) return;
    e.preventDefault();

    // Remove preview line
    const preview = document.querySelector('.drop-preview');
    if (preview) preview.remove();

    const nav = document.querySelector('nav[role="navigation"]');
    const items = [...nav.querySelectorAll('a[role="link"]')];
    const draggedIndex = items.indexOf(draggedItem);
    const droppedIndex = items.indexOf(this);

    if (draggedIndex > droppedIndex) {
        this.parentNode.insertBefore(draggedItem, this);
    } else {
        this.parentNode.insertBefore(draggedItem, this.nextSibling);
    }
}

function setupDragAndDrop(menuItem) {
    menuItem.setAttribute('draggable', 'true');
    menuItem.addEventListener('dragstart', handleDragStart);
    menuItem.addEventListener('drag', handleDrag);
    menuItem.addEventListener('dragend', handleDragEnd);
    menuItem.addEventListener('dragover', handleDragOver);
    menuItem.addEventListener('drop', handleDrop);
}

window.setupDragAndDrop = setupDragAndDrop; 