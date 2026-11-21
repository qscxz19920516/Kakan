// ★ 花間小憩全站共用選單與盲盒自動同步模組
// 【以後新增遊戲或頁面，只需修改下方 SITE_NAV_ITEMS，全站所有網頁都會自動同步顯示！】
(function(){
    const GITHUB_OWNER = "qscxz19920516";
    const GITHUB_REPO = "Kakan";
    const CACHE_KEY = "huajian_kakan_series_v4_" + GITHUB_OWNER + "_" + GITHUB_REPO;
    const EXCLUDED_FOLDERS = new Set([".github", "assets", "css", "js", "images", "img", "fonts", "職業", "職業介紹", "小卡", "小卡圖鑑", "card", "cards"]);

    // ▼ 全站主選單總表（全站每一頁都會同步讀取這份清單）
    const SITE_NAV_ITEMS = [
        { icon: "🏠", label: "首頁", href: "index.html" },
        { icon: "🎴", label: "小卡圖鑑", href: "card.html" },
        { type: "blindbox", icon: "🎁", label: "驚喜盲盒" },
        { icon: "🎮", label: "公會小遊戲 1", href: "game1.html" }
        // 未來要加第二個遊戲，只要在上面那行後面加逗號，並貼上下一行即可：
        // ,{ icon: "🎲", label: "公會小遊戲 2", href: "game2.html" }
    ];

    const FALLBACK_RAW = [
        { name: "袋裝零食", folder: "花間 × 袋裝零食", members: ["爆米花", "奶油曲奇", "棉花糖", "糖果球", "洋芋片", "巧克力"] },
        { name: "飲品", folder: "花間 × 飲品", members: ["哈密瓜午睡", "桃氣出逃", "莓有煩惱", "葡萄夜航", "橘子超載", "檸檬暴走", "藍色失重"] },
        { name: "童話反派", folder: "花間 × 童話反派", members: ["虎克船長", "後母", "烏蘇拉", "黑魔女", "賈方", "壞皇后"] },
        { name: "多巴胺女團", folder: "花間 × 多巴胺女團", members: ["C位", "Leader", "Rapper", "主唱", "主舞", "門面"] }
    ];

    function getSeriesTheme(index) {
        const hue = Math.round((index * 137.508 + 28) % 360);
        const sat = index % 2 === 0 ? 74 : 66;
        const lightMain = index % 3 === 1 ? 45 : 50;
        const lightTop = Math.min(68, lightMain + 11);
        const lightBot = Math.max(34, lightMain - 9);
        return {
            color: `hsl(${hue}, ${sat}%, ${lightMain}%)`,
            softBg: `hsl(${hue}, 85%, 96%)`,
            bg: `linear-gradient(135deg, hsl(${hue}, ${sat}%, ${lightTop}%), hsl(${(hue + 14) % 360}, ${sat}%, ${lightBot}%))`
        };
    }

    function extractShortSeriesName(folderName) {
        return folderName.replace(/^花間\s*[×xX＊*]\s*/, '').replace(/盒$/, '').trim() || folderName;
    }

    function buildConfigFromMap(targetMap) {
        const folderPaths = Object.keys(targetMap).sort((a, b) =>
            targetMap[a].displayName.localeCompare(targetMap[b].displayName, 'zh-Hant', { numeric: true })
        );
        const autoConfig = {};
        folderPaths.forEach((relPath, idx) => {
            const info = targetMap[relPath];
            let shortName = extractShortSeriesName(info.displayName);
            if (autoConfig[shortName]) {
                shortName = info.displayName;
            }
            const theme = getSeriesTheme(idx);
            const num = String(idx + 1).padStart(2, '0');
            autoConfig[shortName] = {
                folder: relPath,
                displayFolder: info.displayName,
                color: theme.color,
                softBg: theme.softBg,
                bg: theme.bg,
                seriesNo: `SERIES ${num}・${info.displayName}`,
                members: info.members
            };
        });
        return autoConfig;
    }

    function getFallbackConfig() {
        const map = {};
        FALLBACK_RAW.forEach(item => {
            map[item.folder] = { displayName: item.folder, members: item.members };
        });
        return buildConfigFromMap(map);
    }

    function getCurrentPageFile() {
        const path = window.location.pathname.split('/').pop();
        return (!path || path === '') ? 'index.html' : path.toLowerCase();
    }

    // 自動渲染全站一致的側邊選單骨架（支援所有頁面與無限新增遊戲）
    function mountGlobalDrawer() {
        const drawerList = document.querySelector('#drawer .drawer-list');
        if (!drawerList) return;

        const curFile = getCurrentPageFile();
        let html = '';

        SITE_NAV_ITEMS.forEach(item => {
            if (item.type === 'blindbox') {
                html += `<li>
                    <div class="sub-toggle" onclick="toggleSubMenu()">
                        <span>${item.icon} ${item.label}</span>
                        <span class="arrow" id="subArrow">&gt;</span>
                    </div>
                    <ul class="submenu" id="subMenu"></ul>
                </li>`;
            } else {
                const isCur = curFile === (item.href || '').toLowerCase();
                html += `<li>
                    <a href="${item.href}" class="${isCur ? 'current' : ''}">
                        <span>${item.icon} ${item.label}</span>
                        <span class="arrow">&gt;</span>
                    </a>
                </li>`;
            }
        });

        drawerList.innerHTML = html;
    }

    async function fetchAllSeries(bypassCache = false) {
        if (!bypassCache) {
            try {
                const cached = sessionStorage.getItem(CACHE_KEY);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (Object.keys(parsed).length > 0) return parsed;
                }
            } catch (e) {}
        }

        const branches = ["main", "master"];
        for (const br of branches) {
            try {
                const branchRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/branches/${br}?_=${Date.now()}`);
                let treeSha = br;
                if (branchRes.ok) {
                    const branchData = await branchRes.json();
                    if (branchData && branchData.commit && branchData.commit.commit && branchData.commit.commit.tree) {
                        treeSha = branchData.commit.commit.tree.sha;
                    }
                }

                const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/trees/${treeSha}?recursive=1&_=${Date.now()}`);
                if (!res.ok) continue;
                const data = await res.json();
                if (!data.tree) continue;

                const folderMap = {};
                data.tree.forEach(item => {
                    if (item.type !== 'blob') return;
                    if (!/\.(jpg|jpeg|png|webp|gif)$/i.test(item.path)) return;

                    const parts = item.path.split('/');
                    if (parts.length < 2) return;

                    const fileName = parts[parts.length - 1];
                    const parentFolderName = parts[parts.length - 2];
                    const folderRelPath = parts.slice(0, -1).join('/');
                    const memberName = fileName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');

                    if (EXCLUDED_FOLDERS.has(parentFolderName.toLowerCase())) return;
                    if (parts.some(p => EXCLUDED_FOLDERS.has(p.toLowerCase()))) return;

                    if (!folderMap[folderRelPath]) {
                        folderMap[folderRelPath] = { displayName: parentFolderName, members: [] };
                    }
                    if (!folderMap[folderRelPath].members.includes(memberName)) {
                        folderMap[folderRelPath].members.push(memberName);
                    }
                });

                if (Object.keys(folderMap).length > 0) {
                    const cfg = buildConfigFromMap(folderMap);
                    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(cfg)); } catch (e) {}
                    return cfg;
                }
            } catch (e) {}
        }
        return getFallbackConfig();
    }

    function renderSharedSubMenu(seriesConfig, options = {}) {
        mountGlobalDrawer();
        const subMenu = document.getElementById('subMenu');
        if (!subMenu) return;

        const keys = Object.keys(seriesConfig);
        const isBoxPage = typeof window.selectSeries === 'function';

        const subToggleSpan = document.querySelector('.sub-toggle > span:first-child');
        if (subToggleSpan) {
            subToggleSpan.innerHTML = `🎁 驚喜盲盒 <span style="font-size:.75rem;background:#ffeef1;color:#c76272;padding:2px 8px;border-radius:10px;margin-left:4px">共 ${keys.length} 組</span>`;
        }

        let searchHtml = '';
        if (keys.length > 8) {
            searchHtml = `<li style="padding:10px 14px 10px 30px;background:#fff5f7;border-bottom:1px dashed #f2bec7;position:sticky;top:0;z-index:2">
                <input type="text" id="seriesSearchInput" placeholder="🔍 輸入關鍵字搜尋 (${keys.length}組)..." 
                    style="width:100%;padding:7px 12px;border-radius:14px;border:1.5px solid #f0a8b4;font-size:.85rem;color:#5a4649;outline:none;background:#fff"
                    oninput="window.HuajianMenu.filterMenu(this.value)">
            </li>`;
        }

        let itemsHtml = '';
        keys.forEach(key => {
            const cfg = seriesConfig[key];
            const label = cfg.displayFolder || cfg.folder;
            const clickAttr = isBoxPage
                ? `onclick="goBox(event, '${key.replace(/'/g, "\\'")}')"`
                : '';
            itemsHtml += `<li class="series-menu-item" data-label="${label.toLowerCase()}">
                <a href="box.html?job=${encodeURIComponent(label)}" data-series="${key}" ${clickAttr}>
                    <span>${label}</span>
                    <span class="arrow">&gt;</span>
                </a>
            </li>`;
        });

        subMenu.innerHTML = searchHtml + itemsHtml;
        if (options.onRendered) options.onRendered(seriesConfig);
    }

    // 頁面一載入先立刻畫出主選單骨架，等 GitHub 資料回來再自動補上盲盒列表
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mountGlobalDrawer);
    } else {
        mountGlobalDrawer();
    }

    window.HuajianMenu = {
        mountGlobalDrawer,
        fetchAllSeries,
        renderSharedSubMenu,
        extractShortSeriesName,
        filterMenu: function(keyword) {
            const q = (keyword || '').trim().toLowerCase();
            document.querySelectorAll('#subMenu .series-menu-item').forEach(li => {
                const text = li.dataset.label || '';
                li.style.display = (!q || text.includes(q)) ? '' : 'none';
            });
        }
    };
})();
