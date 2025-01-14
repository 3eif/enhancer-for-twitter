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

    // Detect default items first
    defaultVisibleItems = detectDefaultItems();

    chrome.storage.local.get(['hiddenItems', 'editMode', 'customItems', 'menuOrder'], function (result) {
        setEditMode(result.editMode || false);
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

        // Add the following code to apply hiddenItems
        const hiddenItems = result.hiddenItems || [];
        hiddenItems.forEach(hiddenItemName => {
            const item = [...nav.querySelectorAll('a[role="link"]')].find(
                el => el.querySelector('[dir="ltr"] span')?.textContent?.trim().toLowerCase() === hiddenItemName
            );
            if (item) {
                item.style.display = 'none';
            }
        });

        isInitialized = true;
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

window.startObserver = startObserver; 