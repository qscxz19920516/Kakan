// ★ 花間小憩全站共用盲盒選單與資料夾自動同步模組 (支援 100+ 系列與快速搜尋)
(function(){
    const GITHUB_OWNER = "qscxz19920516";
    const GITHUB_REPO = "Kakan";
    const CACHE_KEY = "huajian_kakan_series_v4_" + GITHUB_OWNER + "_" + GITHUB_REPO;
    const EXCLUDED_FOLDERS = new Set([".github", "assets", "css", "js", "images", "img", "fonts", "職業", "職業介紹", "小卡", "小卡圖鑑", "card", "cards"]);

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
        // 依照中文筆畫/自然數字順序排序，確保 44 ~ 100+ 個系列排列整齊
        const folderPaths = Object.keys(targetMap).sort((a, b) =>
            targetMap[a].displayName.localeCompare(targetMap[b].displayName, 'zh-Hant', { numeric: true })
        );
        const autoConfig = {};
        folderPaths.forEach((relPath, idx) => {
            const info = targetMap[relPath];
            let shortName = extractShortSeriesName(info.displayName);
            // 若不同資料夾去掉前綴後恰好同名，保留完整資料夾名避免覆蓋
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
                // 1. 取得該分支最新 commit 的 tree SHA，避免直接呼叫 trees/main 時遇到分支快取或深層樹截斷
                const branchRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/branches/${br}?_=${Date.now()}`);
                let treeSha = br;
                if (branchRes.ok) {
                    const branchData = await branchRes.json();
                    if (branchData && branchData.commit && branchData.commit.commit && branchData.commit.commit.tree) {
                        treeSha = branchData.commit.commit.tree.sha;
                    }
                }

                // 2. 遞迴讀取完整檔案樹
                const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/trees/${treeSha}?recursive=1&_=${Date.now()}`);
                if (!res.ok) continue;
                const data = await res.json();
                if (!data.tree) continue;

                const folderMap = {};
                data.tree.forEach(item => {
                    if (item.type !== 'blob') return;
                    if (!/\.(jpg|jpeg|png|webp|gif)$/i.test(item.path)) return;

                    const parts = item.path.split('/');
                    if (parts.length < 2) return; // 略過根目錄單張圖片（如 Kakan的原.jpg）

                    const fileName = parts[parts.length - 1];
                    const parentFolderName = parts[parts.length - 2];
                    const folderRelPath = parts.slice(0, -1).join('/');
                    const memberName = fileName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');

                    // 排除非盲盒的系統資料夾，其餘只要裡面放有圖片的資料夾全部收錄（不受前綴符號限制）
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
        const subMenu = document.getElementById('subMenu');
        if (!subMenu) return;

        const keys = Object.keys(seriesConfig);
        const isBoxPage = typeof window.selectSeries === 'function';

        // 更新「驚喜盲盒」主標題旁顯示總系列數量徽章
        const subToggleSpan = document.querySelector('.sub-toggle > span:first-child');
        if (subToggleSpan) {
            subToggleSpan.innerHTML = `🎁 驚喜盲盒 <span style="font-size:.75rem;background:#ffeef1;color:#c76272;padding:2px 8px;border-radius:10px;margin-left:4px">共 ${keys.length} 組</span>`;
        }

        // 當系列超過 8 組時，在子選單頂部自動加入即時搜尋框，方便 44~100 組快速篩選
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
                ? `onclick="goBox(event, '${key.replace(/'/g, "\'")}')"`
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

    window.HuajianMenu = {
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
