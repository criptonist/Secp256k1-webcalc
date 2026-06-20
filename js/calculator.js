/* -------------------------------------------------------------------------------------*/
/* ----------------------------------- CRIPTONIST.COM ----------------------------------*/
/* ------------------------------ Channel t.me/CRIPTONIST ------------------------------*/
/* -------------------------------------------------------------------------------------*/
/* --Thank you for using my software for your calculations. I hope you find it useful.--*/
/* --The software does not collect data and operates exclusively on the user's device.--*/
/* -------------------------------------------------------------------------------------*/

const MOD_N = BigInt("115792089237316195423570985008687907852837564279074904382605163141518161494337");
const MOD_P = BigInt("115792089237316195423570985008687907853269984665640564039457584007908834671663");

function setupCalculator() {
    const calcBtn = document.getElementById('calcBtn');
    const divideBtn = document.getElementById('divideBtn');
    const modNBtn = document.getElementById('modNBtn');
    const modPBtn = document.getElementById('modPBtn');
    const hexToDecBtn = document.getElementById('hexToDecBtn');
    const decToHexBtn = document.getElementById('decToHexBtn');
    
    if (calcBtn) calcBtn.addEventListener('click', calc2);
    if (divideBtn) divideBtn.addEventListener('click', divide);
    if (modNBtn) modNBtn.addEventListener('click', modN);
    if (modPBtn) modPBtn.addEventListener('click', modP);
    if (hexToDecBtn) hexToDecBtn.addEventListener('click', hexToDec);
    if (decToHexBtn) decToHexBtn.addEventListener('click', decToHex);
}

function calc2() {
    try {
        const a = parseHex(document.getElementById('calcA').value);
        const b = parseHex(document.getElementById('calcB').value);
        const op = document.getElementById('calcOp').value;
        
        if (a === undefined || b === undefined) {
            showResult('calcRes', 'Enter both numbers', true);
            return;
        }
        
        if (op === '^' && b > 10000n) {
            showResult('calcRes', 'Exponent too large (max 10000)', true);
            return;
        }
        
        let result;
        switch(op) {
            case '+': result = a + b; break;
            case '-': result = a - b; break;
            case '*': result = a * b; break;
            case '/': 
                if (b === 0n) {
                    showResult('calcRes', 'Division by zero', true);
                    return;
                }
                result = a / b;
                break;
            case '%':
                if (b === 0n) {
                    showResult('calcRes', 'Division by zero', true);
                    return;
                }
                result = a % b;
                break;
            case '^':
                if (b < 0n) {
                    showResult('calcRes', 'Negative exponent not supported', true);
                    return;
                }
                
                result = 1n;
                let base = a;
                let exp = b;
                
                while (exp > 0n) {
                    if (exp % 2n === 1n) {
                        result = result * base;
                    }
                    base = base * base;
                    exp = exp / 2n;
                }
                break;
            default:
                showResult('calcRes', 'Unknown operation', true);
                return;
        }
        
        const hexResult = toHex(result);
        showResult('calcRes', `Result:  ${hexResult}`, false);
    } catch (error) {
        showResult('calcRes', ' >>> WARNING! <<< Input error. Check HEX format.', true);
    }
}

function divide() {
    try {
        const a = parseHex(document.getElementById('divA').value);
        const b = parseHex(document.getElementById('divB').value);
        
        if (a === undefined || b === undefined) {
            showResult('divRes', 'Enter dividend and divisor', true);
            return;
        }
        
        if (b === 0n) {
            showResult('divRes', 'Division by zero', true);
            return;
        }
        
        const quotient = a / b;
        const remainder = a % b;
        
        showResult('divRes', ` Quotient: ${toHex(quotient)}\nRemainder: ${toHex(remainder)}`, false);
    } catch (error) {
        showResult('divRes', ' >>> WARNING! <<< Input error. Check HEX format.', true);
    }
}

function modN() {
    try {
        const input = document.getElementById('modNInput').value.trim();
        const val = parseHex(input);
        
        let result = val % MOD_N;
        
        if (result < 0n) {
            result = MOD_N + result;
        }
        
        showResult('modNRes', `Result:  ${toHex(result)}`, false);
    } catch (error) {
        showResult('modNRes', ' >>> WARNING! <<< Input error. Check HEX format.', true);
    }
}

function modP() {
    try {
        const input = document.getElementById('modPInput').value.trim();
        const val = parseHex(input);
        
        let result = val % MOD_P;
        
        if (result < 0n) {
            result = MOD_P + result;
        }
        
        showResult('modPRes', `Result:  ${toHex(result)}`, false);
    } catch (error) {
        showResult('modPRes', ' >>> WARNING! <<< Input error. Check HEX format.', true);
    }
}

function hexToDec() {
    try {
        const hex = document.getElementById('hexInput').value.trim();
        if (!hex) {
            showResult('hexToDecRes', 'Enter HEX number', true);
            return;
        }
        const decimal = parseHex(hex);
        showResult('hexToDecRes', `DEC: ${decimal}`, false);
    } catch (error) {
        showResult('hexToDecRes', ' >>> WARNING! <<< Input error. Check HEX format.', true);
    }
}

function decToHex() {
    try {
        const dec = document.getElementById('decInput').value.trim();
        if (!dec) {
            showResult('decToHexRes', 'Enter DEC number', true);
            return;
        }
        const decimal = BigInt(dec);
        const hex = toHex(decimal);
        showResult('decToHexRes', `HEX: ${hex}`, false);
    } catch (error) {
        showResult('decToHexRes', ' >>> WARNING! <<< Input error. Use digits only.', true);
    }
}