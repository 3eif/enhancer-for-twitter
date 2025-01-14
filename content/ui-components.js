function showAddItemsDialog() {
    // Remove existing dialog if present
    const existingDialog = document.querySelector('#addItemsDialog');
    if (existingDialog) existingDialog.remove();

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

    // Get currently visible items
    const nav = document.querySelector('nav[role="navigation"]');
    const currentItems = [...nav.querySelectorAll('a[role="link"]')].map(item =>
        item.querySelector('[dir="ltr"] span')?.textContent?.trim()
    ).filter(Boolean);

    // Add menu items
    ALL_MENU_ITEMS.forEach(item => {
        // Skip if item is already in the menu
        if (currentItems.includes(item.name)) return;

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

        itemButton.addEventListener('mouseover', () => {
            itemButton.style.background = '#1d1f23';
        });
        itemButton.addEventListener('mouseout', () => {
            itemButton.style.background = '#16181c';
        });
        itemButton.addEventListener('click', () => {
            const menuItem = createMenuItem(item.name, item.url, item.icon);
            if (getEditMode()) {
                menuItem.setAttribute('draggable', 'true');
                setupDragAndDrop(menuItem);

                // Add a container for the strikethrough effect with exact same styling
                const contentContainer = menuItem.querySelector('div[dir="ltr"]') || menuItem;

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
                menuItem.style.position = 'relative';
                menuItem.appendChild(container);

                // Add drag handle
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
                menuItem.appendChild(dragHandle);

                // Add hover handlers
                menuItem.addEventListener('mouseenter', () => {
                    if (getEditMode()) {
                        dragHandle.style.display = 'block';
                        const container = menuItem.querySelector('.strike-container');
                        if (container) {
                            container.style.display = 'block';
                        }
                    }
                });
                menuItem.addEventListener('mouseleave', () => {
                    dragHandle.style.display = 'none';
                    const container = menuItem.querySelector('.strike-container');
                    if (container) {
                        container.style.display = 'none';
                    }
                });

                // Add click handler for hiding
                menuItem.addEventListener('click', (e) => {
                    if (getEditMode()) {
                        e.preventDefault();
                        e.stopPropagation();
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
                });
            }
            dialog.remove();
            backdrop.remove();
        });
        dialog.appendChild(itemButton);
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

function addDoneButton(editMode, postButton) {
    if (!postButton || document.querySelector('#menuDoneButton')) return;

    // Hide the Post button
    postButton.style.display = 'none';

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

        console.log('Done button clicked - saving menu state and disabling edit mode');

        // Get all menu items
        const menuItems = [...nav.querySelectorAll('a[role="link"]')];

        // Save menu state first
        const visibleItems = menuItems.filter(item => {
            const name = item.querySelector('[dir="ltr"] span')?.textContent?.trim();
            const isVisible = window.getComputedStyle(item).display !== 'none';
            const isMoreButton = name === 'More';
            return name && isVisible && !isMoreButton;
        });

        const menuOrder = visibleItems
            .map(item => item.querySelector('[dir="ltr"] span')?.textContent?.trim())
            .filter(Boolean);

        const hiddenItems = menuItems
            .filter(item => window.getComputedStyle(item).display === 'none')
            .map(item => item.querySelector('[dir="ltr"] span')?.textContent?.trim())
            .filter(Boolean);

        // Get custom items
        const defaultItems = ['Home', 'Explore', 'Notifications', 'Messages'];
        const customItems = visibleItems
            .filter(item => {
                const name = item.querySelector('[dir="ltr"] span')?.textContent?.trim();
                return name && !defaultItems.includes(name);
            })
            .map(item => ({
                name: item.querySelector('[dir="ltr"] span')?.textContent?.trim(),
                url: item.getAttribute('href'),
                icon: item.querySelector('svg path')?.getAttribute('d')
            }))
            .filter(item => item.name && item.url && item.icon);

        // Save to storage
        chrome.storage.local.set({
            menuOrder,
            hiddenItems,
            customItems,
            editMode: false
        }, function () {
            // Disable all menu item interactions
            menuItems.forEach(item => {
                // Remove draggable attribute and event listeners
                item.removeAttribute('draggable');
                item.style.cursor = 'pointer';

                // Remove all event listeners by cloning and replacing
                const newItem = item.cloneNode(true);
                item.parentNode.replaceChild(newItem, item);

                // Remove any strike-through elements
                const strikeContainer = newItem.querySelector('.strike-container');
                if (strikeContainer) {
                    strikeContainer.remove();
                }
            });

            // Remove edit mode UI
            document.querySelectorAll('.strike-container').forEach(el => el.remove());
            document.querySelector('#addMenuItemsButton')?.remove();

            // Show the Post button and remove Done button
            postButton.style.display = '';
            doneButton.remove();

            // Add CSS to prevent jiggling
            const styleId = 'menu-stabilizer';
            let styleEl = document.getElementById(styleId);
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = styleId;
                document.head.appendChild(styleEl);
            }

            styleEl.textContent = `
                nav[role="navigation"] a[role="link"] {
                    transform: none !important;
                    transition: none !important;
                }
                nav[role="navigation"] a[role="link"]:hover {
                    transform: none !important;
                    background-color: transparent !important;
                }
                nav[role="navigation"] a[role="link"] > div {
                    transform: none !important;
                    transition: none !important;
                }
            `;

            // Remove edit mode class and update popup
            document.body.classList.remove('edit-mode');
            chrome.runtime.sendMessage({ action: 'updateEditMode', value: false });
        });
    });

    // Insert in place of the Post button
    postButton.parentNode.insertBefore(doneButton, postButton);
}

window.showAddItemsDialog = showAddItemsDialog;
window.addDoneButton = addDoneButton; 