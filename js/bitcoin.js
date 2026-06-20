/* -------------------------------------------------------------------------------------*/
/* ----------------------------------- CRIPTONIST.COM ----------------------------------*/
/* ------------------------------ Channel t.me/CRIPTONIST ------------------------------*/
/* -------------------------------------------------------------------------------------*/
/* --Thank you for using my software for your calculations. I hope you find it useful.--*/
/* --The software does not collect data and operates exclusively on the user's device.--*/
/* -------------------------------------------------------------------------------------*/

let currentBitcoinResults = null;

function setupBitcoinGenerator() {
    const btcBtn = document.getElementById('btcBtn');
    const copyAllBtn = document.getElementById('copyAllBtn');
    const privateKeyInput = document.getElementById('privateKey');
    
    if (btcBtn) btcBtn.addEventListener('click', calculateBitcoinAddress);
    if (copyAllBtn) copyAllBtn.addEventListener('click', copyAllResults);
    if (privateKeyInput) {
        privateKeyInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateBitcoinAddress();
            }
        });
    }
    
    setupExampleButtons();
}

function setupExampleButtons() {
    const exampleButtons = document.querySelectorAll('.example-btn');
    exampleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const example = this.textContent;
            setExample(example);
        });
    });
}

function setExample(example) {
    const privateKeyInput = document.getElementById('privateKey');
    if (!privateKeyInput) return;
    
    if (example === 'min. key') {
        privateKeyInput.value = '0000000000000000000000000000000000000000000000000000000000000001';
    } else if (example === 'max. key') {
        privateKeyInput.value = 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140';
    } else {
        privateKeyInput.value = example;
    }
}

async function calculateBitcoinAddress() {
    if (!isServerOnline()) {
        showNotification('Start Python server first! Command: python server.py', true);
        checkServerStatus();
        return;
    }
    
    const privateKey = document.getElementById('privateKey')?.value.trim();
    const resultDiv = document.getElementById('bitcoinResult');
    const contentDiv = document.getElementById('bitcoinContent');
    const btcBtn = document.getElementById('btcBtn');
    
    if (!privateKey) {
        showNotification('Enter private key in HEX format', true);
        return;
    }
    
    let privKey = privateKey.replace(/^0x/i, '').trim();
    
    if (!/^[0-9a-fA-F]+$/.test(privKey)) {
        showNotification('Invalid HEX format. Use only: 0-9, a-f, A-F', true);
        return;
    }
    
    showButtonLoading(btcBtn, 'Generate Adress');
    
    if (resultDiv) resultDiv.classList.add('show');
    if (contentDiv) showLoading('bitcoinContent', 'Generating Bitcoin addresses...');
    
    try {
        const data = await callServer('btc', { priv: privKey });
        
        currentBitcoinResults = data;
        showBitcoinResults(data);
        showNotification('Bitcoin addresses generated successfully!');
        
    } catch (error) {
        console.error('Bitcoin generation error:', error);
        if (contentDiv) {
            contentDiv.innerHTML = `
                <div class="error-message">
                    <strong>Error:</strong> ${error.message}
                </div>
            `;
        }
        showNotification(`Error: ${error.message}`, true);
    } finally {
        restoreButton(btcBtn);
    }
}

function formatUncompressedPubkey(x, y) {
    if (!x || !y) return 'N/A';
    return `04 ${x}${y}`;
}

function showBitcoinResults(data) {
    const contentDiv = document.getElementById('bitcoinContent');
    if (!contentDiv) return;
    
    let uncompressedX = data.uncompressed?.x_coordinate || '';
    let uncompressedY = data.uncompressed?.y_coordinate || '';
    
    const sha256_uncompressed = data.uncompressed?.sha256_pubkey || 'N/A';
    const sha256_hash1_uncompressed = data.uncompressed?.sha256_hash || 'N/A';
    const prefix_hash160_uncompressed = data.uncompressed?.prefix_hash160 || 'N/A';
    const checksum_uncompressed = data.uncompressed?.prefixed_checksum || 'N/A';
    
    const sha256_compressed = data.compressed?.sha256_pubkey || 'N/A';
    const sha256_hash1_compressed = data.compressed?.sha256_hash || 'N/A';
    const prefix_hash160_compressed = data.compressed?.prefix_hash160 || 'N/A';
    const checksum_compressed = data.compressed?.prefixed_checksum || 'N/A';
    
    const segwitAddress = data.segwit_p2sh?.address || 'N/A';
    const nativeSegwit = data.p2wpkh?.address || 'N/A';
    const p2wshAddress = data.p2wsh?.address || 'N/A';
    const p2trAddress = data.p2tr?.address || 'N/A';
    
    contentDiv.innerHTML = `
        <div class="result-section">
            <h4 style="margin-bottom: 15px; color: #eee; font-size: 14px; font-weight: 500;">Uncompressed Public Key Details</h4>
            
            <div style="margin: 0 0 5px 0; padding: 2px 0; display: flex; align-items: center;">
                <span style="font-size: 12px; color: #aaa; width: 209px; flex-shrink: 0; font-weight: 600;">Pubkey (Uncompressed):</span>
                <span style="flex: 1; word-break: break-all; font-family: 'Consolas', monospace; font-size: 14px; color: #ddd; font-weight: 400; margin-left: 0;">
                    ${formatUncompressedPubkey(uncompressedX, uncompressedY)}
                </span>
            </div>
            
            <div style="margin: 0 0 5px 0; padding: 2px 0; display: flex; align-items: center;">
                <span style="font-size: 12px; color: #aaa; width: 209px; flex-shrink: 0; font-weight: 600;">X coordinate:</span>
                <span style="flex: 1; word-break: break-all; font-family: 'Consolas', monospace; font-size: 14px; color: #ddd; font-weight: 400; margin-left: 0;">
                    ${uncompressedX}
                </span>
            </div>
            
            <div style="margin: 0 0 5px 0; padding: 2px 0; display: flex; align-items: center;">
                <span style="font-size: 12px; color: #aaa; width: 209px; flex-shrink: 0; font-weight: 600;">Y coordinate:</span>
                <span style="flex: 1; word-break: break-all; font-family: 'Consolas', monospace; font-size: 14px; color: #ddd; font-weight: 400; margin-left: 0;">
                    ${uncompressedY}
                </span>
            </div>
            
            <!-- ДОБАВЛЯЕМ SHA256 ДАННЫЕ -->
            <div style="margin: 0 0 5px 0; padding: 2px 0; display: flex; align-items: center;">
                <span style="font-size: 12px; color: #aaa; width: 209px; flex-shrink: 0; font-weight: 600;">SHA256 pubkey (Uncompressed):</span>
                <span style="flex: 1; word-break: break-all; font-family: 'Consolas', monospace; font-size: 14px; color: #ddd; font-weight: 400; margin-left: 0;">
                    ${sha256_uncompressed}
                </span>
            </div>
            
            <div style="margin: 0 0 5px 0; padding: 2px 0; display: flex; align-items: center;">
                <span style="font-size: 12px; color: #aaa; width: 209px; flex-shrink: 0; font-weight: 600;">SHA256 hash:</span>
                <span style="flex: 1; word-break: break-all; font-family: 'Consolas', monospace; font-size: 14px; color: #ddd; font-weight: 400; margin-left: 0;">
                    ${sha256_hash1_uncompressed}
                </span>
            </div>
            
            <div style="margin: 0 0 5px 0; padding: 2px 0; display: flex; align-items: center;">
                <span style="font-size: 12px; color: #aaa; width: 209px; flex-shrink: 0; font-weight: 600;">Prefix 00 + hash160:</span>
                <span style="flex: 1; word-break: break-all; font-family: 'Consolas', monospace; font-size: 14px; color: #ddd; font-weight: 400; margin-left: 0;">
                    ${prefix_hash160_uncompressed}
                </span>
            </div>
            
            <div style="margin: 0 0 5px 0; padding: 2px 0; display: flex; align-items: center;">
                <span style="font-size: 12px; color: #aaa; width: 209px; flex-shrink: 0; font-weight: 600;">Prefix 00 + hash160 + checksum:</span>
                <span style="flex: 1; word-break: break-all; font-family: 'Consolas', monospace; font-size: 14px; color: #ddd; font-weight: 400; margin-left: 0;">
                    ${checksum_uncompressed}
                </span>
            </div>
            
            <div style="margin: 5px 0 0 0; padding: 12px; background: #363636; border-radius: 4px; border: 1px solid #363636; display: flex; align-items: center;">
                <span style="font-size: 12px; color: #aaa; width: 195px; flex-shrink: 0; font-weight: 600;">Bitcoin Address:</span>
                <span style="flex: 1; word-break: break-all; font-family: 'Consolas', monospace; font-size: 15px; color: #f09322; font-weight: 500; margin-left: 0;">
                    ${data.uncompressed?.address || 'N/A'}
                </span>
                <button class="copy-btn" style="margin-left: 8px; font-size: 11px; flex-shrink: 0; padding: 3px 8px;" 
                        onclick="copyToClipboard('${data.uncompressed?.address || ''}')">Copy</button>
            </div>
        </div>
        
        <div class="result-section">
            <h4 style="margin-bottom: 15px; color: #eee; font-size: 14px; font-weight: 500;">Compressed Public Key Details</h4>
            
            <div style="margin: 0 0 5px 0; padding: 2px 0; display: flex; align-items: center;">
                <span style="font-size: 12px; color: #aaa; width: 209px; flex-shrink: 0; font-weight: 600;">Pubkey (Compressed):</span>
                <span style="flex: 1; word-break: break-all; font-family: 'Consolas', monospace; font-size: 14px; color: #ddd; font-weight: 400; margin-left: 0;">
                    ${data.compressed?.pubkey || 'N/A'}
                </span>
            </div>
            
            <!-- ДОБАВЛЯЕМ SHA256 ДАННЫЕ -->
            <div style="margin: 0 0 5px 0; padding: 2px 0; display: flex; align-items: center;">
                <span style="font-size: 12px; color: #aaa; width: 209px; flex-shrink: 0; font-weight: 600;">SHA256 pubkey (Compressed):</span>
                <span style="flex: 1; word-break: break-all; font-family: 'Consolas', monospace; font-size: 14px; color: #ddd; font-weight: 400; margin-left: 0;">
                    ${sha256_compressed}
                </span>
            </div>
            
            <div style="margin: 0 0 5px 0; padding: 2px 0; display: flex; align-items: center;">
                <span style="font-size: 12px; color: #aaa; width: 209px; flex-shrink: 0; font-weight: 600;">SHA256 hash (Compressed):</span>
                <span style="flex: 1; word-break: break-all; font-family: 'Consolas', monospace; font-size: 14px; color: #ddd; font-weight: 400; margin-left: 0;">
                    ${sha256_hash1_compressed}
                </span>
            </div>
            
            <div style="margin: 0 0 5px 0; padding: 2px 0; display: flex; align-items: center;">
                <span style="font-size: 12px; color: #aaa; width: 209px; flex-shrink: 0; font-weight: 600;">Prefix 00 + hash160:</span>
                <span style="flex: 1; word-break: break-all; font-family: 'Consolas', monospace; font-size: 14px; color: #ddd; font-weight: 400; margin-left: 0;">
                    ${prefix_hash160_compressed}
                </span>
            </div>
            
            <div style="margin: 0 0 5px 0; padding: 2px 0; display: flex; align-items: center;">
                <span style="font-size: 12px; color: #aaa; width: 209px; flex-shrink: 0; font-weight: 600;">Prefix 00 + hash160 + checksum:</span>
                <span style="flex: 1; word-break: break-all; font-family: 'Consolas', monospace; font-size: 14px; color: #ddd; font-weight: 400; margin-left: 0;">
                    ${checksum_compressed}
                </span>
            </div>
            
            <div style="margin: 5px 0 0 0; padding: 12px; background: #363636; border-radius: 4px; border: 1px solid #363636; display: flex; align-items: center;">
                <span style="font-size: 12px; color: #aaa; width: 195px; flex-shrink: 0; font-weight: 600;">Bitcoin Address (Compressed):</span>
                <span style="flex: 1; word-break: break-all; font-family: 'Consolas', monospace; font-size: 15px; color: #f09322; font-weight: 500; margin-left: 0;">
                    ${data.compressed?.address || 'N/A'}
                </span>
                <button class="copy-btn" style="margin-left: 8px; font-size: 11px; flex-shrink: 0; padding: 3px 8px;" 
                        onclick="copyToClipboard('${data.compressed?.address || ''}')">Copy</button>
            </div>
        </div>
        
        <div class="result-section">
            <h4 style="margin-bottom: 15px; color: #eee; font-size: 14px; font-weight: 500;">SegWit Addresses</h4>
            
            <div style="margin: 0 0 5px 0; padding: 12px; background: #363636; border-radius: 4px; border: 1px solid #363636; display: flex; align-items: center;">
                <span style="font-size: 12px; color: #ccc; width: 195px; flex-shrink: 0; font-weight: 600;">SegWit (P2SH):</span>
                <span style="flex: 1; word-break: break-all; font-family: 'Consolas', monospace; font-size: 15px; color: #f09322; font-weight: 500; margin-left: 0;">
                    ${segwitAddress}
                </span>
                <button class="copy-btn" style="margin-left: 8px; font-size: 11px; flex-shrink: 0; padding: 3px 8px;" 
                        onclick="copyToClipboard('${segwitAddress}')">Copy</button>
            </div>
            
            <div style="margin: 0 0 5px 0; padding: 12px; background: #363636; border-radius: 4px; border: 1px solid #363636; display: flex; align-items: center;">
                <span style="font-size: 12px; color: #ccc; width: 195px; flex-shrink: 0; font-weight: 600;">Native (P2WPKH):</span>
                <span style="flex: 1; word-break: break-all; font-family: 'Consolas', monospace; font-size: 15px; color: #f09322; font-weight: 500; margin-left: 0;">
                    ${nativeSegwit}
                </span>
                <button class="copy-btn" style="margin-left: 8px; font-size: 11px; flex-shrink: 0; padding: 3px 8px;" 
                        onclick="copyToClipboard('${nativeSegwit}')">Copy</button>
            </div>
            
            <div style="margin: 0 0 5px 0; padding: 12px; background: #363636; border-radius: 4px; border: 1px solid #363636; display: flex; align-items: center;">
                <span style="font-size: 12px; color: #ccc; width: 195px; flex-shrink: 0; font-weight: 600;">SegWit P2WSH:</span>
                <span style="flex: 1; word-break: break-all; font-family: 'Consolas', monospace; font-size: 15px; color: #f09322; font-weight: 500; margin-left: 0;">
                    ${p2wshAddress}
                </span>
                <button class="copy-btn" style="margin-left: 8px; font-size: 11px; flex-shrink: 0; padding: 3px 8px;" 
                        onclick="copyToClipboard('${p2wshAddress}')">Copy</button>
            </div>
            
            <div style="margin: 0; padding: 12px; background: #363636; border-radius: 4px; border: 1px solid #363636; display: flex; align-items: center;">
                <span style="font-size: 12px; color: #ccc; width: 195px; flex-shrink: 0; font-weight: 600;">Taproot (P2TR):</span>
                <span style="flex: 1; word-break: break-all; font-family: 'Consolas', monospace; font-size: 15px; color: #f09322; font-weight: 500; margin-left: 0;">
                    ${p2trAddress}
                </span>
                <button class="copy-btn" style="margin-left: 8px; font-size: 11px; flex-shrink: 0; padding: 3px 8px;" 
                        onclick="copyToClipboard('${p2trAddress}')">Copy</button>
            </div>
        </div>
    `;
}

async function copyAllResults() {
    if (!currentBitcoinResults) {
        showNotification('No results to copy', true);
        return;
    }
    
    const text = `Bitcoin Address Generator Results
Input: ${currentBitcoinResults.input}

UNCOMPRESSED:
Pubkey: ${currentBitcoinResults.uncompressed?.pubkey || 'N/A'}
X coordinate: ${currentBitcoinResults.uncompressed?.x_coordinate || 'N/A'}
Y coordinate: ${currentBitcoinResults.uncompressed?.y_coordinate || 'N/A'}
Bitcoin Address: ${currentBitcoinResults.uncompressed?.address || 'N/A'}

COMPRESSED:
Pubkey: ${currentBitcoinResults.compressed?.pubkey || 'N/A'}
Bitcoin Address: ${currentBitcoinResults.compressed?.address || 'N/A'}

SEGWIT ADDRESSES:
SegWit Address (P2SH): ${currentBitcoinResults.segwit_p2sh?.address || 'N/A'}
Native SegWit (P2WPKH): ${currentBitcoinResults.p2wpkh?.address || 'N/A'}
SegWit P2WSH: ${currentBitcoinResults.p2wsh?.address || 'N/A'}
Taproot (P2TR): ${currentBitcoinResults.p2tr?.address || 'N/A'}
`;
    
    await copyToClipboard(text);
}

function generateRandomPrivateKey() {
    const privateKeyInput = document.getElementById('privateKey');
    if (!privateKeyInput) return;

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
    
    const finalKey = keyBigInt.toString(16).padStart(64, '0');
    privateKeyInput.value = finalKey;
    
    privateKeyInput.dispatchEvent(new Event('input'));
    
    showNotification('Random private key generated!');
}

function setupBitcoinGenerator() {
    const btcBtn = document.getElementById('btcBtn');
    const copyAllBtn = document.getElementById('copyAllBtn');
    const privateKeyInput = document.getElementById('privateKey');
    
    if (btcBtn) btcBtn.addEventListener('click', calculateBitcoinAddress);
    if (copyAllBtn) copyAllBtn.addEventListener('click', copyAllResults);
    if (privateKeyInput) {
        privateKeyInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateBitcoinAddress();
            }
        });
    }
    
    const randomBtn = document.querySelector('button[onclick="generateRandomPrivateKey()"]');
    if (randomBtn) {
        randomBtn.addEventListener('click', generateRandomPrivateKey);
    }
}