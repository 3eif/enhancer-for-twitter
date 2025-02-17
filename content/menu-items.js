// Menu items data shared between content and popup scripts
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

const FILLED_ICONS = {
    'Bookmarks': 'M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z',
    'Lists': 'M18.5 2h-13C4.12 2 3 3.12 3 4.5v15C3 20.88 4.12 22 5.5 22h13c1.38 0 2.5-1.12 2.5-2.5v-15C21 3.12 19.88 2 18.5 2zM16 14H8v-2h8v2zm0-4H8V8h8v2z'
};

// Helper function to get current username
function getCurrentUsername() {
    const profileLink = document.querySelector('a[data-testid="AppTabBar_Profile_Link"]');
    if (profileLink) {
        const username = profileLink.getAttribute('href').replace('/', '');
        return username;
    }
    return '';
}

// Helper function to create menu items
function createMenuItem(name, url, icon) {
    const nav = document.querySelector('nav[role="navigation"]');
    if (!nav) return;

    const moreButton = nav.querySelector('[data-testid="AppTabBar_More_Menu"]');
    if (!moreButton) return;

    // Replace {username} in URL with actual username for Lists
    const username = getCurrentUsername();
    const finalUrl = name === 'Lists' ? `/${username}/lists` : url;

    // Helper function to check if this menu item is active
    const isActiveMenuItem = () => {
        const currentPath = window.location.pathname;
        // Handle special cases and normalize URLs for comparison
        const itemPath = finalUrl.startsWith('http') ? finalUrl : finalUrl.split('?')[0];
        const normalizedCurrentPath = currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath;
        const normalizedItemPath = itemPath.endsWith('/') ? itemPath.slice(0, -1) : itemPath;
        return normalizedCurrentPath === normalizedItemPath;
    };

    const menuItem = document.createElement('a');
    menuItem.href = finalUrl;
    menuItem.setAttribute('role', 'link');
    menuItem.setAttribute('data-testid', `AppTabBar_${name}_Link`);
    menuItem.setAttribute('aria-label', name);
    menuItem.className = moreButton.className;

    // Set initial bold class based on current URL
    const boldClass = isActiveMenuItem() ? 'r-b88u0q' : '';

    // Helper function to update active state of all menu items
    const updateActiveStates = () => {
        // Get current path
        const currentPath = window.location.pathname;
        const normalizedCurrentPath = currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath;

        // Find and update all menu items (both default and custom)
        document.querySelectorAll('nav[role="navigation"] a[role="link"]').forEach(link => {
            const itemPath = link.getAttribute('href');
            if (!itemPath) return;

            const normalizedItemPath = itemPath.endsWith('/') ? itemPath.slice(0, -1) : itemPath;
            const isActive = normalizedCurrentPath === normalizedItemPath;

            // Get item name from either the text span or aria-label
            const itemName = link.querySelector('[dir="ltr"] span')?.textContent?.trim()
                || link.getAttribute('aria-label');

            // Update icon if it exists in FILLED_ICONS
            if (itemName && FILLED_ICONS[itemName]) {
                const svgPath = link.querySelector('svg path');
                if (svgPath) {
                    svgPath.setAttribute('d', isActive ? FILLED_ICONS[itemName] :
                        ALL_MENU_ITEMS.find(item => item.name === itemName)?.icon);
                }
            }

            // Update text bold state if text div exists
            const textDiv = link.querySelector('div[dir="ltr"]');
            if (textDiv) {
                if (isActive) {
                    textDiv.classList.add('r-b88u0q');
                } else {
                    textDiv.classList.remove('r-b88u0q');
                }
            }
        });
    };

    // Add click handler for default menu items
    function addDefaultMenuItemsHandler() {
        document.querySelectorAll('nav[role="navigation"] a[role="link"]').forEach(link => {
            if (!link.hasAttribute('data-menu-handler')) {
                link.setAttribute('data-menu-handler', 'true');
                link.addEventListener('click', () => {
                    setTimeout(updateActiveStates, 100); // Small delay to ensure DOM is updated
                });
            }
        });
    }

    // Call this when creating menu items and after navigation
    addDefaultMenuItemsHandler();
    window.addEventListener('popstate', () => {
        updateActiveStates();
        addDefaultMenuItemsHandler();
    });

    function updateMenuItemLayout() {
        const isMinimized = window.innerWidth < 1300;

        // Get More button for reference
        const moreButton = document.querySelector('[data-testid="AppTabBar_More_Menu"]');
        if (!moreButton) return;

        // Get exact classes and styles from More button
        const moreButtonSvg = moreButton.querySelector('svg');
        const moreButtonText = moreButton.querySelector('[dir="ltr"]');

        // Determine the theme-specific icon class
        const iconThemeClass = moreButtonSvg?.classList.contains('r-1nao33i') ? 'r-1nao33i' : 'r-18jsvk2';

        menuItem.innerHTML = `
            <div class="css-175oi2r r-sdzlij r-dnmrzs r-1awozwy r-18u37iz r-1777fci r-xyw6el r-o7ynqc r-6416eg">
                <div class="css-175oi2r">
                    <svg viewBox="0 0 24 24" aria-hidden="true" class="r-4qtqp9 r-yyyyoo r-dnmrzs r-bnwqim r-lrvibr r-m6rgpd ${iconThemeClass} r-lwhw9o r-cnnz9e">
                        <g><path d="${icon}"></path></g>
                    </svg>
                </div>
                ${!isMinimized ? `
                    <div dir="ltr" class="${moreButtonText?.className || 'css-146c3p1 r-dnmrzs r-1udh08x r-1udbk01 r-3s2u2q r-bcqeeo r-1ttztb7 r-qvutc0 r-37j5jr r-adyw6z r-135wba7 r-16dba41 r-dlybji r-nazi8o'}" style="${moreButtonText?.getAttribute('style') || ''}">
                        <span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3">${name}</span>
                    </div>
                ` : ''}
            </div>`;

        setTimeout(updateActiveStates, 0);
    }

    // Initial layout
    updateMenuItemLayout();

    // Update on window resize
    window.addEventListener('resize', updateMenuItemLayout);

    // Add a popstate listener to update the bold styling when navigation occurs
    window.addEventListener('popstate', updateActiveStates);

    // Also listen for pushState/replaceState changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function () {
        originalPushState.apply(this, arguments);
        updateActiveStates();
    };

    history.replaceState = function () {
        originalReplaceState.apply(this, arguments);
        updateActiveStates();
    };

    // Add hover event listeners to apply/remove the hover classes
    menuItem.addEventListener('mouseenter', () => {
        const mainDiv = menuItem.querySelector('.css-175oi2r.r-sdzlij');
        const textDiv = menuItem.querySelector('div[dir="ltr"]');
        if (mainDiv) mainDiv.classList.add('r-1ydqjzz');
        if (textDiv) textDiv.classList.add('r-18jsvk2');
    });

    menuItem.addEventListener('mouseleave', () => {
        const mainDiv = menuItem.querySelector('.css-175oi2r.r-sdzlij');
        const textDiv = menuItem.querySelector('div[dir="ltr"]');
        if (mainDiv) mainDiv.classList.remove('r-1ydqjzz');
        if (textDiv) textDiv.classList.remove('r-18jsvk2');
    });

    // Prevent default navigation and use Twitter's client-side routing
    menuItem.addEventListener('click', (e) => {
        if (!getEditMode()) {  // Only handle navigation when not in edit mode
            e.preventDefault();
            // Use Twitter's history API to navigate
            if (window.history && typeof window.history.pushState === 'function') {
                window.history.pushState({}, '', url);
                // Dispatch a popstate event to trigger Twitter's router
                window.dispatchEvent(new PopStateEvent('popstate'));
            }
        }
    });

    // Insert before More button
    if (moreButton) {
        nav.insertBefore(menuItem, moreButton);
    } else {
        nav.appendChild(menuItem);
    }

    return menuItem;
}

window.ALL_MENU_ITEMS = ALL_MENU_ITEMS;
window.createMenuItem = createMenuItem; 