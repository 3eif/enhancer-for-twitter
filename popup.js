// Function to get menu items from the page
async function getMenuItems() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) {
            throw new Error('No active tab found');
        }

        const response = await new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tab.id, { type: 'GET_MENU_ITEMS' }, (response) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else if (!response) {
                    reject(new Error('No response from content script'));
                } else {
                    resolve(response);
                }
            });
        });

        // Ensure the response has the expected structure
        if (!response || !response.mainMenu || !response.moreMenu) {
            throw new Error('Invalid response format from content script');
        }

        return response;
    } catch (error) {
        console.error('Error in getMenuItems:', error);
        throw error;
    }
}

// Function to create sections for enabled and disabled items
function createSections(title, items, hiddenItems, container) {
    if (!items || items.length === 0) return;

    const sectionWrapper = document.createElement('div');
    sectionWrapper.className = 'menu-section-wrapper';

    const heading = document.createElement('h4');
    heading.textContent = title;
    sectionWrapper.appendChild(heading);

    if (title === 'Main Menu Items') {
        // Split items into enabled and disabled for main menu
        const enabledItems = items.filter(item => !hiddenItems.includes(item.id));
        const disabledItems = items.filter(item => hiddenItems.includes(item.id));

        if (enabledItems.length > 0) {
            const enabledSection = document.createElement('div');
            enabledSection.className = 'menu-section';
            enabledSection.dataset.section = 'main-menu-items-enabled';

            const enabledHeading = document.createElement('h5');
            enabledHeading.textContent = 'Enabled';
            enabledSection.appendChild(enabledHeading);

            createMenuItems(enabledItems, hiddenItems, enabledSection, true);
            sectionWrapper.appendChild(enabledSection);
        }

        if (disabledItems.length > 0) {
            const disabledSection = document.createElement('div');
            disabledSection.className = 'menu-section';
            disabledSection.dataset.section = 'main-menu-items-disabled';

            const disabledHeading = document.createElement('h5');
            disabledHeading.textContent = 'Disabled';
            disabledSection.appendChild(disabledHeading);

            createMenuItems(disabledItems, hiddenItems, disabledSection, true);
            sectionWrapper.appendChild(disabledSection);
        }
    } else {
        // For More menu items, just show them as a simple list with checkboxes
        const section = document.createElement('div');
        section.className = 'menu-section';
        createMenuItems(items, hiddenItems, section, false);
        sectionWrapper.appendChild(section);
    }

    container.appendChild(sectionWrapper);
}

// Function to create menu items
function createMenuItems(items, hiddenItems, container, isDraggable = true) {
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.draggable = isDraggable;
        div.dataset.id = item.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = item.id;
        checkbox.checked = !hiddenItems.includes(item.id);

        const label = document.createElement('label');
        label.htmlFor = item.id;

        // Add icon if available
        if (item.icon) {
            const iconSpan = document.createElement('span');
            iconSpan.className = 'menu-icon';
            iconSpan.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${item.icon}</svg>`;
            label.appendChild(iconSpan);
        }

        // Add text
        const textSpan = document.createElement('span');
        textSpan.textContent = item.label;
        label.appendChild(textSpan);

        div.appendChild(checkbox);
        div.appendChild(label);

        // Only add drag handle for main menu items, at the end
        if (isDraggable) {
            const dragHandle = document.createElement('span');
            dragHandle.className = 'drag-handle';
            div.appendChild(dragHandle);
        }

        container.appendChild(div);

        if (isDraggable) {
            setupDragAndDrop(div);
        }

        checkbox.addEventListener('change', async () => {
            const settings = await chrome.storage.sync.get('hiddenItems');
            let hiddenItems = settings.hiddenItems || [];

            if (checkbox.checked) {
                hiddenItems = hiddenItems.filter(id => id !== item.id);
            } else {
                hiddenItems.push(item.id);
            }

            await chrome.storage.sync.set({ hiddenItems });

            // Update the page without refreshing the popup
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'UPDATE_MENU' });
            });

            // Only move the item to the appropriate section
            const currentSection = div.closest('.menu-section');
            const targetSectionType = checkbox.checked ? 'enabled' : 'disabled';
            const targetSection = document.querySelector(`.menu-section[data-section$="-${targetSectionType}"]`);

            if (targetSection && currentSection !== targetSection) {
                targetSection.appendChild(div);
            }
        });
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function setupDragAndDrop(element) {
    element.addEventListener('dragstart', (e) => {
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/plain', e.target.dataset.id);
    });

    element.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging');
        saveOrder();
    });

    element.addEventListener('dragover', (e) => {
        e.preventDefault();
        const dragging = document.querySelector('.dragging');
        const container = e.target.closest('.menu-section');
        if (!container || !dragging) return;

        // Only allow dragging within the same section type (enabled or disabled)
        const draggingSection = dragging.closest('.menu-section');
        if (draggingSection.dataset.section.includes('enabled') !== container.dataset.section.includes('enabled')) {
            return;
        }

        const siblings = [...container.querySelectorAll('.menu-item:not(.dragging)')];
        const nextSibling = siblings.find(sibling => {
            const rect = sibling.getBoundingClientRect();
            return e.clientY < rect.top + rect.height / 2;
        });

        container.insertBefore(dragging, nextSibling);
    });
}

const debouncedSaveOrder = debounce(async () => {
    const mainMenuOrder = [];
    const moreMenuOrder = [];

    // Get all menu sections
    document.querySelectorAll('.menu-section').forEach(section => {
        const items = [...section.querySelectorAll('.menu-item')].map(item => item.dataset.id);

        // Check if this is a main menu or more menu section
        if (section.dataset.section?.includes('main-menu-items')) {
            mainMenuOrder.push(...items);
        } else if (section.dataset.section?.includes('more-menu-items')) {
            moreMenuOrder.push(...items);
        }
    });

    try {
        await chrome.storage.sync.set({
            menuOrder: {
                main: mainMenuOrder,
                more: moreMenuOrder
            }
        });

        // Update the menu on the page
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'UPDATE_MENU_ORDER',
                order: { main: mainMenuOrder, more: moreMenuOrder }
            });
        });
    } catch (error) {
        console.error('Error saving menu order:', error);
    }
}, 500);

const saveOrder = () => debouncedSaveOrder();

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    const togglesContainer = document.getElementById('toggles');
    if (!togglesContainer) {
        console.error('Toggles container not found');
        return;
    }

    try {
        // Get settings first
        const settings = await chrome.storage.sync.get(['hiddenItems', 'menuOrder']);
        const hiddenItems = settings.hiddenItems || [];

        // Get menu items and check the response
        const menuItems = await getMenuItems();
        console.log('Menu items received:', menuItems); // Debug log

        if (!menuItems || typeof menuItems !== 'object') {
            throw new Error('Invalid menu items response');
        }

        // Check if mainMenu and moreMenu exist and are arrays
        if (!Array.isArray(menuItems.mainMenu) || !Array.isArray(menuItems.moreMenu)) {
            throw new Error('Menu items are not in the expected format');
        }

        // Create sections for main menu and more menu
        createSections('Main Menu Items', menuItems.mainMenu, hiddenItems, togglesContainer);
        createSections('More Menu Items', menuItems.moreMenu, hiddenItems, togglesContainer);

        // Apply saved order if it exists and is valid
        if (settings.menuOrder && typeof settings.menuOrder === 'object') {
            applyMenuOrder(settings.menuOrder);
        }
    } catch (error) {
        console.error('Detailed error:', error);
        togglesContainer.innerHTML = '<p>Please refresh the X.com page and try again.</p>';
    }
});

function applyMenuOrder(order) {
    // Make sure we're working with an array
    const sections = ['main', 'more'];
    sections.forEach(section => {
        const items = order[section] || [];
        // Ensure items is an array before filtering
        if (!Array.isArray(items)) return;

        const sectionContainer = document.querySelector(
            `.menu-section[data-section^="${section}-menu-items"]`
        );
        if (!sectionContainer) return;

        // Sort the menu items according to the saved order
        items.forEach(itemId => {
            const menuItem = sectionContainer.querySelector(`[data-id="${itemId}"]`);
            if (menuItem) {
                sectionContainer.appendChild(menuItem);
            }
        });
    });
} 