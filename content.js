let editMode = false;


// Add this function at the top of your file
function debugStorage() {
    // Only log in development mode
    if (process.env.NODE_ENV === 'development') {
        chrome.storage.local.get(null, function (items) {
            console.log('Current storage state:', items);
        });
    }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggleEditMode') {
        editMode = message.editMode;
        if (editMode) {
            enableEditMode();
        } else {
            disableEditMode();
        }
    } else if (message.action === 'resetMenuItems') {
        resetMenuItems();
    } else if (message.action === 'addMenuItem') {
        // Get existing custom items first
        chrome.storage.local.get(['customItems'], function (result) {
            const customItems = result.customItems || [];

            // Check if item already exists
            const exists = customItems.some(item =>
                item.url === message.item.url ||
                item.name === message.item.name
            );

            if (!exists) {
                // Add new item to array
                customItems.push(message.item);

                // Save updated array
                chrome.storage.local.set({ customItems }, function () {
                    // Create menu item only after storage is updated
                    const menuItem = createMenuItem(message.item.name, message.item.url, message.item.icon);
                    if (editMode) {
                        enableEditModeForItem(menuItem);
                    }
                    // Save the new menu order
                    saveMenuOrder();
                });
            }
        });
    }
});

function enableEditMode() {
    const menuItems = document.querySelectorAll('nav[role="navigation"] a');
    const nav = document.querySelector('nav[role="navigation"]');

    // Add drag and drop functionality
    menuItems.forEach(item => {
        item.setAttribute('draggable', 'true');
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);

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
        addButton.className = 'css-175oi2r r-sdzlij r-1phboty r-rs99b7 r-lrvibr r-2yi16 r-1qi8awa r-3pj75a r-o7ynqc r-6416eg r-1ny4l3l r-1loqt21';
        addButton.style.backgroundColor = 'rgba(0, 0, 0, 0)';
        addButton.style.borderColor = 'rgb(83, 100, 113)';
        addButton.style.margin = '8px';

        const innerDiv = document.createElement('div');
        innerDiv.dir = 'ltr';
        innerDiv.className = 'css-146c3p1 r-bcqeeo r-qvutc0 r-37j5jr r-q4m81j r-a023e6 r-rjixqe r-b88u0q r-1awozwy r-6koalj r-18u37iz r-16y2uox r-1777fci';
        innerDiv.style.color = 'rgb(239, 243, 244)';

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
        // Add hover effect
        item.addEventListener('mouseenter', handleHover);
        item.addEventListener('mouseleave', handleHoverOut);
        item.addEventListener('click', handleClick);
        item.style.cursor = 'pointer';

        // Add jiggle animation with random delay for each item
        const menuItemContainer = item.closest('div[role="link"]') || item;
        const randomDelay = Math.random() * -0.6; // Random delay between -0.6s and 0s
        menuItemContainer.style.animation = 'jiggle 0.6s infinite';
        menuItemContainer.style.animationDelay = `${randomDelay}s`;

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
    addDoneButton();
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

    // Remove the Done button
    const doneButton = document.querySelector('#menuDoneButton');
    if (doneButton) {
        doneButton.remove();
    }
}

// Add this new function to update strike line dimensions when needed
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

function handleHover(e) {
    if (!editMode) return;
    e.preventDefault();
    const container = e.currentTarget.querySelector('.strike-container');
    if (container) {
        updateStrikeLine(e.currentTarget); // Update dimensions before showing
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

    // Save the hidden state with proper case handling
    const itemText = menuItem.querySelector('[dir="ltr"] span')?.textContent?.trim().toLowerCase();
    if (itemText) {
        chrome.storage.local.get(['hiddenItems'], function (result) {
            let hiddenItems = result.hiddenItems || [];
            // Remove any duplicates and add the new item
            hiddenItems = [...new Set([...hiddenItems, itemText])];
            chrome.storage.local.set({ hiddenItems }, debugStorage);
        });
    }
}

const ALL_MENU_ITEMS = [
    { name: 'Home', url: '/home', icon: 'M21.591 7.146L12.52 1.157c-.316-.21-.724-.21-1.04 0l-9.071 5.99c-.26.173-.409.456-.409.757v13.183c0 .502.418.913.929.913H9.14c.51 0 .929-.41.929-.913v-7.075h3.909v7.075c0 .502.417.913.928.913h6.165c.511 0 .929-.41.929-.913V7.904c0-.301-.158-.584-.408-.758z' },
    { name: 'Explore', url: '/explore', icon: 'M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z' },
    { name: 'Notifications', url: '/notifications', icon: 'M19.993 9.042C19.48 5.017 16.054 2 11.996 2s-7.49 3.021-7.999 7.051L2.866 18H7.1c.463 2.282 2.481 4 4.9 4s4.437-1.718 4.9-4h4.236l-1.143-8.958zM12 20c-1.306 0-2.417-.835-2.829-2h5.658c-.412 1.165-1.523 2-2.829 2zm-6.866-4l.847-6.698C6.364 6.272 8.941 4 11.996 4s5.627 2.268 6.013 5.295L18.864 16H5.134z' },
    { name: 'Messages', url: '/messages', icon: 'M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5v13c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5v-13zm2.5-.5c-.276 0-.5.224-.5.5v2.764l8 3.638 8-3.636V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 5.463l-8 3.636-8-3.638V18.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5v-8.037z' },
    { name: 'Grok', url: '/i/grok', icon: 'M2.205 7.423L11.745 21h4.241L6.446 7.423H2.204zm4.237 7.541L2.2 21h4.243l2.12-3.017-2.121-3.02zM16.957 0L9.624 10.435l2.122 3.02L21.2 0h-4.243zm.767 6.456V21H21.2V1.51l-3.476 4.946z' },
    { name: 'Premium', url: '/i/premium', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
    { name: 'Lists', url: '/lists', icon: 'M3 4.5C3 3.12 4.12 2 5.5 2h13C19.88 2 21 3.12 21 4.5v15c0 1.38-1.12 2.5-2.5 2.5h-13C4.12 22 3 20.88 3 19.5v-15zM5.5 4c-.28 0-.5.22-.5.5v15c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5v-15c0-.28-.22-.5-.5-.5h-13zM16 10H8V8h8v2zm-8 2h8v2H8v-2z' },
    { name: 'Bookmarks', url: '/i/bookmarks', icon: 'M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z' },
    { name: 'Jobs', url: '/jobs', icon: 'M19.5 6H17V4.5C17 3.12 15.88 2 14.5 2h-5C8.12 2 7 3.12 7 4.5V6H4.5C3.12 6 2 7.12 2 8.5v10C2 19.88 3.12 21 4.5 21h15c1.38 0 2.5-1.12 2.5-2.5v-10C22 7.12 20.88 6 19.5 6zM9 4.5c0-.28.23-.5.5-.5h5c.28 0 .5.22.5.5V6H9V4.5zm11 14c0 .28-.22.5-.5.5h-15c-.27 0-.5-.22-.5-.5v-3.04c.59.35 1.27.54 2 .54h5v1h2v-1h5c.73 0 1.41-.19 2-.54v3.04zm0-6.49c0 1.1-.9 1.99-2 1.99h-5v-1h-2v1H6c-1.1 0-2-.9-2-2V8.5c0-.28.23-.5.5-.5h15c.28 0 .5.22.5.5v3.51z' },
    { name: 'Communities', url: '/communities', icon: 'M7.501 19.917L7.471 21H.472l.029-1.027c.184-6.618 3.736-8.977 7-8.977.963 0 1.95.212 2.87.672-.444.478-.851 1.03-1.212 1.656-.507-.204-1.054-.329-1.658-.329-2.767 0-4.57 2.223-4.938 6.004H7.56c-.023.302-.05.599-.059.917zm15.998.056L23.528 21H9.472l.029-1.027c.184-6.618 3.736-8.977 7-8.977s6.816 2.358 7 8.977zM21.437 19c-.367-3.781-2.17-6.004-4.938-6.004s-4.57 2.223-4.938 6.004h9.875zm-4.938-9c-.799 0-1.527-.279-2.116-.73-.836-.64-1.384-1.638-1.384-2.77 0-1.93 1.567-3.5 3.5-3.5s3.5 1.57 3.5 3.5c0 1.132-.548 2.13-1.384 2.77-.589.451-1.317.73-2.116.73zm-1.5-3.5c0 .827.673 1.5 1.5 1.5s1.5-.673 1.5-1.5-.673-1.5-1.5-1.5-1.5.673-1.5 1.5zM7.5 3C9.433 3 11 4.57 11 6.5S9.433 10 7.5 10 4 8.43 4 6.5 5.567 3 7.5 3zm0 2C6.673 5 6 5.673 6 6.5S6.673 8 7.5 8 9 7.327 9 6.5 8.327 5 7.5 5z' },
    { name: 'Verified Orgs', url: '/i/verified-orgs-signup', icon: 'M7.323 2h11.443l-3 5h6.648L6.586 22.83 7.847 14H2.523l4.8-12zm1.354 2l-3.2 8h4.676l-.739 5.17L17.586 9h-5.352l3-5H8.677z' },
    { name: 'Community Notes', url: '/i/communitynotes', icon: 'M19 16h2.6c-.23-1.2-.66-2.12-1.2-2.77-.67-.8-1.55-1.23-2.65-1.23-.51 0-.96.09-1.36.26l-.78-1.84c.67-.28 1.38-.42 2.14-.42 1.7 0 3.14.7 4.19 1.95 1.03 1.24 1.63 2.95 1.81 4.96l.09 1.09H19v-2zM5 16H2.4c.23-1.2.66-2.12 1.2-2.77.67-.8 1.55-1.23 2.65-1.23.51 0 .96.09 1.36.26l.78-1.84c-.67-.28-1.38-.42-2.14-.42-1.7 0-3.14.7-4.19 1.95C1.032 13.19.433 14.9.254 16.91L.157 18H5v-2zM15.5 6c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3zm2 0c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1zm-12-3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 2c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm6.5 6.5c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-2c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0 3c1.78 0 3.29.75 4.37 2.1 1.07 1.32 1.69 3.15 1.88 5.31l.09 1.09H5.66l.09-1.09c.19-2.16.81-3.99 1.88-5.31 1.08-1.35 2.59-2.1 4.37-2.1zm-2.82 3.35c-.59.74-1.05 1.79-1.29 3.15h8.22c-.24-1.36-.7-2.41-1.29-3.15-.72-.88-1.66-1.35-2.82-1.35s-2.1.47-2.82 1.35z' },
    { name: 'Profile', url: '/profile', icon: 'M5.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C15.318 13.65 13.838 13 12 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46zM12 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM8 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4z' },
    { name: 'Monetization', url: '/i/monetization', icon: 'M23 3v14h-2V5H5V3h18zM10 17c1.1 0 2-1.34 2-3s-.9-3-2-3-2 1.34-2 3 .9 3 2 3zM1 7h18v14H1V7zm16 10c-1.1 0-2 .9-2 2h2v-2zm-2-8c0 1.1.9 2 2 2V9h-2zM3 11c1.1 0 2-.9 2-2H3v2zm0 4c2.21 0 4 1.79 4 4h6c0-2.21 1.79-4 4-4v-2c-2.21 0-4-1.79-4-4H7c0 2.21-1.79 4-4 4v2zm0 4h2c0-1.1-.9-2-2-2v2z' },
    { name: 'Ads', url: 'https://ads.x.com/?ref=gl-tw-tw-twitter-ads-rweb', icon: 'M1.996 5.5c0-1.38 1.119-2.5 2.5-2.5h15c1.38 0 2.5 1.12 2.5 2.5v13c0 1.38-1.12 2.5-2.5 2.5h-15c-1.381 0-2.5-1.12-2.5-2.5v-13zm2.5-.5c-.277 0-.5.22-.5.5v13c0 .28.223.5.5.5h15c.276 0 .5-.22.5-.5v-13c0-.28-.224-.5-.5-.5h-15zm8.085 5H8.996V8h7v7h-2v-3.59l-5.293 5.3-1.415-1.42L12.581 10z' },
    { name: 'Settings', url: '/settings', icon: 'M10.54 1.75h2.92l1.57 2.36c.11.17.32.25.53.21l2.53-.59 2.17 2.17-.58 2.54c-.05.2.04.41.21.53l2.36 1.57v2.92l-2.36 1.57c-.17.12-.26.33-.21.53l.58 2.54-2.17 2.17-2.53-.59c-.21-.04-.42.04-.53.21l-1.57 2.36h-2.92l-1.58-2.36c-.11-.17-.32-.25-.52-.21l-2.54.59-2.17-2.17.58-2.54c.05-.2-.03-.41-.21-.53l-2.35-1.57v-2.92L4.1 8.97c.18-.12.26-.33.21-.53L3.73 5.9 5.9 3.73l2.54.59c.2.04.41-.04.52-.21l1.58-2.36zm1.07 2l-.98 1.47C10.05 6.08 9 6.5 7.99 6.27l-1.46-.34-.6.6.33 1.46c.24 1.01-.18 2.07-1.05 2.64l-1.46.98v.78l1.46.98c.87.57 1.29 1.63 1.05 2.64l-.33 1.46.6.6 1.46-.34c1.01-.23 2.06.19 2.64 1.05l.98 1.47h.78l.97-1.47c.58-.86 1.63-1.28 2.65-1.05l1.45.34.61-.6-.34-1.46c-.23-1.01.18-2.07 1.05-2.64l1.47-.98v-.78l-1.47-.98c-.87-.57-1.28-1.63-1.05-2.64l.34-1.46-.61-.6-1.45.34c-1.02.23-2.07-.19-2.65-1.05l-.97-1.47h-.78zM12 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5c.82 0 1.5-.67 1.5-1.5s-.68-1.5-1.5-1.5zM8.5 12c0-1.93 1.56-3.5 3.5-3.5 1.93 0 3.5 1.57 3.5 3.5s-1.57 3.5-3.5 3.5c-1.94 0-3.5-1.57-3.5-3.5z' },
    { name: 'Create your Space', url: '/i/spaces/start', icon: 'M12 22.25c-4.99 0-9.18-3.393-10.39-7.994l1.93-.512c.99 3.746 4.4 6.506 8.46 6.506s7.47-2.76 8.46-6.506l1.93.512c-1.21 4.601-5.4 7.994-10.39 7.994zM5 11.5c0 3.866 3.13 7 7 7s7-3.134 7-7V8.75c0-3.866-3.13-7-7-7s-7 3.134-7 7v2.75zm12-2.75v2.75c0 2.761-2.24 5-5 5s-5-2.239-5-5V8.75c0-2.761 2.24-5 5-5s5 2.239 5 5zM11.25 8v4.25c0 .414.34.75.75.75s.75-.336.75-.75V8c0-.414-.34-.75-.75-.75s-.75.336-.75.75zm-3 1v2.25c0 .414.34.75.75.75s.75-.336.75-.75V9c0-.414-.34-.75-.75-.75s-.75.336-.75.75zm7.5 0c0-.414-.34-.75-.75-.75s-.75.336-.75.75v2.25c0 .414.34.75.75.75s.75-.336.75-.75V9z' }
];

// Add this function to get hidden items from storage
async function getHiddenItems() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['hiddenItems'], function (result) {
            resolve(result.hiddenItems || []);
        });
    });
}

// Add a variable to store detected default items
let defaultVisibleItems = [];

function detectDefaultItems() {
    const nav = document.querySelector('nav[role="navigation"]');
    if (!nav) return [];

    // Get all menu items that are initially visible
    const items = [...nav.querySelectorAll('a[role="link"]')].map(item => {
        const text = item.querySelector('[dir="ltr"] span')?.textContent?.trim();
        const url = item.getAttribute('href');
        const isVisible = window.getComputedStyle(item.closest('div[role="link"]') || item).display !== 'none';
        return { text, url, isVisible };
    }).filter(item => item.text && item.isVisible);

    return items.map(item => item.text);
}

async function showAddItemsDialog() {
    // Remove existing dialog if present
    const existingDialog = document.querySelector('#addItemsDialog');
    if (existingDialog) existingDialog.remove();

    // Get hidden items
    const hiddenItems = await getHiddenItems();

    // Get currently visible items in the main menu
    const nav = document.querySelector('nav[role="navigation"]');
    const currentItems = [...nav.querySelectorAll('a[role="link"]')].map(item => ({
        text: item.querySelector('[dir="ltr"] span')?.textContent?.trim(),
        url: item.getAttribute('href'),
        isVisible: window.getComputedStyle(item.closest('div[role="link"]') || item).display !== 'none'
    })).filter(item => item.text);

    // Create dialog
    const dialog = document.createElement('div');
    dialog.id = 'addItemsDialog';
    dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #000000;
        padding: 20px;
        border-radius: 16px;
        z-index: 10000;
        min-width: 300px;
        max-width: 90vw;
        max-height: 90vh;
        overflow-y: auto;
        font-family: "TwitterChirp", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `;

    // Add title
    const title = document.createElement('div');
    title.textContent = 'Add Menu Items';
    title.style.cssText = `
        color: white;
        margin: 0 0 16px 0;
        font-size: 20px;
        font-weight: bold;
        font-family: "TwitterChirp", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `;
    dialog.appendChild(title);

    // Show items that are either hidden or not present in the current menu
    ALL_MENU_ITEMS.forEach(item => {
        const matchingCurrentItem = currentItems.find(currentItem =>
            currentItem.text === item.name ||
            currentItem.url === item.url
        );

        const isHidden = hiddenItems.includes(item.name.toLowerCase());
        const isVisible = matchingCurrentItem && !isHidden && matchingCurrentItem.isVisible;

        // Show item if it's hidden or not present in current menu
        if (!isVisible) {
            const itemButton = document.createElement('div');
            itemButton.style.cssText = `
                padding: 12px;
                margin: 8px 0;
                background: #16181c;
                border-radius: 8px;
                cursor: pointer;
                color: white;
                transition: background 0.2s;
                display: flex;
                align-items: center;
                gap: 12px;
            `;

            // Add icon
            const iconSpan = document.createElement('span');
            iconSpan.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="${item.icon}"/></svg>`;
            itemButton.appendChild(iconSpan);

            // Add text
            const textSpan = document.createElement('span');
            textSpan.textContent = item.name;
            itemButton.appendChild(textSpan);

            // Add status label (if it was hidden)
            if (isHidden) {
                const statusLabel = document.createElement('span');
                statusLabel.textContent = '(Hidden)';
                statusLabel.style.cssText = `
                    margin-left: auto;
                    font-size: 12px;
                    color: #71767b;
                `;
                itemButton.appendChild(statusLabel);
            }

            itemButton.addEventListener('mouseover', () => {
                itemButton.style.background = '#1d1f23';
            });
            itemButton.addEventListener('mouseout', () => {
                itemButton.style.background = '#16181c';
            });
            itemButton.addEventListener('click', async () => {
                // If item was hidden, remove it from hidden items
                if (isHidden) {
                    const updatedHiddenItems = hiddenItems.filter(i => i !== item.name.toLowerCase());
                    await chrome.storage.local.set({ hiddenItems: updatedHiddenItems });
                    debugStorage();
                }

                // Create the menu item
                const menuItem = createMenuItem(item.name, item.url, item.icon);
                if (editMode) {
                    enableEditModeForItem(menuItem);
                }
                dialog.remove();
                backdrop.remove();
            });
            dialog.appendChild(itemButton);
        }
    });

    // Add close button
    const closeButton = document.createElement('div');
    closeButton.style.cssText = `
        padding: 12px;
        margin-top: 16px;
        background: #e0245e;
        border-radius: 8px;
        cursor: pointer;
        color: white;
        text-align: center;
    `;
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', () => {
        dialog.remove();
        backdrop.remove();
    });
    dialog.appendChild(closeButton);

    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        z-index: 9999;
    `;
    backdrop.addEventListener('click', () => {
        dialog.remove();
        backdrop.remove();
    });

    document.body.appendChild(backdrop);
    document.body.appendChild(dialog);
}

// Add this helper function
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

// Drag and drop handlers
let draggedItem = null;

function handleDragStart(e) {
    if (!editMode) return;
    draggedItem = this;
    this.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    if (!editMode) return;
    this.style.opacity = '1';
    draggedItem = null;

    // Save the new order
    saveMenuOrder();
}

function handleDragOver(e) {
    if (!editMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    if (!editMode || !draggedItem || draggedItem === this) return;
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

    // Save the new menu order
    saveMenuOrder();
}

// Function to save menu order
async function saveMenuOrder() {
    const nav = document.querySelector('nav[role="navigation"]');
    if (!nav) return;

    const menuOrder = [...nav.querySelectorAll('a[role="link"]')]
        .map(item => item.querySelector('[dir="ltr"] span')?.textContent?.trim())
        .filter(Boolean)
        .filter(name => name !== 'More'); // Exclude More from the saved order

    chrome.storage.local.set({ menuOrder });
}

// Modify initializeMenu to prevent multiple initializations
let isInitialized = false;

function initializeMenu() {
    if (isInitialized) return;

    const nav = document.querySelector('nav[role="navigation"]');
    if (!nav) return;

    // Detect default items first
    defaultVisibleItems = detectDefaultItems();

    chrome.storage.local.get(['hiddenItems', 'editMode', 'customItems', 'menuOrder'], function (result) {
        editMode = result.editMode || false;
        const customItems = result.customItems || [];
        console.log('Restoring custom items:', customItems); // Debug log

        // First restore custom items
        customItems.forEach(item => {
            const exists = [...nav.querySelectorAll('a[role="link"]')].some(
                existing =>
                    existing.getAttribute('href') === item.url ||
                    existing.querySelector('[dir="ltr"] span')?.textContent?.trim() === item.name
            );

            if (!exists) {
                createMenuItem(item.name, item.url, item.icon);
            }
        });

        // Then restore menu order
        const menuOrder = result.menuOrder || [];
        if (menuOrder.length > 0) {
            const moreButton = nav.querySelector('[data-testid="AppTabBar_More_Menu"]');
            if (moreButton) {
                nav.appendChild(moreButton); // Move More to the end

                menuOrder.forEach(itemName => {
                    if (itemName === 'More') return;
                    const item = [...nav.querySelectorAll('a[role="link"]')].find(
                        el => el.querySelector('[dir="ltr"] span')?.textContent?.trim() === itemName
                    );
                    if (item) {
                        nav.insertBefore(item, moreButton);
                    }
                });
            }
        }

        isInitialized = true;
    });
}

// Modify observer to be more precise and prevent multiple triggers
let currentObserver = null;

const observerCallback = (mutations) => {
    for (const mutation of mutations) {
        if (mutation.type === 'childList') {
            const nav = document.querySelector('nav[role="navigation"]');
            if (nav && !isInitialized) {
                initializeMenu();

                // Disconnect the observer once we've initialized
                if (currentObserver) {
                    currentObserver.disconnect();
                }
                return;
            }
        }
    }
};

// Create and start the observer
if (currentObserver) {
    currentObserver.disconnect();
}

currentObserver = new MutationObserver(observerCallback);
currentObserver.observe(document.body, {
    childList: true,
    subtree: true
});

// Initial check
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!isInitialized) {
            initializeMenu();
        }
    });
} else {
    if (!isInitialized) {
        initializeMenu();
    }
}

// Update the resetMenuItems function
function resetMenuItems() {
    chrome.storage.local.clear(function () {
        // Reload the page to restore default Twitter layout
        window.location.reload();
    });
}

// Add this function to create menu items
function createMenuItem(name, url, icon) {
    const nav = document.querySelector('nav[role="navigation"]');
    if (!nav) return null;

    // Create the menu item container with exact Twitter classes
    const menuItem = document.createElement('a');
    menuItem.setAttribute('role', 'link');
    menuItem.setAttribute('href', url);
    menuItem.setAttribute('data-testid', `AppTabBar_${name}_Link`);
    menuItem.className = 'css-175oi2r r-6koalj r-eqz5dr r-16y2uox r-1habvwh r-cnw61z r-13qz1uu r-1ny4l3l r-1loqt21';
    menuItem.style.position = 'relative';

    // Create the inner structure with exact Twitter classes
    menuItem.innerHTML = `
        <div class="css-175oi2r r-sdzlij r-dnmrzs r-1awozwy r-18u37iz r-1777fci r-xyw6el r-o7ynqc r-6416eg">
            <div class="css-175oi2r">
                <svg viewBox="0 0 24 24" aria-hidden="true" class="r-4qtqp9 r-yyyyoo r-dnmrzs r-bnwqim r-lrvibr r-m6rgpd r-1nao33i r-lwhw9o r-cnnz9e">
                    <path d="${icon}"></path>
                </svg>
            </div>
            <div dir="ltr" class="css-146c3p1 r-dnmrzs r-1udh08x r-1udbk01 r-3s2u2q r-bcqeeo r-1ttztb7 r-qvutc0 r-37j5jr r-adyw6z r-135wba7 r-16dba41 r-dlybji r-nazi8o" style="color: rgb(231, 233, 234);">
                <span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3">${name}</span>
            </div>
        </div>
    `;

    // Find the "More" button to insert before it
    const moreButton = nav.querySelector('[data-testid="AppTabBar_More_Menu"]');
    if (moreButton) {
        nav.insertBefore(menuItem, moreButton);
    } else {
        nav.appendChild(menuItem);
    }

    return menuItem;
}

function addDoneButton() {
    const postButton = document.querySelector('[data-testid="SideNav_NewTweet_Button"]');
    if (!postButton || document.querySelector('#menuDoneButton')) return;

    const doneButton = document.createElement('a');
    doneButton.id = 'menuDoneButton';
    doneButton.setAttribute('role', 'link');
    doneButton.className = 'css-175oi2r r-sdzlij r-1phboty r-rs99b7 r-lrvibr r-19yznuf r-64el8z r-1fkl15p r-o7ynqc r-6416eg r-1ny4l3l r-1loqt21';
    doneButton.style.cssText = `
        background-color: rgb(29, 155, 240);
        border-color: rgba(0, 0, 0, 0);
        margin-bottom: 12px;
        cursor: pointer;
    `;

    doneButton.innerHTML = `
        <div dir="ltr" class="css-146c3p1 r-bcqeeo r-qvutc0 r-37j5jr r-q4m81j r-a023e6 r-rjixqe r-b88u0q r-1awozwy r-6koalj r-18u37iz r-16y2uox r-1777fci" style="color: rgb(255, 255, 255);">
            <span class="css-1jxf684 r-dnmrzs r-1udh08x r-1udbk01 r-3s2u2q r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3 r-1inkyih r-rjixqe">
                <div>
                    <div class="css-175oi2r r-xoduu5">
                        <span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3">
                            <span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3">Done</span>
                        </span>
                    </div>
                </div>
            </span>
        </div>
    `;

    doneButton.addEventListener('click', function () {
        const nav = document.querySelector('nav[role="navigation"]');
        if (!nav) return;

        // Get all menu items
        const menuItems = [...nav.querySelectorAll('a[role="link"]')];

        // Define items that should maintain their original position
        const fixedPositionItems = ['Home', 'Explore', 'Notifications', 'Messages'];

        // Filter out fixed position items from the menu order
        const menuOrder = menuItems
            .filter(item => {
                const itemName = item.querySelector('[dir="ltr"] span')?.textContent?.trim();
                return itemName && !fixedPositionItems.includes(itemName);
            })
            .map(item => item.querySelector('[dir="ltr"] span')?.textContent?.trim())
            .filter(Boolean);

        // Get hidden items
        const hiddenItems = [...document.querySelectorAll('.hidden-item')]
            .map(item => item.dataset.itemName)
            .filter(Boolean);

        // Get custom items (excluding fixed position items)
        const customItems = menuItems
            .filter(item => {
                const itemName = item.querySelector('[dir="ltr"] span')?.textContent?.trim();
                return itemName && !fixedPositionItems.includes(itemName);
            })
            .map(item => ({
                name: item.querySelector('[dir="ltr"] span')?.textContent?.trim(),
                url: item.getAttribute('href'),
                icon: item.querySelector('svg path')?.getAttribute('d')
            }))
            .filter(item => item.name && item.url && item.icon);

        // Save everything to storage
        chrome.storage.local.set({
            menuOrder,
            hiddenItems,
            customItems
        }, function () {
            // Disable edit mode
            editMode = false;
            chrome.storage.local.set({ editMode: false });
            disableEditMode();

            // Remove the Done button
            doneButton.remove();

            // Reload the page to apply changes
            window.location.reload();
        });
    });

    // Insert before the Post button
    postButton.parentNode.insertBefore(doneButton, postButton);
}
