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
                    <strong>Error:</strong> ${escapeHtml(error.message)}
                </div>
            `;
        }
        showNotification(`Error: ${error.message}`, true);
    } finally {
        restoreButton(searchBtn);
    }
}

/**
 * Escapes special HTML characters to prevent broken markup / XSS when
 * inserting server-provided or user-provided strings into innerHTML.
 */
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function showSearchPlusResults(data) {
    const contentDiv = document.getElementById('searchContent');
    if (!contentDiv) return;

    const inputKey = escapeHtml(data.input);
    const bits = escapeHtml(data.bits);
    const totalCount = escapeHtml(data.total_count);
    const pubX = escapeHtml(data.original_pubkey?.x || '');
    const pubY = escapeHtml(data.original_pubkey?.y || '');

    let html = `
        <div class="search-summary-block" style="margin-bottom: 16px; padding: 14px; background: #222; border-radius: 4px; font-size: 14px; line-height: 1.6;">
            <div class="summary-row">
                <strong style="color: #aaa;">Input Private Key:</strong>
                <span style="color: #aaa; word-break: break-all;">${inputKey}</span>
            </div>
            <div class="summary-row">
                <strong style="color: #aaa;">Bits:</strong>
                <span style="color: #aaa;">${bits} (${totalCount} points)</span>
            </div>
            <div class="summary-row">
                <strong style="color: #aaa;">Original Public Key:</strong>
                <span style="color: #aaa; word-break: break-all;">X: ${pubX} Y: ${pubY}</span>
            </div>
        </div>

        <div class="result-section">
            <h4>Generated Points and Private Keys</h4>
    `;

    html += '<div class="points-grid">';

    data.points.forEach((point, index) => {
        const x = escapeHtml(point.x);
        const y = escapeHtml(point.y);
        const privateKey = escapeHtml(point.private_key);

        html += `
            <div class="search-point-block">
                <div class="point-header">
                    <span style="flex: 1; color: #ddd; font-size: 14px; font-family: 'Consolas', monospace; word-break: break-all;">
                        X: <span style="font-weight: 400;">${x}</span><br>
                        Y: <span style="font-weight: 400;">${y}</span>
                    </span>
                </div>
                <div class="private-key-line" style="margin-top: 10px;">
                    <span class="private-label" style="font-size: 14px; color: #eee;">Private Key:</span>
                    <span class="private-key-value" style="flex: 1; word-break: break-all; font-family: 'Consolas', monospace; font-size: 14px; color: #00bb00; font-weight: 600;">${privateKey}</span>
                    <button class="copy-btn" style="margin-left: 8px; font-size: 10px; flex-shrink: 0;"
                            type="button" data-private-key="${privateKey}">Copy</button>
                </div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    contentDiv.innerHTML = html;

    // Use delegated, addEventListener-based handlers instead of inline
    // onclick="...${value}..." strings. Inline onclick breaks (and can be
    // unsafe) when the value contains quotes/special chars, and binding the
    // listener directly is more reliable across mobile browsers than
    // relying on attribute-based handlers.
    contentDiv.querySelectorAll('.copy-btn[data-private-key]').forEach(btn => {
        btn.addEventListener('click', () => {
            copyToClipboard(btn.getAttribute('data-private-key'));
        });
    });
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
