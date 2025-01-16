// Storage helper functions
function debugStorage() {
    chrome.storage.local.get(null, function (items) {
        // console.log('Current storage state:', items);
    });
}

async function getHiddenItems() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['hiddenItems'], function (result) {
            resolve(result.hiddenItems || []);
        });
    });
}

function saveMenuOrder() {
    const nav = document.querySelector('nav[role="navigation"]');
    if (!nav) return;

    const menuOrder = [...nav.querySelectorAll('a[role="link"]')]
        .map(item => item.querySelector('[dir="ltr"] span')?.textContent?.trim())
        .filter(Boolean)
        .filter(name => name.toLowerCase() !== 'more');

    chrome.storage.local.set({ menuOrder });
}

function resetMenuItems() {
    chrome.storage.local.clear(function () {
        // Reload the page to restore default Twitter layout
        window.location.reload();
    });
}

window.debugStorage = debugStorage;
window.getHiddenItems = getHiddenItems;
window.saveMenuOrder = saveMenuOrder;
window.resetMenuItems = resetMenuItems; 