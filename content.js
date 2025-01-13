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

async function getMenuItems() {
    try {
        const mainMenu = await getItemsFromNav('nav[aria-label="Primary"]');
        const moreMenu = await getItemsFromMoreMenu();

        // Combine all items but maintain uniqueness by both href and label
        const uniqueItems = new Map();

        // Add main menu items first (priority)
        mainMenu.forEach(item => {
            const key = `${item.href || ''}-${item.label.toLowerCase()}`;
            uniqueItems.set(key, item);
        });

        // Add more menu items if they don't exist
        moreMenu.forEach(item => {
            const key = `${item.href || ''}-${item.label.toLowerCase()}`;
            if (!uniqueItems.has(key)) {
                uniqueItems.set(key, item);
            }
        });

        // Add additional items if they don't exist
        ADDITIONAL_MENU_ITEMS.forEach(item => {
            const key = `${item.href || ''}-${item.label.toLowerCase()}`;
            if (!uniqueItems.has(key)) {
                uniqueItems.set(key, {
                    ...item,
                    element: null,
                    selector: `a[href="${item.href}"]`
                });
            }
        });

        return Array.from(uniqueItems.values());
    } catch (error) {
        console.error('Error in getMenuItems:', error);
        return [];
    }
}

// Function to get current user's username
function getCurrentUsername() {
    // Try to get username from various elements that contain it
    const usernameElement = document.querySelector('[data-testid="AppTabBar_Profile_Link"]');
    if (usernameElement) {
        const href = usernameElement.getAttribute('href');
        if (href && href.startsWith('/')) {
            return href.substring(1); // Remove the leading slash
        }
    }

    // Fallback: try to get from URL if we're on a profile page
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length > 1 && pathParts[1]) {
        return pathParts[1];
    }

    return ''; // Return empty string if no username found
}

// Add this list of additional menu items we want to make available
const ADDITIONAL_MENU_ITEMS = [
    {
        id: 'lists',
        get href() {
            const username = getCurrentUsername();
            return username ? `/${username}/lists` : '/lists';
        },
        label: 'Lists',
        icon: '<path d="M3 4.5C3 3.12 4.12 2 5.5 2h13C19.88 2 21 3.12 21 4.5v15c0 1.38-1.12 2.5-2.5 2.5h-13C4.12 22 3 20.88 3 19.5v-15zM5.5 4c-.28 0-.5.22-.5.5v15c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5v-15c0-.28-.22-.5-.5-.5h-13zM16 10H8V8h8v2zm-8 2h8v2H8v-2z"/>'
    },
    {
        id: 'bookmarks',
        href: '/i/bookmarks',
        label: 'Bookmarks',
        icon: '<path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"/>'
    },
    {
        id: 'monetization',
        href: '/i/monetization',
        label: 'Monetization',
        icon: '<path d="M23 3v14h-2V5H5V3h18zM10 17c1.1 0 2-1.34 2-3s-.9-3-2-3-2 1.34-2 3 .9 3 2 3zM1 7h18v14H1V7zm16 10c-1.1 0-2 .9-2 2h2v-2zm-2-8c0 1.1.9 2 2 2V9h-2zM3 11c1.1 0 2-.9 2-2H3v2zm0 4c2.21 0 4 1.79 4 4h6c0-2.21 1.79-4 4-4v-2c-2.21 0-4-1.79-4-4H7c0 2.21-1.79 4-4 4v2zm0 4h2c0-1.1-.9-2-2-2v2z"/>'
    },
    {
        id: 'ads',
        href: 'https://ads.x.com/?ref=gl-tw-tw-twitter-ads-rweb',
        label: 'Ads',
        isExternal: true,
        icon: '<path d="M1.996 5.5c0-1.38 1.119-2.5 2.5-2.5h15c1.38 0 2.5 1.12 2.5 2.5v13c0 1.38-1.12 2.5-2.5 2.5h-15c-1.381 0-2.5-1.12-2.5-2.5v-13zm2.5-.5c-.277 0-.5.22-.5.5v13c0 .28.223.5.5.5h15c.276 0 .5-.22.5-.5v-13c0-.28-.224-.5-.5-.5h-15zm8.085 5H8.996V8h7v7h-2v-3.59l-5.293 5.3-1.415-1.42L12.581 10z"/>'
    },
    {
        id: 'jobs',
        href: '/jobs',
        label: 'Jobs',
        icon: '<path d="M19.5 6H17V4.5C17 3.12 15.88 2 14.5 2h-5C8.12 2 7 3.12 7 4.5V6H4.5C3.12 6 2 7.12 2 8.5v10C2 19.88 3.12 21 4.5 21h15c1.38 0 2.5-1.12 2.5-2.5v-10C22 7.12 20.88 6 19.5 6zM9 4.5c0-.28.23-.5.5-.5h5c.28 0 .5.22.5.5V6H9V4.5zm11 14c0 .28-.22.5-.5.5h-15c-.27 0-.5-.22-.5-.5v-3.04c.59.35 1.27.54 2 .54h5v1h2v-1h5c.73 0 1.41-.19 2-.54v3.04zm0-6.49c0 1.1-.9 1.99-2 1.99h-5v-1h-2v1H6c-1.1 0-2-.9-2-2V8.5c0-.28.23-.5.5-.5h15c.28 0 .5.22.5.5v3.51z"/>'
    },
    {
        id: 'spaces',
        href: '/i/spaces/start',
        label: 'Create your Space',
        icon: '<path d="M12 22.25c-4.99 0-9.18-3.393-10.39-7.994l1.93-.512c.99 3.746 4.4 6.506 8.46 6.506s7.47-2.76 8.46-6.506l1.93.512c-1.21 4.601-5.4 7.994-10.39 7.994zM5 11.5c0 3.866 3.13 7 7 7s7-3.134 7-7V8.75c0-3.866-3.13-7-7-7s-7 3.134-7 7v2.75zm12-2.75v2.75c0 2.761-2.24 5-5 5s-5-2.239-5-5V8.75c0-2.761 2.24-5 5-5s5 2.239 5 5zM11.25 8v4.25c0 .414.34.75.75.75s.75-.336.75-.75V8c0-.414-.34-.75-.75-.75s-.75.336-.75.75zm-3 1v2.25c0 .414.34.75.75.75s.75-.336.75-.75V9c0-.414-.34-.75-.75-.75s-.75.336-.75.75zm7.5 0c0-.414-.34-.75-.75-.75s-.75.336-.75.75v2.25c0 .414.34.75.75.75s.75-.336.75-.75V9z"/>'
    }
];

// Update getItemsFromNav to return an array
async function getItemsFromNav(selector) {
    const nav = document.querySelector(selector);
    if (!nav) return [];

    // Get settings first to know which items are disabled
    const settings = await chrome.storage.sync.get('hiddenItems');
    const hiddenItems = settings.hiddenItems || [];

    // Get existing menu items from main nav
    const mainMenuItems = Array.from(nav.querySelectorAll('a[role="link"], button[role="button"]'))
        .filter(el => {
            const hasIcon = el.querySelector('svg');
            const hasLabel = el.querySelector('[dir="ltr"] span');
            return hasIcon && hasLabel;
        })
        .map(createItemObject);

    // Use a Map to store unique items, with both href and label as keys
    const uniqueByHref = new Map();
    const uniqueByLabel = new Map();
    const finalItems = [];

    // Process main menu items first
    mainMenuItems.forEach(item => {
        const labelKey = item.label?.toLowerCase();
        const hrefKey = item.href;

        // Skip if we've seen this item before
        if (uniqueByLabel.has(labelKey) || uniqueByHref.has(hrefKey)) {
            return;
        }

        // Add to our tracking maps and final array
        if (labelKey) uniqueByLabel.set(labelKey, true);
        if (hrefKey) uniqueByHref.set(hrefKey, true);
        finalItems.push(item);
    });

    // Add additional items only if they don't exist
    ADDITIONAL_MENU_ITEMS.forEach(item => {
        const labelKey = item.label.toLowerCase();
        const hrefKey = item.href;

        // Skip if we've seen this item before
        if (uniqueByLabel.has(labelKey) || uniqueByHref.has(hrefKey)) {
            return;
        }

        // Add to our tracking maps and final array
        if (labelKey) uniqueByLabel.set(labelKey, true);
        if (hrefKey) uniqueByHref.set(hrefKey, true);
        finalItems.push({
            ...item,
            element: null,
            selector: `a[href="${item.href}"]`
        });
    });

    return finalItems;
}

// Helper function to create item objects with icons
function createItemObject(el) {
    const label = el.querySelector('[dir="ltr"] span')?.textContent ||
        el.getAttribute('aria-label') ||
        'Unknown';
    const id = el.getAttribute('data-testid') ||
        el.getAttribute('href')?.replace(/\//g, '_') ||
        label.toLowerCase().replace(/\s+/g, '-');

    // Get the SVG path from the element
    const svgPath = el.querySelector('svg path')?.getAttribute('d');
    const icon = svgPath ? `<path d="${svgPath}"/>` : null;

    return {
        id,
        label,
        element: el,
        selector: generateUniqueSelector(el),
        ariaLabel: el.getAttribute('aria-label'),
        href: el.getAttribute('href'),
        icon
    };
}

function getItemsFromMoreMenu() {
    const moreButton = document.querySelector('[aria-label="More"]');
    if (!moreButton) return [];

    let isMenuOpen = !!document.querySelector('[role="menu"]');
    let menuItems = [];

    if (isMenuOpen) {
        const seenLabels = new Set();
        menuItems = Array.from(document.querySelectorAll('[role="menu"] a, [role="menu"] [role="menuitem"]'))
            .filter(el => {
                const span = el.querySelector('[dir="ltr"] span');
                if (!span || !span.textContent) return false;
                const label = span.textContent.toLowerCase();
                if (seenLabels.has(label)) return false;
                seenLabels.add(label);
                return true;
            })
            .map(el => ({
                id: el.getAttribute('data-testid') ||
                    el.getAttribute('href')?.replace(/\//g, '_') ||
                    el.querySelector('[dir="ltr"] span').textContent.toLowerCase().replace(/\s+/g, '-'),
                label: el.querySelector('[dir="ltr"] span').textContent,
                element: el,
                selector: generateUniqueSelector(el),
                href: el.getAttribute('href'),
                isExternal: el.getAttribute('target') === '_blank'
            }));
    }

    return Promise.resolve(menuItems);
}

function generateUniqueSelector(element) {
    if (element.getAttribute('data-testid')) {
        return `[data-testid="${element.getAttribute('data-testid')}"]`;
    }
    if (element.getAttribute('href')) {
        return `a[href="${element.getAttribute('href')}"]`;
    }
    if (element.getAttribute('aria-label')) {
        return `[aria-label="${element.getAttribute('aria-label')}"]`;
    }
    return element.tagName.toLowerCase() +
        (element.getAttribute('role') ? `[role="${element.getAttribute('role')}"]` : '');
}

let menuItemsCache = null;

async function updateMenu() {
    try {
        const settings = await new Promise(resolve => {
            chrome.storage.sync.get('hiddenItems', resolve);
        });
        const hiddenItems = settings.hiddenItems || [];

        // Get the main navigation
        const nav = document.querySelector('nav[aria-label="Primary"]');
        if (!nav) return;

        // First, remove any previously added items
        nav.querySelectorAll('a[data-added-by-extension="true"]').forEach(el => el.remove());

        // Handle main menu items visibility
        const allItems = document.querySelectorAll('nav[aria-label="Primary"] a[role="link"], nav[aria-label="Primary"] button[role="button"]');
        allItems.forEach(element => {
            if (element) {
                const id = element.getAttribute('data-testid') ||
                    element.getAttribute('href')?.replace(/\//g, '_') ||
                    element.querySelector('[dir="ltr"] span')?.textContent.toLowerCase().replace(/\s+/g, '-');

                if (id) {
                    element.style.display = hiddenItems.includes(id) ? 'none' : '';
                }
            }
        });

        // Add additional items to the main menu
        ADDITIONAL_MENU_ITEMS.forEach(item => {
            if (!hiddenItems.includes(item.id)) {
                const newItem = createNavItem(item);
                if (newItem) {
                    newItem.setAttribute('data-added-by-extension', 'true');
                    newItem.setAttribute('data-testid', item.id);

                    const moreButton = Array.from(nav.children).find(el =>
                        el.getAttribute('aria-label') === 'More' ||
                        el.textContent?.includes('More')
                    );

                    if (moreButton) {
                        nav.insertBefore(newItem, moreButton);
                    } else {
                        nav.appendChild(newItem);
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error updating menu:', error);
    }
}

// Update createNavItem to match X's styling better
function createNavItem(item) {
    const template = document.createElement('a');
    template.href = item.href || '#';
    template.setAttribute('role', 'link');
    template.setAttribute('aria-label', item.label);
    template.className = 'css-175oi2r r-6koalj r-eqz5dr r-16y2uox r-1habvwh r-cnw61z r-13qz1uu r-1ny4l3l r-1loqt21';

    // Add active state if current URL matches
    if (window.location.pathname === item.href || window.location.href.includes(item.href)) {
        template.classList.add('active');
    }

    template.innerHTML = `
        <div class="css-175oi2r r-sdzlij r-dnmrzs r-1awozwy r-18u37iz r-1777fci r-xyw6el r-o7ynqc r-6416eg flex">
            <div class="css-175oi2r">
                <svg viewBox="0 0 24 24" aria-hidden="true" class="r-4qtqp9 r-yyyyoo r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-m6rgpd r-1nao33i r-lwhw9o r-cnnz9e">
                    ${item.icon || ''}
                </svg>
            </div>
            <div dir="ltr" class="css-146c3p1 r-dnmrzs r-1udh08x r-3s2u2q r-bcqeeo r-1ttztb7 r-qvutc0 r-37j5jr r-adyw6z r-135wba7 r-16dba41 r-dlybji r-nazi8o" style="text-overflow: unset; color: rgb(231, 233, 234);">
                <span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3" style="text-overflow: unset;">
                    ${item.label}
                </span>
            </div>
        </div>`;

    // Add hover styles
    const style = document.createElement('style');
    style.textContent = `
        .flex:hover {
            background-color: rgba(231, 233, 234, 0.1);
            transition-property: background-color, box-shadow;
            transition-duration: 0.2s;
        }
    `;
    document.head.appendChild(style);

    // Handle click event
    template.addEventListener('click', (e) => {
        e.preventDefault();
        if (item.isExternal) {
            window.open(item.href, '_blank');
        } else {
            history.pushState({}, '', item.href);
            window.dispatchEvent(new PopStateEvent('popstate'));
        }
    });

    return template;
}

// Update the message handler to handle disconnections
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'GET_MENU_ITEMS':
            getMenuItems()
                .then(items => {
                    menuItemsCache = items;
                    try {
                        sendResponse(items);
                    } catch (error) {
                        console.error('Error sending response:', error);
                    }
                })
                .catch(error => {
                    console.error('Error getting menu items:', error);
                    sendResponse({ mainMenu: [], moreMenu: [] });
                });
            return true; // Keep the message channel open

        case 'UPDATE_MENU':
            updateMenu()
                .then(() => sendResponse(true))
                .catch(error => {
                    console.error('Error updating menu:', error);
                    sendResponse(false);
                });
            return true;
    }
});

// Update the initialization code to be more resilient
async function initializeMenu() {
    try {
        // Wait for the main navigation to be present
        const nav = await waitForElement('nav[aria-label="Primary"]');
        if (!nav) return;

        // Get menu items with retry
        let retries = 0;
        while (retries < 3) {
            try {
                menuItemsCache = await getMenuItems();
                if (menuItemsCache?.mainMenu?.length > 0) {
                    await updateMenu();
                    break;
                }
            } catch (error) {
                console.error('Error initializing menu (attempt ' + (retries + 1) + '):', error);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            }
            retries++;
        }
    } catch (error) {
        console.error('Error in initialization:', error);
    }
}

// Update waitForElement to be more reliable
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver((mutations, obs) => {
            const element = document.querySelector(selector);
            if (element) {
                obs.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Don't reject, just resolve with null after timeout
        setTimeout(() => {
            observer.disconnect();
            resolve(null);
        }, timeout);
    });
}

// Update the initialization triggers to be more robust
function startInitialization() {
    // Clear any existing intervals first
    if (window.checkInterval) {
        clearInterval(window.checkInterval);
    }

    initializeMenu().catch(console.error);

    // Set up periodic checks
    let checkCount = 0;
    window.checkInterval = setInterval(() => {
        if (checkCount++ < 12) { // Check for 1 minute (12 * 5000ms)
            const nav = document.querySelector('nav[aria-label="Primary"]');
            if (nav) {
                initializeMenu().catch(console.error);
            }
        } else {
            clearInterval(window.checkInterval);
        }
    }, 5000);
}

// Initialize on page load and URL changes
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startInitialization);
} else {
    startInitialization();
}

// Handle navigation changes
let lastUrl = location.href;
new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        startInitialization();
    }
}).observe(document, { subtree: true, childList: true });

// Update the observer to be less sensitive
const observer = new MutationObserver(debounce(async (mutations) => {
    // Only proceed if the mutations affect the menu
    const menuMutation = mutations.some(mutation => {
        const isMenuElement = mutation.target.closest('nav[aria-label="Primary"]') ||
            mutation.target.closest('[role="menu"]');
        return isMenuElement && !mutation.target.closest('[role="dialog"]'); // Ignore dialogs/modals
    });

    if (!menuMutation) return;

    try {
        const currentItems = await getMenuItems();
        const currentJSON = JSON.stringify(currentItems);
        const cacheJSON = JSON.stringify(menuItemsCache);

        if (currentJSON !== cacheJSON) {
            menuItemsCache = currentItems;
            await updateMenu();
        }
    } catch (error) {
        console.error('Error updating menu:', error);
    }
}, 500)); // Add debounce of 500ms

observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class', 'aria-hidden']
}); 