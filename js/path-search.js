/* -------------------------------------------------------------------------------------*/
/* ----------------------------------- CRIPTONIST.COM ----------------------------------*/
/* ------------------------------ Channel t.me/CRIPTONIST ------------------------------*/
/* -------------------------------------------------------------------------------------*/
/* --Thank you for using my software for your calculations. I hope you find it useful.--*/
/* --The software does not collect data and operates exclusively on the user's device.--*/
/* -------------------------------------------------------------------------------------*/

let currentPathResults = null;
let showAllPathSteps = false;
let activeHeatmapTooltipHex = null;

function setupPathSearch() {
    const pathKeyInput = document.getElementById('pathPrivateKey');
    const pathCounter = document.getElementById('pathKeyCounter');
    if (pathKeyInput && pathCounter) {
        pathCounter.textContent = pathKeyInput.value.length;
        pathCounter.style.color = '#999';
    }

    generatePathRandomKey();

    // Hide the heatmap tooltip when tapping anywhere outside a heatmap
    // block. Needed because mobile has no mouseleave to dismiss it.
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.heatmap-block')) {
            hideHeatmapTooltip();
        }
    }, true);
}

function generatePathRandomKey() {
    const pathPrivateKey = document.getElementById('pathPrivateKey');
    if (!pathPrivateKey) return;

    const randomKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    const n = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
    let keyBigInt = BigInt('0x' + randomKey);

    while (keyBigInt === 0n || keyBigInt >= n) {
        const newRandomKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        keyBigInt = BigInt('0x' + newRandomKey);
    }

    const hexKey = keyBigInt.toString(16).padStart(64, '0');
    pathPrivateKey.value = hexKey;

    const counter = document.getElementById('pathKeyCounter');
    if (counter) {
        counter.textContent = hexKey.length;
        counter.style.color = '#999';
    }

    pathPrivateKey.dispatchEvent(new Event('input'));

    showNotification('Random private key generated!');
}

async function calculatePathSearch(algorithm) {
    if (!isServerOnline()) {
        showPathError('Start Python server first!');
        checkServerStatus();
        return;
    }

    const privateKey = document.getElementById('pathPrivateKey')?.value.trim();
    const resultDiv = document.getElementById('pathResult');
    const contentDiv = document.getElementById('pathContent');
    const loadingDiv = document.getElementById('pathLoading');

    let cleanKey = privateKey?.trim().replace(/^0x/i, '') || '';

    if (!cleanKey) {
        showPathError('Enter private key');
        return;
    }

    if (!validateHexInput(cleanKey)) {
        showPathError(' >>> WARNING! <<< Invalid HEX format');
        return;
    }

    if (loadingDiv) loadingDiv.style.display = 'block';
    clearPathError();

    if (resultDiv) resultDiv.style.display = 'none';

    try {
        const data = await callServer('path-search', {
            priv: cleanKey,
            algorithm: algorithm
        });

        if (loadingDiv) loadingDiv.style.display = 'none';
        showPathResults(data, algorithm);
        if (resultDiv) resultDiv.style.display = 'block';

        showNotification('Path calculation completed!');

    } catch (error) {
        if (loadingDiv) loadingDiv.style.display = 'none';
        showPathError('Calculation error: ' + error.message);
    }
}

/**
 * Escapes special HTML characters to prevent broken markup / XSS when
 * inserting server-provided strings into innerHTML.
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

function showPathResults(result, algorithm) {
    const contentDiv = document.getElementById('pathContent');
    if (!contentDiv) return;

    const visibleFirstRows = 5;
    const visibleLastRows = 1;
    const showAll = showAllPathSteps;

    const inputKey = escapeHtml(result.input_key);

    let html = `
        <div class="path-summary-block" style="margin-bottom: 16px; padding: 12px; background: #222; border-radius: 4px; font-size: 14px; line-height: 1.6; color: #aaa;">
            <div class="summary-row">
                <strong>Input Key:</strong>
                <span style="word-break: break-all;">${inputKey}</span>
            </div>
            <div class="summary-row">
                <strong>Algorithm:</strong>
                <span>${algorithm === 'even' ? 'Correct (even)' : 'Random'}</span>
            </div>
            <div class="summary-row">
                <strong>Total Steps:</strong>
                <span>${escapeHtml(result.total_steps)}</span>
            </div>
            <div class="summary-row">
                <strong>Reached 0x1:</strong>
                <span>${result.reached_one ? 'Yes' : 'No (stopped at max steps)'}</span>
            </div>
        </div>

        <div class="result-section">
            <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid rgba(238, 238, 238, 0.5);">
                <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 15px;">
                    <h4 style="margin: 0; font-size: 1.1em; color: #eee; font-weight: 600;">
                        ${algorithm === 'even' ? 'Correct path' : 'Random path'}
                    </h4>
                    ${result.path.length > visibleFirstRows + visibleLastRows ? `
                        <button onclick="toggleAllPathSteps()" id="showAllPathBtn"
                                type="button"
                                style="padding: 6px 12px; background: #555; border: 1px solid #555; cursor: pointer;
                                       font-weight: 600; font-size: 0.85em; border-radius: 4px; color: #00bb00;">
                            ${showAll ? 'View Less' : 'View all'}
                        </button>
                    ` : ''}
                </div>

                <span style="background: #333; color: white; padding: 4px 12px; font-size: 0.9em; border-radius: 4px;">
                    ${escapeHtml(result.total_steps)} steps
                </span>
            </div>

            ${!showAll && result.path.length > visibleFirstRows + visibleLastRows ? `
                <div style="font-size: 0.85em; color: #775; margin-bottom: 10px; font-style: italic;">
                    Showing first ${visibleFirstRows} steps and last step. Click "View all" for full list.
                </div>
            ` : ''}

            <div class="path-search-results" style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
                <table class="path-table" style="min-width: 480px;">
                    <thead>
                        <tr>
                            <th class="path-step-col">Step</th>
                            <th>Key (HEX)</th>
                            <th>Even</th>
                            <th>Choice</th>
                        </tr>
                    </thead>
                    <tbody id="pathTableBody">
    `;

    let rowsToShow;
    if (showAll) {
        rowsToShow = result.path;
    } else {
        const firstRows = result.path.slice(0, visibleFirstRows);
        const lastRow = result.path.length > visibleFirstRows ?
            [result.path[result.path.length - 1]] : [];

        rowsToShow = [...firstRows];

        if (result.path.length > visibleFirstRows + visibleLastRows) {
            const hiddenCount = result.path.length - visibleFirstRows - visibleLastRows;
            rowsToShow.push({
                step: '...',
                key_hex: `${hiddenCount} steps hidden`,
                is_even: false,
                choice: '...'
            });
        }

        rowsToShow.push(...lastRow);
    }

    rowsToShow.forEach((step, index) => {
        const isSeparator = step.step === '...';

        html += `
            <tr${isSeparator ? ' style="background-color: #222; font-style: italic; color: #666;"' : ''}>
                <td>${escapeHtml(step.step)}</td>
                <td class="path-key-hex" style="word-break: break-all; white-space: normal;">${escapeHtml(step.key_hex)}</td>
                <td>${step.is_even ? 'Yes' : 'No'}</td>
                <td>${escapeHtml(step.choice)}</td>
            </tr>
        `;
    });

    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    if (result.path.length > 0) {
        const heatmapData = analyzeHeatmapData(result.path);
        html += createSimpleHeatmap(heatmapData, algorithm);
    }

    contentDiv.innerHTML = html;
    currentPathResults = result;

    // Tap-to-toggle support for heatmap blocks (mobile has no hover).
    contentDiv.querySelectorAll('.heatmap-block').forEach(block => {
        block.addEventListener('click', (event) => {
            event.stopPropagation();
            const hex = block.getAttribute('data-hex');
            const count = block.getAttribute('data-count');
            const percentage = block.getAttribute('data-percentage');

            if (activeHeatmapTooltipHex === hex) {
                hideHeatmapTooltip();
                return;
            }

            showHeatmapTooltip(event, hex, count, percentage);
        });
    });
}

function analyzeHeatmapData(path) {
    const hexGroups = {};
    let totalSteps = 0;

    path.forEach(step => {
        if (step.step === 0) return;

        const firstChar = step.key_hex.charAt(0).toUpperCase();

        if (!hexGroups[firstChar]) {
            hexGroups[firstChar] = {
                hex: firstChar,
                steps: [],
                count: 0
            };
        }

        hexGroups[firstChar].steps.push(step);
        hexGroups[firstChar].count++;
        totalSteps++;
    });

    const sortedHex = Object.keys(hexGroups).sort();
    const groups = sortedHex.map(hex => hexGroups[hex]);

    let maxCount = 0;
    groups.forEach(group => {
        if (group.count > maxCount) maxCount = group.count;
    });

    return {
        groups,
        totalSteps,
        maxCount
    };
}

function createSimpleHeatmap(heatmapData, algorithm) {
    const { groups, totalSteps, maxCount } = heatmapData;

    const GREEN_GRADIENT = [
        '#E6F7E6', '#D4F0D4', '#C2EAC2', '#B0E3B0',
        '#9EDD9E', '#8CD68C', '#7AD07A', '#68C968',
        '#56C356', '#44BC44', '#32B632', '#009900'
    ];

    let html = `
        <div class="heatmap-container">
            <div class="heatmap-title">Distribution by HEX Digit</div>

            <div class="heatmap-rectangle" id="heatmapRectangle-${escapeHtml(algorithm)}" style="display: flex; flex-wrap: wrap;">
    `;

    for (let i = 0; i < 16; i++) {
        const hex = i.toString(16).toUpperCase();
        const group = groups.find(g => g.hex === hex);
        const stepCount = group ? group.steps.length : 0;
        const percentage = totalSteps > 0 ? ((stepCount / totalSteps) * 100).toFixed(1) : '0';

        let blockColor = '#2a2a2a';
        if (stepCount > 0 && maxCount > 0) {
            const intensity = stepCount / maxCount;
            const colorIndex = Math.min(GREEN_GRADIENT.length - 1,
                Math.floor(intensity * (GREEN_GRADIENT.length - 1)));
            blockColor = GREEN_GRADIENT[colorIndex];
        }

        // 4 columns on narrow (mobile) screens, 8 on wider screens, handled
        // via CSS class + data attribute rather than a fixed inline width so
        // the layout can respond to viewport size. Falls back to 8 columns
        // worth of inline width for browsers without the stylesheet rule.
        const squareSize = 100 / 8;

        html += `
            <div class="heatmap-block"
                 style="width: ${squareSize}%; min-width: 60px; background-color: ${blockColor};"
                 data-hex="${hex}"
                 data-count="${stepCount}"
                 data-percentage="${percentage}"
                 tabindex="0"
                 role="button"
                 aria-label="HEX ${hex}: ${stepCount} steps, ${percentage}%">

                <div style="width: 100%; height: 25%; display: flex; align-items: center; justify-content: center;">
                    <div style="color: #000; font-weight: bold; font-size: 14px; font-family: 'Consolas', monospace;">
                        ${hex}
                    </div>
                </div>

                <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
                    <div style="font-size: 12px; font-weight: bold; color: ${stepCount > 0 ? '#000' : '#888'}">
                        ${stepCount > 0 ? percentage + '%' : ''}
                    </div>
                </div>

                <div style="width: 100%; height: 20%; background: ${stepCount > 0 ? '#ccc' : '#222'}; color: #222;
                     display: flex; align-items: center; justify-content: center; flex-direction: row; gap: 3px;">
                    ${stepCount > 0 ? `
                        <div style="font-size: 10px; font-weight: bold;">${stepCount}</div>
                    ` : `
                        <div style="font-size: 9px; opacity: 0.7;">0</div>
                    `}
                </div>
            </div>
        `;
    }

    html += `
            </div>
        </div>
    `;

    return html;
}

function toggleAllPathSteps() {
    showAllPathSteps = !showAllPathSteps;
    if (currentPathResults) {
        const algorithm = document.querySelector('#pathSearchButtons .btn.active')?.getAttribute('data-algorithm') || 'even';
        showPathResults(currentPathResults, algorithm);
    }
}

function showHeatmapTooltip(event, hex, count, percentage) {
    const tooltip = document.getElementById('heatmapTooltip');
    if (!tooltip) return;

    activeHeatmapTooltipHex = hex;

    tooltip.innerHTML = `
        <div class="tooltip-title">HEX ${escapeHtml(hex)}</div>
        <div class="tooltip-content">
            <strong>Steps:</strong> ${escapeHtml(count)}<br>
            <strong>Percentage:</strong> ${escapeHtml(percentage)}%
        </div>
    `;

    tooltip.style.display = 'block';

    // Support both mouse and touch events. Touch events expose coordinates
    // via event.touches/changedTouches rather than pageX/pageY directly.
    const point = (event.touches && event.touches[0]) ||
                  (event.changedTouches && event.changedTouches[0]) ||
                  event;

    let left = point.pageX + 15;
    let top = point.pageY + 15;

    // Keep the tooltip on-screen on narrow viewports instead of letting it
    // overflow off the right/bottom edge.
    const viewportWidth = window.innerWidth + window.scrollX;
    const viewportHeight = window.innerHeight + window.scrollY;
    const tooltipWidth = tooltip.offsetWidth || 160;
    const tooltipHeight = tooltip.offsetHeight || 60;

    if (left + tooltipWidth > viewportWidth) {
        left = Math.max(8, point.pageX - tooltipWidth - 15);
    }
    if (top + tooltipHeight > viewportHeight) {
        top = Math.max(8, point.pageY - tooltipHeight - 15);
    }

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
}

function hideHeatmapTooltip() {
    const tooltip = document.getElementById('heatmapTooltip');
    if (tooltip) tooltip.style.display = 'none';
    activeHeatmapTooltipHex = null;
}

async function copyPathResults() {
    const contentDiv = document.getElementById('pathContent');
    if (!contentDiv || !contentDiv.textContent || contentDiv.textContent.includes('Loading')) {
        showNotification('No results to copy', true);
        return;
    }

    const text = contentDiv.innerText;
    await copyToClipboard(text);
}
