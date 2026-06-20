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
        <div style="margin-bottom: 20px; padding: 15px; background: #222; border-radius: 4px;">
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; align-items: flex-start;">
                    <div style="width: 160px; flex-shrink: 0; font-weight: 600; color: #aaa; font-size: 13px;">Input Dividend:</div>
                    <div style="flex: 1; font-family: 'Consolas', monospace; color: #aaa; overflow-x: auto; white-space: nowrap; font-size: 14px;">${data.dividend}</div>
                </div>
                <div style="display: flex; align-items: flex-start;">
                    <div style="width: 160px; flex-shrink: 0; font-weight: 600; color: #aaa; font-size: 14px;">Input Divisor:</div>
                    <div style="flex: 1; font-family: 'Consolas', monospace; color: #aaa; font-size: 13px;">${data.divider}</div>
                </div>
                <div style="display: flex; align-items: flex-start;">
                    <div style="width: 160px; flex-shrink: 0; font-weight: 600; color: #aaa; font-size: 14px;">Result:</div>
                    <div style="flex: 1; font-family: 'Consolas', monospace; overflow-x: auto; white-space: nowrap; 
                         color: #00aa00; font-weight: 600; font-size: 14px; padding: 3px 0;">${resultHex}</div>
                </div>
            </div>
        </div>
        
        <div class="result-section">
            <h4 style="color: #aaa; font-size: 14px; font-weight: 500; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #777;">Details</h4>
            
            <!-- Dividend Point -->
            <div style="display: flex; align-items: flex-start; margin-bottom: 15px; padding: 0px 0;">
                <div style="width: 240px; flex-shrink: 0; font-weight: 600; color: #aaa; font-size: 13.5px; padding-top: 0px;">Dividend Point (G × dividend):</div>
                <div style="flex: 1; margin-left: 10px;">
                    <div style="display: flex; align-items: flex-start; margin-bottom: 8px;">
                        <span style="width: 20px; flex-shrink: 0; font-weight: 600; color: #aaa;">X:</span>
                        <span style="font-family: 'Consolas', monospace; flex: 1; overflow-x: auto; white-space: nowrap; margin-left: 20px; color: #ccc; font-size: 13px;">${data.original_point?.x || ''}</span>
                    </div>
                    <div style="display: flex; align-items: flex-start;">
                        <span style="width: 20px; flex-shrink: 0; font-weight: 600; color: #aaa;">Y:</span>
                        <span style="font-family: 'Consolas', monospace; flex: 1; overflow-x: auto; white-space: nowrap; margin-left: 20px; color: #ccc; font-size: 13px;">${data.original_point?.y || ''}</span>
                    </div>
                </div>
            </div>
            
            <!-- Divisor Inverse -->
            <div style="display: flex; align-items: flex-start; margin-bottom: 15px; padding: 0px 0;">
                <div style="width: 260px; flex-shrink: 0; font-weight: 600; color: #aaa; font-size: 13.5px; padding-top: 0px;">Divisor Inverse (mod n):</div>
                <span style="flex: 1; font-family: 'Consolas', monospace; overflow-x: auto; white-space: nowrap; margin-left: 30px; color: #ccc; font-size: 13px;">${divisorInverse}</span>
            </div>
            
            <!-- Result Point -->
            <div style="display: flex; align-items: flex-start; margin-bottom: 15px; padding: 0px 0; ">
                <div style="width: 240px; flex-shrink: 0; font-weight: 600; color: #aaa; font-size: 13.5px; padding-top: 0px;">Result Point (G × result):</div>
                <div style="flex: 1; margin-left: 10px;">
                    <div style="display: flex; align-items: flex-start; margin-bottom: 8px;">
                        <span style="width: 20px; flex-shrink: 0; font-weight: 600; color: #aaa;">X:</span>
                        <span style="font-family: 'Consolas', monospace; flex: 1; overflow-x: auto; white-space: nowrap; margin-left: 20px; color: #ccc; font-size: 13px;">${data.result_point?.x || ''}</span>
                    </div>
                    <div style="display: flex; align-items: flex-start;">
                        <span style="width: 20px; flex-shrink: 0; font-weight: 600; color: #aaa;">Y:</span>
                        <span style="font-family: 'Consolas', monospace; flex: 1; overflow-x: auto; white-space: nowrap; margin-left: 20px; color: #ccc; font-size: 13px;">${data.result_point?.y || ''}</span>
                    </div>
                </div>
            </div>
            
            <!-- Result decimal -->
            <div style="display: flex; align-items: flex-start; margin-bottom: 15px; padding: 0px 0;">
                <div style="width: 260px; flex-shrink: 0; font-weight: 600; color: #aaa; font-size: 13.5px; padding-top: 0px;">Result (decimal):</div>
                <span style="flex: 1; font-family: 'Consolas', monospace; overflow-x: auto; white-space: nowrap; margin-left: 30px; color: #ccc; font-size: 13px;">${resultDec}</span>
            </div>
            
            <!-- Modulus n -->
            <div style="display: flex; align-items: flex-start; padding: 0x 0;">
                <div style="width: 260px; flex-shrink: 0; font-weight: 600; color: #aaa; font-size: 13.5px; padding-top: 4px;">Modulus n:</div>
                <span style="flex: 1; font-family: 'Consolas', monospace; overflow-x: auto; white-space: nowrap; margin-left: 30px; color: #ccc; font-size: 13px;">${data.modulus_n || ''}</span>
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
            <div style="text-align: center; padding: 20px; color: #666;">
                <div class="spinner" style="display: inline-block; width: 20px; height: 20px; border: 2px solid #ddd; border-top: 2px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 10px;"></div>
                ${message}
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
    }
}