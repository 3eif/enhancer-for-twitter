let defaultVisibleItems = [];
let isInitialized = false;

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

function initializeMenu() {
    if (isInitialized) return;

    const nav = document.querySelector('nav[role="navigation"]');
    if (!nav) return;

    // console.log('Initializing menu');

    // Detect default items first
    defaultVisibleItems = detectDefaultItems();
    // console.log('Default visible items:', defaultVisibleItems);

    chrome.storage.local.get(['hiddenItems', 'editMode', 'customItems', 'menuOrder'], function (result) {
        editMode = result.editMode || false;
        const customItems = result.customItems || [];
        const menuOrder = result.menuOrder || [];
        const hiddenItems = result.hiddenItems || [];

        // console.log('Retrieved from storage:', { customItems, menuOrder, hiddenItems });

        // First restore custom items
        customItems.forEach(item => {
            const exists = [...nav.querySelectorAll('a[role="link"]')].some(
                existing => {
                    const existingName = existing.querySelector('[dir="ltr"] span')?.textContent?.trim();
                    return existing.getAttribute('href') === item.url || existingName === item.name;
                }
            );

            if (!exists) {
                // console.log('Creating custom menu item:', item.name);
                createMenuItem(item.name, item.url, item.icon);
            }
        });

        // Hide items that should be hidden
        hiddenItems.forEach(itemName => {
            const item = [...nav.querySelectorAll('a[role="link"]')]
                .find(el => el.querySelector('[dir="ltr"] span')?.textContent?.trim() === itemName);

            if (item) {
                // console.log('Hiding menu item:', itemName);
                item.style.display = 'none';
            }
        });

        // Then restore menu order for visible items
        if (menuOrder.length > 0) {
            // console.log('Restoring menu order:', menuOrder);
            const moreButton = nav.querySelector('[data-testid="AppTabBar_More_Menu"]');
            if (moreButton) {
                nav.appendChild(moreButton); // Move More to the end

                // Create a map of all menu items
                const menuItems = new Map();
                [...nav.querySelectorAll('a[role="link"]')]
                    .filter(item => window.getComputedStyle(item).display !== 'none')
                    .forEach(item => {
                        const name = item.querySelector('[dir="ltr"] span')?.textContent?.trim();
                        if (name) menuItems.set(name, item);
                    });

                // Reorder according to menuOrder
                menuOrder.forEach(itemName => {
                    const item = menuItems.get(itemName);
                    if (item) {
                        // console.log('Reordering item:', itemName);
                        nav.insertBefore(item, moreButton);
                    }
                });
            }
        }

        isInitialized = true;
        // console.log('Menu initialization complete');
    });
}

// Create and start the observer
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

function startObserver() {
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
}

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggleEditMode') {
        setEditMode(message.editMode);
        if (message.editMode) {
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
                    if (getEditMode()) {
                        enableEditModeForItem(menuItem);
                    }
                    // Save the new menu order
                    saveMenuOrder();
                });
            }
        });
    }
});

function saveMenuOrder() {
    const nav = document.querySelector('nav[role="navigation"]');
    if (!nav) return;

    // Get all menu items except the More button
    const menuOrder = [...nav.querySelectorAll('a[role="link"]')]
        .map(item => item.querySelector('[dir="ltr"] span')?.textContent?.trim())
        .filter(name => name && name !== 'More');

    // Save to storage
    chrome.storage.local.set({ menuOrder }, () => {
        // console.log('Menu order saved:', menuOrder);
    });
}

window.startObserver = startObserver; 