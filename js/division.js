/* -------------------------------------------------------------------------------------*/
/* ----------------------------------- CRIPTONIST.COM ----------------------------------*/
/* ------------------------------ Channel t.me/CRIPTONIST ------------------------------*/
/* -------------------------------------------------------------------------------------*/
/* --Thank you for using my software for your calculations. I hope you find it useful.--*/
/* --The software does not collect data and operates exclusively on the user's device.--*/
/* -------------------------------------------------------------------------------------*/

function setupDivision() {
    const divideBtn = document.getElementById('divideCurveBtn');
    const copyBtn = document.getElementById('copyDivisionBtn');
    
    if (divideBtn) divideBtn.addEventListener('click', calculateDivision);
    if (copyBtn) copyBtn.addEventListener('click', copyDivisionResults);
}

async function calculateDivision() {
    if (!isServerOnline()) {
        showNotification('Start Python server first! Command: python server.py', true);
        checkServerStatus();
        return;
    }
    
    const dividendHex = document.getElementById('dividendInput')?.value.trim();
    const dividerHex = document.getElementById('dividerInput')?.value.trim();
    const resultDiv = document.getElementById('divisionResult');
    const contentDiv = document.getElementById('divisionContent');
    const divideBtn = document.getElementById('divideCurveBtn');
    
    if (!dividendHex || !dividerHex) {
        showNotification('Enter both dividend and divisor in HEX format', true);
        return;
    }
    
    let dividend = dividendHex.replace(/^0x/i, '').trim();
    let divider = dividerHex.replace(/^0x/i, '').trim();
    
    if (!validateHexInput(dividend)) {
        showNotification('Invalid HEX format for dividend. Use only: 0-9, a-f, A-F', true);
        return;
    }
    
    if (!validateHexInput(divider)) {
        showNotification('Invalid HEX format for divisor. Use only: 0-9, a-f, A-F', true);
        return;
    }
    
    if (divider === '0') {
        showNotification('Divisor cannot be zero', true);
        return;
    }
    
    showButtonLoading(divideBtn, 'Divide on curve');
    
    if (resultDiv) resultDiv.style.display = 'block';
    if (contentDiv) showLoading('divisionContent', 'Calculating elliptic curve division...');
    
    try {
        const data = await callServer('ec-division', { 
            dividend: dividend,
            divider: divider
        });
        
        showDivisionResults(data);
        showNotification('Elliptic curve division calculated successfully!');
        
    } catch (error) {
        console.error('Division error:', error);
        if (contentDiv) {
            contentDiv.innerHTML = `
                <div class="error-message">
                    <strong>Error:</strong> ${error.message}
                </div>
            `;
        }
        showNotification(`Error: ${error.message}`, true);
    } finally {
        restoreButton(divideBtn);
    }
}

function showDivisionResults(data) {
    const contentDiv = document.getElementById('divisionContent');
    if (!contentDiv) return;
    
    const resultHex = data.result_scalar_hex || data.result || '';
    const resultDec = data.result_scalar_dec || '';
    const divisorInverse = data.inverse_hex || '';
    
    contentDiv.innerHTML = `
        <div class="division-summary">
            <div class="division-row">
                <div class="division-row-label">Input Dividend:</div>
                <div class="division-row-value">${data.dividend}</div>
            </div>
            <div class="division-row">
                <div class="division-row-label">Input Divisor:</div>
                <div class="division-row-value">${data.divider}</div>
            </div>
            <div class="division-row">
                <div class="division-row-label">Result:</div>
                <div class="division-row-value highlight">${resultHex}</div>
            </div>
        </div>
        
        <div class="result-section">
            <h4>Details</h4>
            
            <!-- Dividend Point -->
            <div class="data-row">
                <div class="data-label">Dividend Point (G × dividend) X:</div>
                <div class="data-value">${data.original_point?.x || ''}</div>
            </div>
            <div class="data-row">
                <div class="data-label">Dividend Point (G × dividend) Y:</div>
                <div class="data-value">${data.original_point?.y || ''}</div>
            </div>
            
            <!-- Divisor Inverse -->
            <div class="data-row">
                <div class="data-label">Divisor Inverse (mod n):</div>
                <div class="data-value">${divisorInverse}</div>
            </div>
            
            <!-- Result Point -->
            <div class="data-row">
                <div class="data-label">Result Point (G × result) X:</div>
                <div class="data-value">${data.result_point?.x || ''}</div>
            </div>
            <div class="data-row">
                <div class="data-label">Result Point (G × result) Y:</div>
                <div class="data-value">${data.result_point?.y || ''}</div>
            </div>
            
            <!-- Result decimal -->
            <div class="data-row">
                <div class="data-label">Result (decimal):</div>
                <div class="data-value">${resultDec}</div>
            </div>
            
            <!-- Modulus n -->
            <div class="data-row">
                <div class="data-label">Modulus n:</div>
                <div class="data-value">${data.modulus_n || ''}</div>
            </div>
        </div>
    `;
}

async function copyDivisionResults() {
    const contentDiv = document.getElementById('divisionContent');
    if (!contentDiv || !contentDiv.textContent || contentDiv.textContent.includes('Loading')) {
        showNotification('No results to copy', true);
        return;
    }
    
    const text = contentDiv.innerText;
    await copyToClipboard(text);
}
    
function showLoading(elementId, message = 'Loading...') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                ${message}
            </div>
        `;
    }
}
