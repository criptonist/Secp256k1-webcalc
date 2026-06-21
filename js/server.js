/* -------------------------------------------------------------------------------------*/
/* ----------------------------------- CRIPTONIST.COM ----------------------------------*/
/* ------------------------------ Channel t.me/CRIPTONIST ------------------------------*/
/* -------------------------------------------------------------------------------------*/
/* --Thank you for using my software for your calculations. I hope you find it useful.--*/
/* --The software does not collect data and operates exclusively on the user's device.--*/
/* -------------------------------------------------------------------------------------*/

// ЕДИНСТВЕННОЕ место, которое нужно менять при смене хостинга бэкенда.
// Локально: 'http://127.0.0.1:5000'
// На Render/Replit: 'https://ваш-сервис.onrender.com' (без слэша в конце)
const API_BASE_URL = 'https://secp256k1-webcalc.onrender.com';

let serverOnline = false;

function isServerOnline() {
    return serverOnline;
}

async function checkServerStatus() {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const statusNote = document.getElementById('statusNote');
    const btcBtn = document.getElementById('btcBtn');
    const searchBtn = document.getElementById('searchBtn');
    
    if (!statusDot || !statusText || !statusNote) return;
    
    statusDot.className = 'status-indicator status-checking';
    statusText.textContent = 'Checking connection...';
    statusNote.textContent = 'Connecting to server...';
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const response = await fetch(`${API_BASE_URL}/ping`, {
            method: 'GET',
            mode: 'cors',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            serverOnline = true;
            statusDot.className = 'status-indicator status-online';
            statusText.textContent = 'Server is online';
            statusNote.textContent = 'Ready to work';
            
            if (btcBtn) {
                btcBtn.disabled = false;
                btcBtn.textContent = 'Generate Address';
            }
            
            if (searchBtn) {
                searchBtn.disabled = false;
                searchBtn.textContent = 'Calculate Range';
            }
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
        
    } catch (error) {
        serverOnline = false;
        statusDot.className = 'status-indicator status-offline';
        statusText.textContent = 'Server is offline';
        statusNote.textContent = 'Run server.py on port 5000';
        
        if (btcBtn) {
            btcBtn.disabled = true;
            btcBtn.textContent = 'Server offline';
        }
        
        if (searchBtn) {
            searchBtn.disabled = true;
            searchBtn.textContent = 'Server offline';
        }
    }
}

async function testServer() {
    const statusText = document.getElementById('statusText');
    if (!statusText) return;
    
    const originalText = statusText.textContent;
    statusText.textContent = 'Testing connection...';
    
    try {
        const startTime = performance.now();
        const response = await fetch(`${API_BASE_URL}/ping`, {
            method: 'GET',
            mode: 'cors'
        });
        const pingTime = Math.round(performance.now() - startTime);
        
        if (response.ok) {
            showNotification(`Connection OK! Response time: ${pingTime}ms`);
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        showNotification(`Connection error: ${error.message}`, true);
    } finally {
        checkServerStatus();
    }
}

async function callServer(endpoint, data) {
    if (!serverOnline) {
        showNotification('Start Python server first! Command: python server.py', true);
        checkServerStatus();
        throw new Error('Server offline');
    }
    
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data),
        mode: 'cors'
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
        throw new Error(result.error || 'Server error');
    }
    
    return result;
}
