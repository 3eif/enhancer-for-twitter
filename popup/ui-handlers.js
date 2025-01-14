import { ALL_MENU_ITEMS } from '../content/menu-items.js';

export function setupPopupHandlers() {
    const editModeCheckbox = document.getElementById('editMode');
    const resetButton = document.getElementById('resetButton');
    const addItemButton = document.getElementById('addItemButton');
    const addItemForm = document.getElementById('addItemForm');
    const saveItemButton = document.getElementById('saveItemButton');
    const statusDiv = document.getElementById('status');

    // Load saved state
    chrome.storage.local.get(['editMode'], function (result) {
        editModeCheckbox.checked = result.editMode || false;
    });

    // Toggle add item form
    addItemButton.addEventListener('click', function () {
        addItemForm.classList.toggle('visible');
        if (!addItemForm.classList.contains('visible')) {
            document.getElementById('itemName').value = '';
            document.getElementById('itemUrl').value = '';
        }
    });

    // Save new menu item
    saveItemButton.addEventListener('click', function () {
        const name = document.getElementById('itemName').value.trim();
        const url = document.getElementById('itemUrl').value.trim();

        if (!name || !url) {
            statusDiv.textContent = 'Please fill in all fields';
            statusDiv.style.color = '#dc3545';
            return;
        }

        // Find matching menu item from ALL_MENU_ITEMS or use default icon
        const menuItem = ALL_MENU_ITEMS.find(item =>
            item.name.toLowerCase() === name.toLowerCase() ||
            item.url === url
        );

        const icon = menuItem ? menuItem.icon : 'M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z';

        chrome.storage.local.get(['customItems'], function (result) {
            const customItems = result.customItems || [];
            const newItem = { name, url, icon };

            // Check if item already exists
            const exists = customItems.some(item =>
                item.name.toLowerCase() === name.toLowerCase() ||
                item.url === url
            );

            if (!exists) {
                customItems.push(newItem);
                chrome.storage.local.set({ customItems }, function () {
                    // Send message to content script to add the new item
                    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            action: 'addMenuItem',
                            item: newItem
                        });
                    });

                    // Clear form and show success message
                    document.getElementById('itemName').value = '';
                    document.getElementById('itemUrl').value = '';
                    addItemForm.classList.remove('visible');

                    statusDiv.textContent = 'Menu item added!';
                    statusDiv.style.color = '#28a745';
                    setTimeout(() => {
                        statusDiv.textContent = '';
                    }, 2000);
                });
            } else {
                statusDiv.textContent = 'This menu item already exists';
                statusDiv.style.color = '#dc3545';
                setTimeout(() => {
                    statusDiv.textContent = '';
                }, 2000);
            }
        });
    });

    // Save state when changed
    editModeCheckbox.addEventListener('change', function () {
        chrome.storage.local.set({ editMode: this.checked });

        // Send message to content script
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'toggleEditMode',
                editMode: editModeCheckbox.checked
            });
        });
    });

    // Handle reset button click
    resetButton.addEventListener('click', function () {
        // Clear all storage completely
        chrome.storage.local.clear(function () {
            // Send reset message to content script
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'resetMenuItems'
                }, function () {
                    // Reload the current tab after clearing storage
                    chrome.tabs.reload(tabs[0].id);

                    // Close the popup
                    window.close();
                });
            });
        });
    });
} 