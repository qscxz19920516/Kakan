(function(){
    const mount = document.getElementById('siteMenu');
    if (!mount) throw new Error('Missing #siteMenu mount point');

    const page = window.location.pathname.split('/').pop().toLowerCase();
    const isHome = page === '' || page === 'index.html';
    const isCard = page === 'card.html';
    const isBox = page === 'box.html';
    const homeLink = isHome
        ? '<a href="index.html" class="current" onclick="showHome(event)">'
        : '<a href="index.html">';
    const gameLink = isHome
        ? '<a href="#meow-milk" onclick="openGame(event)">'
        : '<a href="index.html#meow-milk">';
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
                <li>${gameLink}<span>🥛 喵喵乳糖挑戰</span><span class="arrow">&gt;</span></a></li>
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
})();
