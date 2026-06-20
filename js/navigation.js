/* -------------------------------------------------------------------------------------*/
/* ----------------------------------- CRIPTONIST.COM ----------------------------------*/
/* ------------------------------ Channel t.me/CRIPTONIST ------------------------------*/
/* -------------------------------------------------------------------------------------*/

let isProgrammaticScroll = false;
let sectionCache = [];
let ticking = false;

const scrollOptions = { passive: true };

function setupNavigation() {
    window.removeEventListener('scroll', handleScroll, scrollOptions);
    window.addEventListener('scroll', handleScroll, scrollOptions);

    rebuildSectionCache();
    window.addEventListener('resize', rebuildSectionCache);

    setTimeout(updateActiveNavButton, 50);
}

function handleScroll() {
    if (isProgrammaticScroll) return;

    if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
            updateActiveNavButton();
            ticking = false;
        });
    }
}

function rebuildSectionCache() {
    const stickyHeader = document.querySelector('.sticky-header-container');
    const stickyHeight = stickyHeader ? stickyHeader.offsetHeight : 140;

    const sectionIds = [
        'calculator', 'division', 'mod', 'converter',
        'bitcoin', 'curve-division', 'search-plus',
        'path-search', 'secp256k1'
    ];

    sectionCache = sectionIds
        .map(id => {
            const el = document.getElementById(id);
            if (!el) return null;

            const top =
                el.getBoundingClientRect().top +
                window.pageYOffset -
                stickyHeight;

            const bottom = top + el.offsetHeight;

            return { id, top, bottom };
        })
        .filter(Boolean);
}

function updateActiveNavButton() {
    const scrollY = window.pageYOffset;

    let activeSectionId = null;

    for (const section of sectionCache) {
        if (scrollY >= section.top && scrollY < section.bottom) {
            activeSectionId = section.id;
            break;
        }
    }

    if (!activeSectionId) return;

    const buttonIndexMap = {
        'calculator': 0,
        'division': 1,
        'mod': 2,
        'converter': 3,
        'bitcoin': 4,
        'curve-division': 5,
        'search-plus': 6,
        'path-search': 7,
        'secp256k1': 8
    };

    const navButtons = document.querySelectorAll('.nav-btn');
    const activeIndex = buttonIndexMap[activeSectionId];

    navButtons.forEach((btn, index) => {
        if (index === activeIndex) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (!element) return false;

    const stickyHeader = document.querySelector('.sticky-header-container');
    const stickyHeight = stickyHeader ? stickyHeader.offsetHeight : 140;

    const targetY =
        element.getBoundingClientRect().top +
        window.pageYOffset -
        stickyHeight -
        10;

    isProgrammaticScroll = true;

    const buttonIndexMap = {
        'calculator': 0,
        'division': 1,
        'mod': 2,
        'converter': 3,
        'bitcoin': 4,
        'curve-division': 5,
        'search-plus': 6,
        'path-search': 7,
        'secp256k1': 8
    };

    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach((btn, index) => {
        btn.classList.toggle('active', index === buttonIndexMap[sectionId]);
    });

    window.scrollTo({
        top: targetY,
        behavior: 'smooth'
    });

    setTimeout(() => {
        isProgrammaticScroll = false;
        updateActiveNavButton();
    }, 400);

    return false;
}

window.setupNavigation = setupNavigation;
window.scrollToSection = scrollToSection;
