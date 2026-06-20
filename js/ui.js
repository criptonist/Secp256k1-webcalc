/* -------------------------------------------------------------------------------------*/
/* ----------------------------------- CRIPTONIST.COM ----------------------------------*/
/* ------------------------------ Channel t.me/CRIPTONIST ------------------------------*/
/* -------------------------------------------------------------------------------------*/
/* --Thank you for using my software for your calculations. I hope you find it useful.--*/
/* --The software does not collect data and operates exclusively on the user's device.--*/
/* -------------------------------------------------------------------------------------*/

let notificationTimeout;

function showNotification(message, isError = false) {
    const notification = document.getElementById('copyNotification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.style.background = isError ? '#cc0000' : '#000';
    
    notification.classList.add('show');
    
    if (notificationTimeout) clearTimeout(notificationTimeout);
    
    notificationTimeout = setTimeout(() => {
        notification.classList.remove('show');
    }, 1000);
}

function showResult(elementId, text, isError = false) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.textContent = text;
    element.classList.add('show');
    
    if (isError) {
        element.classList.add('error');
    } else {
        element.classList.remove('error');
    }
}

function showPathError(message) {
    const errorDiv = document.getElementById('pathError');
    if (!errorDiv) return;
    
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

function clearPathError() {
    const errorDiv = document.getElementById('pathError');
    if (!errorDiv) return;
    
    errorDiv.textContent = '';
    errorDiv.classList.remove('show');
}

function showLoading(elementId, message = 'Loading...') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>${message}</p>
        </div>
    `;
}

function showButtonLoading(button, loadingText = 'Loading...') {
    if (!button) return;
    
    button.dataset.originalText = button.textContent;
    button.textContent = loadingText;
    button.disabled = true;
}

function restoreButton(button) {
    if (!button || !button.dataset.originalText) return;
    
    button.textContent = button.dataset.originalText;
    button.disabled = false;
    delete button.dataset.originalText;
}

async function copyToClipboard(text) {
    if (!text || text === 'N/A') {
        showNotification('Nothing to copy', true);
        return;
    }
    
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Copied to clipboard!');
    } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Copied to clipboard!');
    }
}