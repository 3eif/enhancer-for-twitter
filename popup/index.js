document.addEventListener('DOMContentLoaded', function () {
    const editModeCheckbox = document.getElementById('editMode');
    const resetButton = document.getElementById('resetButton');
    const statusDiv = document.getElementById('status');

    // Load saved state
    chrome.storage.local.get(['editMode'], function (result) {
        editModeCheckbox.checked = result.editMode || false;
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
        // Clear all storage except customItems
        chrome.storage.local.get(['customItems'], function (result) {
            const customItems = result.customItems || [];
            chrome.storage.local.clear(function () {
                // Restore customItems if there were any
                if (customItems.length > 0) {
                    chrome.storage.local.set({ customItems });
                }

                // Send reset message to content script
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'resetMenuItems'
                    });

                    // Show success message
                    statusDiv.textContent = 'Menu items restored!';
                    statusDiv.style.color = '#28a745';
                    setTimeout(() => {
                        statusDiv.textContent = '';
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
        if (editModeCheckbox) {
            editModeCheckbox.checked = message.value;
        }
    }
});
