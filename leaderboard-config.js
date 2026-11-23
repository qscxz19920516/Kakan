// ★ 花間小憩・公會小遊戲排行榜設定與 57 位成員總表
// 【部署完 Google Apps Script 後，只需把網址貼進下方 LEADERBOARD_API_URL 即可！】
window.HUAJIAN_LEADERBOARD = {
    API_URL: "https://script.google.com/macros/library/d/1oEAWMKwhLaZzt4f3rwm40CH78Z-hWmNvJpOQ6hTH3Wlc9ArWd9Buhx1t/1",
    MEMBERS: [
        "壞壞呦", "薇糖", "47", "空弦", "阿燁", "一劍", "星星", "布布", "鯤鯤", "花龍",
        "蕭蕭", "牙牙", "小杯", "小雨", "阿瀾", "MO", "雷雷", "笙笙", "咕咕", "毒乃",
        "狼", "EE", "夜夜", "乖乖呦", "夜影", "閃閃", "鼠鼠", "貝貝", "Yang", "露璐",
        "金冬狗", "茶茶", "百百", "米米", "百變", "夜悾", "貓龍", "星隕", "回皿回", "恩匹西",
        "牛肉包", "鴿子", "哩麥悶", "村村", "霜霜", "秋月", "兔兔呦", "糖糖", "鬼見愁", "睡喵",
        "香香", "阿然", "烏拉", "獅獅", "克咪", "寶哥", "喵來"
    ],
    STORAGE_PLAYER_KEY: "huajian_selected_member_v1",
    isConfigured: function() {
        return this.API_URL && this.API_URL.startsWith("https://script.google.com/");
    },
    fetchTop: async function(gameKey) {
        if (!this.isConfigured()) return { ok: false, unconfigured: true, top: [] };
        const res = await fetch(`${this.API_URL}?game=${encodeURIComponent(gameKey)}&_=${Date.now()}`);
        return await res.json();
    },
    submitScore: async function(gameKey, name, score, detail) {
        if (!this.isConfigured()) return { ok: false, unconfigured: true, top: [] };
        const res = await fetch(this.API_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ game: gameKey, name: name, score: score, detail: detail })
        });
        return await res.json();
    }
};
