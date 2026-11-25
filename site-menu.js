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
    // ★ 花間小憩全站 YouTube 背景音樂隨機輪播器（小遊戲期間自動暫停）
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
            .huajian-bgm-bar{position:fixed;left:16px;bottom:20px;z-index:85;display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.94);backdrop-filter:blur(8px);border:2px solid #f0a8b4;border-radius:999px;padding:6px 12px;box-shadow:0 5px 16px rgba(226,158,168,.28);font-size:.8rem;font-weight:900;color:#5a4649;transition:.25s}
            .huajian-bgm-bar.hidden-in-game{display:none !important}
            .huajian-bgm-btn{border:none;background:linear-gradient(135deg,#ff9a9e,#f68084);color:#fff;width:28px;height:28px;border-radius:50%;font-size:.82rem;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 6px rgba(246,128,132,.35)}
            .huajian-bgm-next{border:1.5px solid #f2bec7;background:#fff8f9;color:#c76272;width:26px;height:26px;border-radius:50%;font-size:.76rem;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
            .huajian-bgm-next:hover{background:#c76272;color:#fff}
            .huajian-bgm-title{max-width:140px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#c76272;cursor:pointer}
            .huajian-yt-hidden{position:fixed;width:2px;height:2px;left:0;top:0;opacity:0.001;pointer-events:none;overflow:hidden}
            @media(max-width:520px){.huajian-bgm-bar{left:12px;bottom:16px;padding:5px 10px}.huajian-bgm-title{max-width:105px;font-size:.74rem}}
        `;
        document.head.appendChild(styleEl);

        const bgmWrap = document.createElement('div');
        bgmWrap.innerHTML = `
            <div class="huajian-yt-hidden"><div id="huajianYtPlayer"></div></div>
            <div class="huajian-bgm-bar${inGameMode ? ' hidden-in-game' : ''}" id="huajianBgmBar" title="花間背景音樂（點擊可播放/暫停）">
                <button type="button" class="huajian-bgm-btn" id="huajianBgmToggle" aria-label="播放或暫停背景音樂">▶️</button>
                <span class="huajian-bgm-title" id="huajianBgmTitle">點我播 ${BGM_TRACKS[currentIdx].title}</span>
                <button type="button" class="huajian-bgm-next" id="huajianBgmNext" title="隨機切換下一首" aria-label="隨機切換下一首">⏭</button>
            </div>
        `;
        document.body.appendChild(bgmWrap);

        function updateBgmUI() {
            const bar = document.getElementById('huajianBgmBar');
            const toggleBtn = document.getElementById('huajianBgmToggle');
            const titleEl = document.getElementById('huajianBgmTitle');
            if (!bar || !toggleBtn || !titleEl) return;

            bar.classList.toggle('hidden-in-game', inGameMode);
            const track = BGM_TRACKS[currentIdx];
            if (isPlayingNow) {
                titleEl.textContent = `♪ ${track.title}`;
                toggleBtn.textContent = '⏸';
            } else if (userPaused) {
                titleEl.textContent = `已暫停・${track.title}`;
                toggleBtn.textContent = '▶️';
            } else {
                titleEl.textContent = `點我播 ${track.title}`;
                toggleBtn.textContent = '▶️';
            }
        }

        function tryPlayCurrent() {
            if (inGameMode || userPaused || !ytReady || !ytPlayer) return;
            try {
                if (typeof ytPlayer.unMute === 'function') ytPlayer.unMute();
                if (typeof ytPlayer.setVolume === 'function') ytPlayer.setVolume(65);
                if (typeof ytPlayer.playVideo === 'function') ytPlayer.playVideo();
            } catch (e) {}
        }

        function playNextRandomTrack() {
            currentIdx = pickNextRandomIndex(currentIdx);
            userPaused = false;
            gestureUnlocked = true;
            localStorage.setItem(BGM_PREF_KEY, "0");
            updateBgmUI();
            if (ytReady && ytPlayer && !inGameMode) {
                try {
                    if (typeof ytPlayer.unMute === 'function') ytPlayer.unMute();
                    if (typeof ytPlayer.setVolume === 'function') ytPlayer.setVolume(65);
                    if (typeof ytPlayer.loadVideoById === 'function') {
                        ytPlayer.loadVideoById(BGM_TRACKS[currentIdx].id);
                    }
                } catch (e) {}
            }
        }

        document.getElementById('huajianBgmToggle').addEventListener('click', function(e) {
            e.stopPropagation();
            if (isPlayingNow) {
                userPaused = true;
                localStorage.setItem(BGM_PREF_KEY, "1");
                try { if (ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo(); } catch (err) {}
                isPlayingNow = false;
            } else {
                userPaused = false;
                gestureUnlocked = true;
                localStorage.setItem(BGM_PREF_KEY, "0");
                if (!ytPlayer && window.YT && window.YT.Player) {
                    initYouTubePlayer();
                }
                tryPlayCurrent();
            }
            updateBgmUI();
        });

        document.getElementById('huajianBgmTitle').addEventListener('click', function(e) {
            e.stopPropagation();
            document.getElementById('huajianBgmToggle').click();
        });

        document.getElementById('huajianBgmNext').addEventListener('click', function(e) {
            e.stopPropagation();
            playNextRandomTrack();
        });

        function onFirstGesture() {
            gestureUnlocked = true;
            if (!inGameMode && !userPaused && !isPlayingNow) {
                tryPlayCurrent();
            }
        }
        ['pointerdown', 'touchstart', 'keydown'].forEach(evt => {
            window.addEventListener(evt, onFirstGesture, { passive: true });
        });

        window.HuajianBGM = {
            enterGameMode: function() {
                inGameMode = true;
                if (ytReady && ytPlayer) {
                    try { ytPlayer.pauseVideo(); } catch (e) {}
                }
                isPlayingNow = false;
                updateBgmUI();
            },
            exitGameMode: function() {
                inGameMode = false;
                updateBgmUI();
                if (!userPaused) {
                    tryPlayCurrent();
                }
            },
            nextTrack: playNextRandomTrack
        };

        function initYouTubePlayer() {
            if (ytPlayer || !window.YT || !window.YT.Player) return;
            const originParam = (window.location.origin && window.location.origin.startsWith('http'))
                ? { origin: window.location.origin }
                : {};
            ytPlayer = new window.YT.Player('huajianYtPlayer', {
                height: '2',
                width: '2',
                videoId: BGM_TRACKS[currentIdx].id,
                playerVars: Object.assign({
                    autoplay: 0,
                    controls: 0,
                    disablekb: 1,
                    fs: 0,
                    modestbranding: 1,
                    playsinline: 1,
                    rel: 0
                }, originParam),
                events: {
                    onReady: function(event) {
                        ytReady = true;
                        updateBgmUI();
                        if (!inGameMode && !userPaused && gestureUnlocked) {
                            tryPlayCurrent();
                        }
                    },
                    onStateChange: function(event) {
                        if (!window.YT || !window.YT.PlayerState) return;
                        if (event.data === window.YT.PlayerState.PLAYING) {
                            if (inGameMode) {
                                try { event.target.pauseVideo(); } catch (e) {}
                                isPlayingNow = false;
                            } else {
                                isPlayingNow = true;
                            }
                            updateBgmUI();
                        } else if (event.data === window.YT.PlayerState.PAUSED) {
                            isPlayingNow = false;
                            updateBgmUI();
                        } else if (event.data === window.YT.PlayerState.ENDED) {
                            isPlayingNow = false;
                            if (!inGameMode && !userPaused) {
                                playNextRandomTrack();
                            } else {
                                updateBgmUI();
                            }
                        }
                    },
                    onError: function() {
                        if (!inGameMode && !userPaused && gestureUnlocked) {
                            currentIdx = pickNextRandomIndex(currentIdx);
                            updateBgmUI();
                            try { event.target.loadVideoById(BGM_TRACKS[currentIdx].id); } catch (e) {}
                        }
                    }
                }
            });
        }

        const prevYtReady = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = function() {
            if (typeof prevYtReady === 'function') prevYtReady();
            initYouTubePlayer();
        };

        if (window.YT && window.YT.Player) {
            initYouTubePlayer();
        } else if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(tag);
        }

        updateBgmUI();
    }
})();
