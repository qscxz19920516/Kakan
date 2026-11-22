(function(){
    const mount = document.getElementById('siteMenu');
    if (!mount) throw new Error('Missing #siteMenu mount point');

    const page = window.location.pathname.split('/').pop().toLowerCase();
    const isHome = page === '' || page === 'index.html';
    const isCard = page === 'card.html';
    const isBox = page === 'box.html';
    const isMilkGame = isHome && window.location.hash === '#meow-milk';
    const isHitMeowGame = isHome && window.location.hash === '#game1';
    const homeLink = isHome
        ? '<a href="index.html" class="current" onclick="showHome(event)">'
        : '<a href="index.html">';
    const gameLink = isHome
        ? `<a href="#meow-milk"${isMilkGame ? ' class="current"' : ''} onclick="openGame(event)">`
        : '<a href="index.html#meow-milk">';
    const game1Link = isHome
        ? `<a href="#game1"${isHitMeowGame ? ' class="current"' : ''} onclick="openGame1(event)">`
        : '<a href="index.html#game1">';
    const brand = isHome
        ? '🌸 花間小憩 🌸'
        : isCard
            ? '🎴 小卡圖鑑 🎴'
            : isBox
                ? '<span style="user-select:none">🎁 <span id="secretBrand" onclick="triggerSecretReset()" style="cursor:pointer">驚喜盲盒</span> 🎁</span>'
                : '🌸 花間小憩 🌸';

    mount.innerHTML = `
        <div class="topbar">
            <button class="menu-btn" type="button" aria-label="開啟選單" aria-expanded="false" onclick="toggleMenu()">☰</button>
            <div class="brand">${brand}</div>
            <div class="spacer"></div>
        </div>
        <div class="drawer-mask" id="mask" onclick="toggleMenu()"></div>
        <nav class="drawer" id="drawer" aria-label="網站導覽">
            <div class="drawer-hd">
                <span>🌸 花間小憩選單</span>
                <button class="close-btn" type="button" aria-label="關閉選單" onclick="toggleMenu()">✕</button>
            </div>
            <ul class="drawer-list">
                <li>${homeLink}<span>🏠 首頁</span><span class="arrow">&gt;</span></a></li>
                <li><a href="card.html"${isCard ? ' class="current"' : ''}><span>🎴 小卡圖鑑</span><span class="arrow">&gt;</span></a></li>
                <li>
                    <div class="sub-toggle" onclick="toggleSubMenu()"><span>🎁 驚喜盲盒</span><span class="arrow" id="subArrow">&gt;</span></div>
                    <ul class="submenu" id="subMenu"></ul>
                </li>
                <li>
                    <div class="sub-toggle" onclick="toggleGuildGames()" aria-expanded="false" aria-controls="gameSubMenu">
                        <span>🎮 公會小遊戲</span><span class="arrow" id="gameSubArrow">&gt;</span>
                    </div>
                    <ul class="submenu" id="gameSubMenu">
                        <li>${gameLink}<span>🥛 喵喵乳糖挑戰</span><span class="arrow">&gt;</span></a></li>
                        <li>${game1Link}<span>🩴 暴打小菜雞</span><span class="arrow">&gt;</span></a></li>
                    </ul>
                </li>
            </ul>
        </nav>`;

    window.toggleMenu = function(){
        const drawer = document.getElementById('drawer');
        const isOpen = drawer.classList.toggle('open');
        document.getElementById('mask').classList.toggle('open', isOpen);
        mount.querySelector('.menu-btn').setAttribute('aria-expanded', String(isOpen));
    };

    window.toggleSubMenu = function(){
        document.getElementById('subMenu').classList.toggle('open');
        document.getElementById('subArrow').classList.toggle('rot');
    };

    window.toggleGuildGames = function(){
        const submenu = document.getElementById('gameSubMenu');
        const isOpen = submenu.classList.toggle('open');
        document.getElementById('gameSubArrow').classList.toggle('rot', isOpen);
        mount.querySelector('[aria-controls="gameSubMenu"]').setAttribute('aria-expanded', String(isOpen));
    };
})();
