/* -------------------------------------------------------------------------------------*/
/* ----------------------------------- CRIPTONIST.COM ----------------------------------*/
/* ------------------------------ Channel t.me/CRIPTONIST ------------------------------*/
/* -------------------------------------------------------------------------------------*/
/* --Thank you for using my software for your calculations. I hope you find it useful.--*/
/* --The software does not collect data and operates exclusively on the user's device.--*/
/* -------------------------------------------------------------------------------------*/

function setupSearchPlus() {
    const searchBtn = document.getElementById('searchBtn');
    const copyBtn = document.getElementById('copySearchBtn');
    
    if (searchBtn) searchBtn.addEventListener('click', calculateSearchPlus);
    if (copyBtn) copyBtn.addEventListener('click', copySearchResults);
}

async function calculateSearchPlus() {
    if (!isServerOnline()) {
        showNotification('Start Python server first! Command: python server.py', true);
        checkServerStatus();
        return;
    }
    
    const privateKey = document.getElementById('searchPrivKey')?.value.trim();
    const bits = parseInt(document.getElementById('searchBits')?.value || '1');
    const resultDiv = document.getElementById('searchResult');
    const contentDiv = document.getElementById('searchContent');
    const searchBtn = document.getElementById('searchBtn');
    
    if (!privateKey) {
        showNotification('Enter private key in HEX format', true);
        return;
    }
    
    let privKey = privateKey.replace(/^0x/i, '').trim();
    
    if (!validateHexInput(privKey)) {
        showNotification('Invalid HEX format. Use only: 0-9, a-f, A-F', true);
        return;
    }
    
    if (bits < 1 || bits > 4) {
        showNotification('Bits must be between 1 and 4', true);
        return;
    }
    
    showButtonLoading(searchBtn, 'Calculate Range');
    
    if (resultDiv) resultDiv.classList.add('show');
    if (contentDiv) showLoading('searchContent', `Calculating range reduction (${bits} bits, ${1 << bits} points)...`);
    
    try {
        const data = await callServer('search-plus', { 
            priv: privKey,
            bits: bits
        });
        
        showSearchPlusResults(data);
        showNotification(`Range reduction calculated successfully! Generated ${data.points.length} points.`);
        
    } catch (error) {
        console.error('Search plus error:', error);
        if (contentDiv) {
            contentDiv.innerHTML = `
                <div class="error-message">
                    <strong>Error:</strong> ${error.message}
                </div>
            `;
        }
        showNotification(`Error: ${error.message}`, true);
    } finally {
        restoreButton(searchBtn);
    }
}

function showSearchPlusResults(data) {
    const contentDiv = document.getElementById('searchContent');
    if (!contentDiv) return;
    
    let html = `
        <div style="margin-bottom: 16px; padding: 14px; background: #222; border-radius: 4px; font-size: 14px; line-height: 1.5;">
            <strong style="color: #aaa;margin-left: 11px;">Input Private Key:</strong> 
            <span style="color: #aaa;">&nbsp;&nbsp;${data.input}</span>
            <br><strong style="color: #aaa; margin-left: 99px; ">Bits:</strong> 
            <span style="color: #aaa;">&nbsp;&nbsp;${data.bits}</span> 
            <span style="color: #aaa;">(${data.total_count} points)</span>
            <br><strong style="color: #aaa;">Original Public Key:</strong> 
            <span style="color: #aaa;">&nbsp;&nbsp;X: ${data.original_pubkey?.x || ''} Y: ${data.original_pubkey?.y || ''}</span>
        </div>
    
        <div class="result-section">
            <h4>Generated Points and Private Keys</h4>
    `;
    
    html += '<div class="points-grid">';
    
    data.points.forEach((point, index) => {
        html += `
            <div class="search-point-block">
                <div class="point-header">
                    <span style="flex: 1; color: #ddd; font-size: 14px; font-family: 'Consolas', monospace;">
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;X: <span style="font-weight: 400;">${point.x}</span>
                        Y: <span style="font-weight: 400;">${point.y}</span>
                    </span>
                </div>               
                <div class="private-key-line" style="margin-top: 10px;">
                    <span class="private-label" style="font-size: 14px; color: #eee;">Private Key:</span>
                    <span style="flex: 1; word-break: break-all; font-family: 'Consolas', monospace; font-size: 14px; color: #00bb00; font-weight: 600;">${point.private_key}</span>
                    <button class="copy-btn" style="margin-left: 8px; font-size: 10px; flex-shrink: 0;" 
                            onclick="copyToClipboard('${point.private_key}')">Copy</button>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    contentDiv.innerHTML = html;
}

async function copySearchResults() {
    const resultDiv = document.getElementById('searchContent');
    if (!resultDiv || !resultDiv.textContent || resultDiv.textContent.includes('Loading')) {
        showNotification('No results to copy', true);
        return;
    }
    
    const text = resultDiv.innerText;
    await copyToClipboard(text);
}