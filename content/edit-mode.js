let editMode = false;

function setEditMode(value) {
    editMode = value;
}

function getEditMode() {
    return editMode;
}

function handleHover(e) {
    if (!editMode) return;
    e.preventDefault();
    const container = e.currentTarget.querySelector('.strike-container');
    if (container) {
        updateStrikeLine(e.currentTarget);
        container.style.display = 'block';
    }
}

function handleHoverOut(e) {
    if (!editMode) return;
    e.preventDefault();
    if (e.currentTarget.style.display !== 'none') {
        const container = e.currentTarget.querySelector('.strike-container');
        if (container) {
            container.style.display = 'none';
        }
    }
}

function handleClick(e) {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();

    const menuItem = e.currentTarget.closest('div[role="link"]') || e.currentTarget;
    menuItem.style.display = 'none';

    const itemText = menuItem.querySelector('[dir="ltr"] span')?.textContent?.trim().toLowerCase();
    if (itemText) {
        chrome.storage.local.get(['hiddenItems'], function (result) {
            let hiddenItems = result.hiddenItems || [];
            hiddenItems = [...new Set([...hiddenItems, itemText])];
            chrome.storage.local.set({ hiddenItems });
        });
    }
}

function updateStrikeLine(item) {
    const container = item.querySelector('.strike-container');
    if (container) {
        const contentContainer = item.querySelector('div[dir="ltr"]') || item;
        const strike = container.querySelector('.strike-line');
        if (strike) {
            strike.style.width = `${contentContainer.offsetWidth}px`;
            strike.style.left = `${contentContainer.offsetLeft}px`;
        }
    }
}

function enableEditModeForItem(item) {
    item.addEventListener('mouseenter', handleHover);
    item.addEventListener('mouseleave', handleHoverOut);
    item.addEventListener('click', handleClick);
    item.style.cursor = 'pointer';

    const menuItemContainer = item.closest('div[role="link"]') || item;
    const randomDelay = Math.random() * -0.6;
    menuItemContainer.style.animation = 'jiggle 0.6s infinite';
    menuItemContainer.style.animationDelay = `${randomDelay}s`;
}

function enableEditMode() {
    const menuItems = document.querySelectorAll('nav[role="navigation"] a');
    const nav = document.querySelector('nav[role="navigation"]');

    // Add drag and drop functionality
    menuItems.forEach(item => {
        setupDragAndDrop(item);

        // Add visual drag handle
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        dragHandle.style.cssText = `
            display: none;
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            width: 16px;
            height: 16px;
            opacity: 0.5;
            cursor: grab;
        `;
        dragHandle.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M8 4a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm8 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM8 13.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm8 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM8 23a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm8 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
            </svg>
        `;
        item.style.position = 'relative';
        item.appendChild(dragHandle);

        // Show drag handle on hover
        item.addEventListener('mouseenter', () => {
            if (editMode) dragHandle.style.display = 'block';
        });
        item.addEventListener('mouseleave', () => {
            dragHandle.style.display = 'none';
        });
    });

    // Add the "Add Items" button at the top of the menu if it doesn't exist
    if (!document.querySelector('#addMenuItemsButton')) {
        const nav = document.querySelector('nav[role="navigation"]');
        const addButton = document.createElement('a');
        addButton.id = 'addMenuItemsButton';
        addButton.role = 'link';
        addButton.className = 'css-175oi2r r-sdzlij r-1phboty r-rs99b7 r-lrvibr r-19yznuf r-64el8z r-1fkl15p r-o7ynqc r-6416eg r-1ny4l3l r-1loqt21';
        addButton.style.cssText = `
            background-color: rgb(29, 155, 240);
            border-color: rgba(0, 0, 0, 0);
            margin: 8px;
            cursor: pointer;
        `;

        const innerDiv = document.createElement('div');
        innerDiv.dir = 'ltr';
        innerDiv.className = 'css-146c3p1 r-bcqeeo r-qvutc0 r-37j5jr r-q4m81j r-a023e6 r-rjixqe r-b88u0q r-1awozwy r-6koalj r-18u37iz r-16y2uox r-1777fci';
        innerDiv.style.color = 'rgb(255, 255, 255)';

        const span = document.createElement('span');
        span.className = 'css-1jxf684 r-dnmrzs r-1udh08x r-1udbk01 r-3s2u2q r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3 r-a023e6 r-rjixqe';

        const innerSpan = document.createElement('span');
        innerSpan.className = 'css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3';
        innerSpan.textContent = 'Add Menu Items';

        span.appendChild(innerSpan);
        innerDiv.appendChild(span);
        addButton.appendChild(innerDiv);

        addButton.addEventListener('click', showAddItemsDialog);
        nav.insertBefore(addButton, nav.firstChild);
    }

    menuItems.forEach(item => {
        enableEditModeForItem(item);

        // Add a container for the strikethrough effect
        if (!item.querySelector('.strike-container')) {
            const contentContainer = item.querySelector('div[dir="ltr"]') || item;

            const container = document.createElement('div');
            container.className = 'strike-container';
            container.style.cssText = `
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                pointer-events: none;
                display: none;
            `;

            const strike = document.createElement('div');
            strike.className = 'strike-line';
            strike.style.cssText = `
                position: absolute;
                width: ${contentContainer.offsetWidth}px;
                height: 3px;
                background-color: white;
                top: 50%;
                left: ${contentContainer.offsetLeft}px;
                transform: translateY(-50%);
            `;

            container.appendChild(strike);
            item.style.position = 'relative';
            item.appendChild(container);
        }
    });

    // Add jiggle keyframes if not already added
    if (!document.querySelector('#jiggleStyle')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'jiggleStyle';
        styleSheet.textContent = `
            @keyframes jiggle {
                0% { transform: rotate(0deg); }
                25% { transform: rotate(-0.7deg); }
                50% { transform: rotate(0deg); }
                75% { transform: rotate(0.7deg); }
                100% { transform: rotate(0deg); }
            }
        `;
        document.head.appendChild(styleSheet);
    }

    // Add the Done button
    const postButton = document.querySelector('[data-testid="SideNav_NewTweet_Button"]');
    addDoneButton(editMode, postButton);
}

function disableEditMode() {
    const menuItems = document.querySelectorAll('nav[role="navigation"] a');

    menuItems.forEach(item => {
        // Remove drag and drop functionality
        item.removeAttribute('draggable');
        item.removeEventListener('dragstart', handleDragStart);
        item.removeEventListener('dragend', handleDragEnd);
        item.removeEventListener('dragover', handleDragOver);
        item.removeEventListener('drop', handleDrop);

        // Remove drag handle
        const dragHandle = item.querySelector('.drag-handle');
        if (dragHandle) dragHandle.remove();

        // Remove event listeners
        item.removeEventListener('mouseenter', handleHover);
        item.removeEventListener('mouseleave', handleHoverOut);
        item.removeEventListener('click', handleClick);
        item.style.cursor = '';

        // Remove jiggle animation
        const menuItemContainer = item.closest('div[role="link"]') || item;
        menuItemContainer.style.animation = 'none';
        menuItemContainer.style.animationDelay = '';
    });

    // Remove the add button when edit mode is disabled
    const addButton = document.querySelector('#addMenuItemsButton');
    if (addButton) {
        addButton.remove();
    }

    // Show the Post button again if it was hidden
    const postButton = document.querySelector('[data-testid="SideNav_NewTweet_Button"]');
    if (postButton) {
        postButton.style.display = '';
    }

    // Remove the Done button if it exists
    const doneButton = document.querySelector('#menuDoneButton');
    if (doneButton) {
        doneButton.remove();
    }
}

window.setEditMode = setEditMode;
window.getEditMode = getEditMode;
window.enableEditMode = enableEditMode;
window.disableEditMode = disableEditMode;
window.enableEditModeForItem = enableEditModeForItem; 