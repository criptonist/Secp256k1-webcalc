/* -------------------------------------------------------------------------------------*/
/* ----------------------------------- CRIPTONIST.COM ----------------------------------*/
/* ------------------------------ Channel t.me/CRIPTONIST ------------------------------*/
/* -------------------------------------------------------------------------------------*/
/* --Thank you for using my software for your calculations. I hope you find it useful.--*/
/* --The software does not collect data and operates exclusively on the user's device.--*/
/* -------------------------------------------------------------------------------------*/

function parseHex(s) {
    s = s.trim();
    
    let isNegative = false;
    if (s.startsWith('-')) {
        isNegative = true;
        s = s.substring(1);
    }
    
    s = s.replace(/^0x/i, "");
    
    if (!s) return 0n;

    let value = BigInt("0x" + (s || "0"));

    return isNegative ? -value : value;
}

function toHex(n) {
    if (typeof n !== 'bigint') n = BigInt(n);
    
    let hex;
    if (n < 0n) {
        hex = (-n).toString(16).toUpperCase();
        return "-" + (hex.length % 2 === 0 ? hex : '0' + hex);
    } else {
        hex = n.toString(16).toUpperCase();
        return hex.length % 2 === 0 ? hex : '0' + hex;
    }
}

function validateHexInput(input) {
    const cleanInput = input.replace(/^0x/i, '').trim();
    return /^[0-9a-fA-F]+$/.test(cleanInput);
}

function generateRandomKey() {
    const maxVal = BigInt('0x' + 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140');
    const minVal = BigInt(1);
    const range = maxVal - minVal;
    
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    
    let randomBigInt = BigInt(0);
    for (let i = 0; i < randomBytes.length; i++) {
        randomBigInt = (randomBigInt << BigInt(8)) | BigInt(randomBytes[i]);
    }
    
    randomBigInt = minVal + (randomBigInt % range);
    let hexKey = randomBigInt.toString(16);
    return hexKey.padStart(64, '0');
}