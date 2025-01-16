startObserver();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'saveState') {
        const menuItems = document.querySelectorAll('nav[role="navigation"] a');
        const menuOrder = [];
        const hiddenItems = [];
        const customItems = [];

        const profileButtons = document.querySelectorAll('.css-175oi2r.r-obd0qt.r-18u37iz button');
        const hiddenProfileButtons = [];

        profileButtons.forEach(button => {
            const ariaLabel = button.getAttribute('aria-label');
            if (ariaLabel && button.closest('.css-175oi2r.r-sdzlij').style.display === 'none') {
                hiddenProfileButtons.push(ariaLabel);
            }
        });

        menuItems.forEach(item => {
            const itemText = item.querySelector('[dir="ltr"] span')?.textContent?.trim().toLowerCase();
            if (itemText) {
                menuOrder.push(itemText);
                if (item.style.display === 'none') {
                    hiddenItems.push(itemText);
                }
                if (item.dataset.custom) {
                    customItems.push(itemText);
                }
            }
        });

        sendResponse({ menuOrder, hiddenItems, customItems, hiddenProfileButtons });
        return true;
    }
}); 