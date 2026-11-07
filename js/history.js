  
/* CRIPTONIST - Operation History */  
  
const HISTORY_KEY = 'criptonist_operation_history';  
const HISTORY_LIMIT = 30;  
  
function addHistory(title, action, details) {  
    try {  
        let history = JSON.parse(  
            localStorage.getItem(HISTORY_KEY) || '[]'  
        );  
  
        history.unshift({  
            id: Date.now(),  
            time: new Date().toLocaleString('ru-RU'),  
            title: title,  
            action: action,  
            details: details  
        });  
  
        history = history.slice(0, HISTORY_LIMIT);  
  
        localStorage.setItem(  
            HISTORY_KEY,  
            JSON.stringify(history)  
        );  
  
        renderHistory();  
    } catch (error) {  
        console.error('History error:', error);  
    }  
}  
  
function renderHistory() {  
    const container = document.getElementById('historyContent');  
    if (!container) return;  
  
    const history = JSON.parse(  
        localStorage.getItem(HISTORY_KEY) || '[]'  
    );  
  
    container.replaceChildren();  
  
    if (!history.length) {  
        const empty = document.createElement('div');  
        empty.textContent = 'History empty';  
        empty.className = 'history-empty';  
        container.appendChild(empty);  
        return;  
    }  
  
    history.forEach(item => {  
        const entry = document.createElement('div');  
        entry.className = 'history-entry';  
  
        const heading = document.createElement('div');  
        heading.className = 'history-entry-title';  
        heading.textContent = item.title;  
  
        const time = document.createElement('div');  
        time.className = 'history-time';  
        time.textContent = item.time;  
  
        const action = document.createElement('div');  
        action.className = 'history-action';  
        action.textContent = item.action;  
  
        const details = document.createElement('pre');  
        details.className = 'history-details';  
        details.textContent = item.details;  
  
        entry.append(heading, time, action, details);  
        container.appendChild(entry);  
    });  
}  
  
function toggleHistory() {  
    const content = document.getElementById('historyContent');  
    const arrow = document.getElementById('historyArrow');  
  
    if (!content) return;  
  
    const opened = content.style.display !== 'none';  
  
    content.style.display = opened ? 'none' : 'block';  
  
    if (arrow) {  
        arrow.textContent = opened ? '▼' : '▲';  
    }  
}  
  
function clearHistory() {  
    if (!confirm('Clear log?')) return;  
  
    localStorage.removeItem(HISTORY_KEY);  
    renderHistory();  
}  
  
document.addEventListener('DOMContentLoaded', renderHistory);  
