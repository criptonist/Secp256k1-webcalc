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
        const inputA = document.getElementById('calcA');
        const inputB = document.getElementById('calcB');

        const a = parseHex(inputA.value);
        const b = parseHex(inputB.value);
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

        // Показываем результат вычисления.
        showResult('calcRes', `Result:  ${hexResult}`, false);

        // Записываем операцию отдельно от вычисления.
        try {
            if (typeof addHistory !== 'function') {
                throw new Error('addHistory is not loaded');
            }

             addHistory(
                'Calculation (HEX)',
                `${inputA.value} ${op} ${inputB.value} = ${hexResult}`
            );
        } catch (historyError) {
            console.error('History error:', historyError);
        }        
    } catch (error) {
        showResult('calcRes', 'WARNING! Input error.', true);
    }
}
function appendHexValue(inputId, value) {
    const input = document.getElementById(inputId);

    if (!input) {
        console.error('Input not found:', inputId);
        return;
    }

    input.value += value;

    const counter = input.parentElement.querySelector('div');
    if (counter) {
        counter.textContent = input.value.length;
    }

    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();
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
            try {
                const historyKey = `${document.getElementById('divA').value}_${document.getElementById('divB').value}`;

                if (window.lastHexDivisionKey !== historyKey) {
                    window.lastHexDivisionKey = historyKey;

                    addHistory(
                        'Divide (HEX)',
                        `${document.getElementById('divA').value} / ${document.getElementById('divB').value}
     quotient: ${toHex(quotient)}
    remainder: ${toHex(remainder)}`
                    );
                }
            } catch (historyError) {
                console.error('History error:', historyError);
            }
        showResult('divRes', ` Quotient: ${toHex(quotient)}\nRemainder: ${toHex(remainder)}`, false);
    } catch (error) {
        showResult('divRes', 'WARNING! Input error.', true);
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
        try {
            addHistory(
                'Mod n',
                `${input} mod n = ${toHex(result)}`
            );
        } catch (historyError) {
            console.error('History error:', historyError);
        }
        showResult('modNRes', `Result:  ${toHex(result)}`, false);
    } catch (error) {
        showResult('modNRes', 'WARNING! Input error.', true);
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
         try {
            addHistory(
                'Mod p',
                `${input} mod p = ${toHex(result)}`
            );
        } catch (historyError) {
            console.error('History error:', historyError);
        }
        showResult('modPRes', `Result:  ${toHex(result)}`, false);
    } catch (error) {
        showResult('modPRes', 'WARNING! Input error.', true);
    }
}

function hexToDec() {
    try {
        const hex = document.getElementById('hexInput').value.trim();
        if (!hex) {
            addHistory(
        'HEX → DEC',
        `${hex} = ${decimal}`
    );
            showResult('hexToDecRes', 'Enter HEX number', true);
            return;
        }
        const decimal = parseHex(hex);
        showResult('hexToDecRes', `DEC: ${decimal}`, false);
    } catch (error) {
        showResult('hexToDecRes', 'WARNING! Input error.', true);
    }
}

function decToHex() {
    try {
        const dec = document.getElementById('decInput').value.trim();
        if (!dec) {
            addHistory(
        'HEX → DEC',
        `${hex} = ${decimal}`
    );
            showResult('decToHexRes', 'Enter DEC number', true);
            return;
        }
        const decimal = BigInt(dec);
        const hex = toHex(decimal);
        showResult('decToHexRes', `HEX: ${hex}`, false);
    } catch (error) {
        showResult('decToHexRes', 'WARNING! Input error.', true);
    }
}
