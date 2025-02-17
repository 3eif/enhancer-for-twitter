document.addEventListener('DOMContentLoaded', function () {
    const editModeCheckbox = document.getElementById('editMode');
    const resetButton = document.getElementById('resetButton');
    const editingInfo = document.getElementById('editingInfo');
    const statusDiv = document.getElementById('status');

    // Load saved state
    chrome.storage.local.get(['editMode'], function (result) {
        editModeCheckbox.checked = result.editMode || false;
        editingInfo.style.display = result.editMode ? 'block' : 'none';
    });

    // Save state when changed
    editModeCheckbox.addEventListener('change', function () {
        const isEditMode = this.checked;
        editingInfo.style.display = isEditMode ? 'block' : 'none';

        if (!isEditMode) {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'saveState' }, function (response) {
                    const { menuOrder, hiddenItems, customItems, hiddenProfileButtons } = response;

                    chrome.storage.local.set({
                        menuOrder,
                        hiddenItems,
                        customItems,
                        hiddenProfileButtons,
                        editMode: false
                    }, function () {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            action: 'toggleEditMode',
                            editMode: false
                        });
                    });
                });
            });
        } else {
            chrome.storage.local.set({ editMode: true });
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'toggleEditMode',
                    editMode: true
                });
            });
        }
    });

    // Handle reset button click
    resetButton.addEventListener('click', function () {
        this.disabled = true;

        chrome.storage.local.get(['customItems'], function (result) {
            const customItems = result.customItems || [];
            chrome.storage.local.clear(function () {
                if (customItems.length > 0) {
                    chrome.storage.local.set({ customItems });
                }

                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'resetMenuItems'
                    });

                    statusDiv.textContent = 'Your changes have been reset!';
                    setTimeout(() => {
                        statusDiv.textContent = '';
                        resetButton.disabled = false;
                    }, 2000);
                });
            });
        });
    });
});

// Message listener for edit mode updates
chrome.runtime.onMessage.addListener(function (message) {
    if (message.action === 'updateEditMode') {
        const editModeCheckbox = document.getElementById('editMode');
        const editingInfo = document.getElementById('editingInfo');
        if (editModeCheckbox) {
            editModeCheckbox.checked = message.value;
            editingInfo.style.display = message.value ? 'block' : 'none';
        }
    }
});
