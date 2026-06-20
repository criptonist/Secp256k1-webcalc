/* -------------------------------------------------------------------------------------*/
/* ----------------------------------- CRIPTONIST.COM ----------------------------------*/
/* ------------------------------ Channel t.me/CRIPTONIST ------------------------------*/
/* -------------------------------------------------------------------------------------*/
/* --Thank you for using my software for your calculations. I hope you find it useful.--*/
/* --The software does not collect data and operates exclusively on the user's device.--*/
/* -------------------------------------------------------------------------------------*/

document.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '1';
    
    if (window.setupCalculator) setupCalculator();
    if (window.setupBitcoinGenerator) setupBitcoinGenerator();
    if (window.setupDivision) setupDivision();
    if (window.setupSearchPlus) setupSearchPlus();
    if (window.setupPathSearch) setupPathSearch();
    if (window.setupNavigation) setupNavigation();
    try {
        if (typeof loadCalculationNotes === 'function') {
            loadCalculationNotes();
        }
    } catch (error) {
        console.warn('Could not load calculation notes:', error);
    }
    
    setTimeout(() => {
        if (window.checkServerStatus) checkServerStatus();
    }, 100);
    setInterval(() => {
        if (window.checkServerStatus) checkServerStatus();
    }, 30000);
    
});