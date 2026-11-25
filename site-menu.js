(function(){
    const mount = document.getElementById('siteMenu');
    if (!mount) throw new Error('Missing #siteMenu mount point');

    const page = window.location.pathname.split('/').pop().toLowerCase();
    const isHome = page === '' || page === 'index.html';
    const isCard = page === 'card.html';
    const isGuide = page === 'guide.html';
    const isBox = page === 'box.html';
    const isGamePage = page === 'meowmilk.html' || page === 'hitmeow.html' || page === 'game1.html';
    const isMilkGame = isHome && window.location.hash === '#meow-milk';
    const isHitMeowGame = isHome && window.location.hash === '#hit-meow';
    const curGuideTab = isGuide ? (new URLSearchParams(window.location.search).get('tab') || 'gear_stats') : '';

    const homeLink = isHome
        ? '<a href="index.html" class="current" onclick="showHome(event)">'
        : '<a href="index.html">';
    const gameLink = isHome
        ? `<a href="#meow-milk"${isMilkGame ? ' class="current"' : ''} onclick="openGame(event)">`
        : '<a href="index.html#meow-milk">';
    const game1Link = isHome
        ? `<a href="#hit-meow"${isHitMeowGame ? ' class="current"' : ''} onclick="openGame1(event)">`
        : '<a href="index.html#hit-meow">';

    function guideItemLink(tabId, icon, label) {
        const isCur = isGuide && curGuideTab === tabId;
        const clickAttr = isGuide ? ` onclick="goGuide(event, '${tabId}')"` : '';
        return `<li><a href="guide.html?tab=${tabId}" data-guide-tab="${tabId}"${isCur ? ' class="current"' : ''}${clickAttr}><span>${icon} ${label}</span><span class="arrow">&gt;</span></a></li>`;
    }

    const brand = isHome
        ? '🌸 花間小憩 🌸'
        : isCard
            ? '🎴 小卡圖鑑 🎴'
            : isGuide
                ? '📖 遊戲攻略區 📖'
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
                    <div class="sub-toggle" onclick="toggleGuideSubMenu()" aria-expanded="${isGuide ? 'true' : 'false'}" aria-controls="guideSubMenu">
                        <span>📖 遊戲攻略區</span><span class="arrow${isGuide ? ' rot' : ''}" id="guideSubArrow">&gt;</span>
                    </div>
                    <ul class="submenu${isGuide ? ' open' : ''}" id="guideSubMenu">
                        ${guideItemLink('gear_stats', '⚔️', '裝備詞條')}
                        ${guideItemLink('s6_dungeon', '🏰', 'S6 副本門檻')}
                        ${guideItemLink('tier9_skills', '🔥', '九轉技能')}
                    </ul>
                </li>
                <li>
                    <div class="sub-toggle" id="blindboxSubToggle" onclick="toggleSubMenu()"><span>🎁 驚喜盲盒</span><span class="arrow" id="subArrow">&gt;</span></div>
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

    window.toggleGuideSubMenu = function(){
        const submenu = document.getElementById('guideSubMenu');
        const isOpen = submenu.classList.toggle('open');
        document.getElementById('guideSubArrow').classList.toggle('rot', isOpen);
        const toggleBtn = mount.querySelector('[aria-controls="guideSubMenu"]');
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', String(isOpen));
    };

    window.toggleSubMenu = function(){
        document.getElementById('subMenu').classList.toggle('open');
        document.getElementById('subArrow').classList.toggle('rot');
    };

    window.toggleGuildGames = function(){
        const submenu = document.getElementById('gameSubMenu');
        const isOpen = submenu.classList.toggle('open');
        document.getElementById('gameSubArrow').classList.toggle('rot', isOpen);
        const toggleBtn = mount.querySelector('[aria-controls="gameSubMenu"]');
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', String(isOpen));
    };

    // =========================================================================
    // ★ 花間小憩全站 YouTube 背景音樂隨機輪播器（50%透明可拖曳圓鈕＋點開展開）
    // =========================================================================
    if (!isGamePage) {
        const BGM_TRACKS = [
            { id: "DfKV1l36XUo", title: "花間仍有你" },
            { id: "Ai-yzEI6rEc", title: "剛好花開" },
            { id: "SwRPbdYz2tE", title: "Rest in Flowers" }
        ];
        const BGM_PREF_KEY = "huajian_bgm_user_paused_v1";

        let ytPlayer = null;
        let ytReady = false;
        let inGameMode = Boolean(isMilkGame || isHitMeowGame);
        let userPaused = localStorage.getItem(BGM_PREF_KEY) === "1";
        let currentIdx = Math.floor(Math.random() * BGM_TRACKS.length);
        let isPlayingNow = false;
        let gestureUnlocked = false;
        let isExpanded = false;

        function pickNextRandomIndex(excludeIdx) {
            if (BGM_TRACKS.length <= 1) return 0;
            let next = Math.floor(Math.random() * BGM_TRACKS.length);
            if (next === excludeIdx) {
                next = (next + 1 + Math.floor(Math.random() * (BGM_TRACKS.length - 1))) % BGM_TRACKS.length;
            }
            return next;
        }

        const styleEl = document.createElement('style');
        styleEl.textContent = `
            .huajian-bgm-widget{position:fixed;left:16px;top:76px;z-index:85;touch-action:none;user-select:none}
            .huajian-bgm-widget.hidden-in-game{display:none !important}
            .huajian-bgm-orb{width:44px;height:44px;border-radius:50%;border:2px solid rgba(240,168,180,.75);background:rgba(255,255,255,.5);backdrop-filter:blur(6px);color:#c76272;font-size:1.1rem;font-weight:900;cursor:grab;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(226,158,168,.22);transition:background .2s,transform .15s}
            .huajian-bgm-orb.playing{background:rgba(255,143,163,.5);color:#fff;border-color:rgba(255,143,163,.8)}
            .huajian-bgm-orb.dragging{cursor:grabbing;background:rgba(255,255,255,.82);transform:scale(1.06)}
            .huajian-bgm-panel{display:none;align-items:center;gap:6px;background:rgba(255,255,255,.94);backdrop-filter:blur(8px);border:2px solid #f0a8b4;border-radius:999px;padding:5px 10px 5px 6px;box-shadow:0 6px 18px rgba(226,158,168,.28);font-size:.78rem;font-weight:900;color:#5a4649}
            .huajian-bgm-widget.expanded .huajian-bgm-orb{display:none}
            .huajian-bgm-widget.expanded .huajian-bgm-panel{display:inline-flex}
            .huajian-bgm-btn{border:none;background:linear-gradient(135deg,#ff9a9e,#f68084);color:#fff;width:28px;height:28px;border-radius:50%;font-size:.8rem;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
            .huajian-bgm-next{border:1.5px solid #f2bec7;background:#fff8f9;color:#c76272;width:25px;height:25px;border-radius:50%;font-size:.74rem;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
            .huajian-bgm-next:hover{background:#c76272;color:#fff}
            .huajian-bgm-title{max-width:120px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#c76272;cursor:pointer}
            .huajian-bgm-collapse{border:none;background:transparent;color:#947479;font-size:.85rem;font-weight:900;cursor:pointer;padding:0 2px;line-height:1}
            .huajian-yt-hidden{position:fixed;width:2px;height:2px;left:0;top:0;opacity:0.001;pointer-events:none;overflow:hidden}
            @media(max-width:640px){
                .huajian-bgm-widget{left:12px;top:72px}
                .huajian-bgm-orb{width:40px;height:40px;font-size:1rem}
                .huajian-bgm-title{max-width:92px;font-size:.72rem}
            }
        `;
        document.head.appendChild(styleEl);

        const bgmWrap = document.createElement('div');
        bgmWrap.innerHTML = `
            <div class="huajian-yt-hidden"><div id="huajianYtPlayer"></div></div>
            <div class="huajian-bgm-widget${inGameMode ? ' hidden-in-game' : ''}" id="huajianBgmWidget">
                <button type="button" class="huajian-bgm-orb" id="huajianBgmOrb" title="點擊展開音樂控制／拖曳移動位置" aria-label="展開背景音樂控制">🎵</button>
                <div class="huajian-bgm-panel" id="huajianBgmPanel">
                    <button type="button" class="huajian-bgm-btn" id="huajianBgmToggle" aria-label="播放或暫停背景音樂">▶️</button>
                    <span class="huajian-bgm-title" id="huajianBgmTitle">${BGM_TRACKS[currentIdx].title}</span>
                    <button type="button" class="huajian-bgm-next" id="huajianBgmNext" title="隨機切換下一首" aria-label="隨機切換下一首">⏭</button>
                    <button type="button" class="huajian-bgm-collapse" id="huajianBgmCollapse" title="收合圓鈕" aria-label="收合圓鈕">✕</button>
                </div>
            </div>
        `;
        document.body.appendChild(bgmWrap);

        const widgetEl = document.getElementById('huajianBgmWidget');
        const orbEl = document.getElementById('huajianBgmOrb');

        function clampWidgetPosition() {
            if (!widgetEl) return;
            const rect = widgetEl.getBoundingClientRect();
            const w = rect.width || 44;
            const h = rect.height || 44;
            const pad = 8;
            let left = rect.left;
            let top = rect.top;
            if (rect.left < pad || rect.top < 58 || rect.right > window.innerWidth - pad || rect.bottom > window.innerHeight - pad) {
                left = Math.min(Math.max(pad, left), Math.max(pad, window.innerWidth - w - pad));
                top = Math.min(Math.max(58, top), Math.max(58, window.innerHeight - h - pad));
                widgetEl.style.left = left + 'px';
                widgetEl.style.top = top + 'px';
                widgetEl.style.right = 'auto';
                widgetEl.style.bottom = 'auto';
            }
        }

        function setExpanded(exp) {
            isExpanded = Boolean(exp);
            widgetEl.classList.toggle('expanded', isExpanded);
            clampWidgetPosition();
        }

        let dragState = null;
        let suppressNextOrbClick = false;

        widgetEl.addEventListener('pointerdown', function(e) {
            if (e.target.closest('button.huajian-bgm-btn, button.huajian-bgm-next, button.huajian-bgm-collapse, .huajian-bgm-title')) {
                return;
            }
            const rect = widgetEl.getBoundingClientRect();
            dragState = {
                pointerId: e.pointerId,
                startX: e.clientX,
                startY: e.clientY,
                origLeft: rect.
