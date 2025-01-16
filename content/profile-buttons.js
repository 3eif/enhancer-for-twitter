const PROTECTED_BUTTONS = ['More', 'Following', 'Follow'];

function addJiggleStyles() {
    if (!document.querySelector('#profileJiggleStyle')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'profileJiggleStyle';
        styleSheet.textContent = `
            @keyframes profileJiggle1 {
                0% { transform: translate3d(0, 0, 0) rotate(0deg); }
                25% { transform: translate3d(-1px, 1px, 0) rotate(-1deg); }
                50% { transform: translate3d(0, -1px, 0) rotate(0deg); }
                75% { transform: translate3d(1px, 1px, 0) rotate(1deg); }
                100% { transform: translate3d(0, 0, 0) rotate(0deg); }
            }
            @keyframes profileJiggle2 {
                0% { transform: translate3d(0, 0, 0) rotate(0deg); }
                25% { transform: translate3d(1px, -1px, 0) rotate(1deg); }
                50% { transform: translate3d(-1px, 0, 0) rotate(0deg); }
                75% { transform: translate3d(0, 1px, 0) rotate(-1deg); }
                100% { transform: translate3d(0, 0, 0) rotate(0deg); }
            }
            @keyframes profileJiggle3 {
                0% { transform: translate3d(0, 0, 0) rotate(0deg); }
                25% { transform: translate3d(-1px, 0, 0) rotate(-0.5deg); }
                50% { transform: translate3d(1px, 1px, 0) rotate(0.5deg); }
                75% { transform: translate3d(0, -1px, 0) rotate(-0.5deg); }
                100% { transform: translate3d(0, 0, 0) rotate(0deg); }
            }
            .profile-button-jiggle1 {
                animation: profileJiggle1 0.45s infinite linear !important;
                transform-origin: center center !important;
                will-change: transform;
            }
            .profile-button-jiggle2 {
                animation: profileJiggle2 0.5s infinite linear !important;
                transform-origin: center center !important;
                will-change: transform;
            }
            .profile-button-jiggle3 {
                animation: profileJiggle3 0.4s infinite linear !important;
                transform-origin: center center !important;
                will-change: transform;
            }
        `;
        document.head.appendChild(styleSheet);
    }
}

function makeButtonsEditable() {
    addJiggleStyles();

    const profileButtonsContainer = document.querySelector('.css-175oi2r.r-obd0qt.r-18u37iz');
    if (!profileButtonsContainer) return;

    const buttons = profileButtonsContainer.querySelectorAll('button');
    buttons.forEach((button, index) => {
        const ariaLabel = button.getAttribute('aria-label');
        if (!ariaLabel || PROTECTED_BUTTONS.some(label => ariaLabel.includes(label))) return;

        const buttonContainer = button.closest('.css-175oi2r.r-sdzlij');
        if (buttonContainer) {
            buttonContainer.classList.remove('profile-button-jiggle1', 'profile-button-jiggle2', 'profile-button-jiggle3');

            const jiggleClass = `profile-button-jiggle${Math.floor(Math.random() * 3) + 1}`;
            buttonContainer.classList.add(jiggleClass);
            buttonContainer.style.position = 'relative';
            buttonContainer.style.animationDelay = `${Math.random() * -0.8}s`;
        }

        const existingDeleteBtn = buttonContainer.querySelector('.profile-button-delete');
        if (existingDeleteBtn) {
            existingDeleteBtn.remove();
        }

        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'profile-button-delete';
        deleteBtn.innerHTML = '×';
        deleteBtn.style.cssText = `
            position: absolute;
            top: -8px;
            right: -8px;
            background: #ff3b30;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            z-index: 1000;
        `;

        // Add delete button to the container
        if (buttonContainer) {
            buttonContainer.appendChild(deleteBtn);
        }

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!getEditMode()) return;

            chrome.storage.local.get(['hiddenProfileButtons'], function (result) {
                const hiddenButtons = result.hiddenProfileButtons || [];
                if (!hiddenButtons.includes(ariaLabel)) {
                    hiddenButtons.push(ariaLabel);
                    chrome.storage.local.set({ hiddenProfileButtons: hiddenButtons }, () => {
                        buttonContainer.style.display = 'none';
                    });
                }
            });
        });
    });
}

function restoreProfileButtons() {
    chrome.storage.local.get(['hiddenProfileButtons'], function (result) {
        const hiddenButtons = result.hiddenProfileButtons || [];
        const profileButtonsContainer = document.querySelector('.css-175oi2r.r-obd0qt.r-18u37iz');
        if (!profileButtonsContainer) return;

        const buttons = profileButtonsContainer.querySelectorAll('button');
        buttons.forEach(button => {
            const ariaLabel = button.getAttribute('aria-label');
            if (!ariaLabel || PROTECTED_BUTTONS.some(label => ariaLabel.includes(label))) return;

            const buttonContainer = button.closest('.css-175oi2r.r-sdzlij');
            if (buttonContainer) {
                buttonContainer.style.display = hiddenButtons.includes(ariaLabel) ? 'none' : '';

                if (!getEditMode()) {
                    buttonContainer.classList.remove('profile-button-jiggle1', 'profile-button-jiggle2', 'profile-button-jiggle3');
                    const deleteBtn = buttonContainer.querySelector('.profile-button-delete');
                    if (deleteBtn) {
                        deleteBtn.remove();
                    }
                }
            }
        });
    });
}

function initializeProfileButtons() {
    const observer = new MutationObserver((mutations, obs) => {
        const profileButtonsContainer = document.querySelector('.css-175oi2r.r-obd0qt.r-18u37iz');
        if (profileButtonsContainer) {
            restoreProfileButtons();

            const containerObserver = new MutationObserver(() => {
                restoreProfileButtons();
            });

            containerObserver.observe(profileButtonsContainer, {
                childList: true,
                subtree: true
            });

            if (getEditMode()) {
                makeButtonsEditable();
            }

            obs.disconnect();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'toggleEditMode') {
        if (message.editMode) {
            makeButtonsEditable();
        } else {
            restoreProfileButtons();
        }
    } else if (message.action === 'resetMenuItems') {
        chrome.storage.local.remove(['hiddenProfileButtons'], () => {
            restoreProfileButtons();
        });
    }
});

initializeProfileButtons();

window.makeButtonsEditable = makeButtonsEditable;
window.restoreProfileButtons = restoreProfileButtons;