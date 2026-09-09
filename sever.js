const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 7000;

app.use(express.json());
app.use(express.static(__dirname));

const liveData = {};

// Cấu hình Header giả lập trình duyệt để Roblox không chặn Server
const robloxAxios = axios.create({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    timeout: 5000
});

// API nhận dữ liệu từ Roblox Script (Lua)
app.post('/api/update', (req, res) => {
    const { username, game, level, beli, fragments, bounty, devilFruit, sea, status } = req.body;
    if (!username) return res.status(400).json({ error: "Missing username" });

    liveData[username.toLowerCase()] = {
        game: game || "Blox Fruits",
        level: level || 0,
        beli: beli || 0,
        fragments: fragments || 0,
        bounty: bounty || 0,
        devilFruit: devilFruit || "None",
        sea: sea || "Sea 1",
        status: status || "IN-GAME",
        lastUpdated: new Date().toLocaleTimeString('vi-VN')
    };
    return res.json({ success: true });
});

// API Tra cứu Stats
app.get('/api/stats', async (req, res) => {
    const username = (req.query.username || "").trim();
    if (!username) return res.status(400).json({ error: "Vui lòng nhập Username" });

    try {
        // 1. Tìm UserId từ Username
        const userRes = await robloxAxios.post("https://users.roblox.com/v1/usernames/users", {
            usernames: [username],
            excludeBannedUsers: false
        });

        if (!userRes.data || !userRes.data.data || userRes.data.data.length === 0) {
            return res.status(404).json({ error: "Không tìm thấy Roblox User này!" });
        }

        const user = userRes.data.data[0];
        const userId = user.id;

        // 2. Lấy Avatar Headshot
        let avatarUrl = "https://tr.rbxcdn.com/30day-avatar-headshot";
        try {
            const avatarRes = await robloxAxios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=true`);
            if (avatarRes.data && avatarRes.data.data && avatarRes.data.data.length > 0) {
                avatarUrl = avatarRes.data.data[0].imageUrl;
            }
        } catch (e) {
            console.log("Lỗi lấy avatar, dùng avatar mặc định");
        }

        // 3. Lấy live stats từ Game Script (nếu có)
        const live = liveData[username.toLowerCase()];

        return res.json({
            id: userId,
            username: user.name,
            displayName: user.displayName,
            avatarUrl: avatarUrl,
            game: live ? live.game : "Blox Fruits",
            level: live ? live.level : 0,
            beli: live ? live.beli : 0,
            fragments: live ? live.fragments : 0,
            bounty: live ? live.bounty : 0,
            devilFruit: live ? live.devilFruit : "Không rõ",
            sea: live ? live.sea : "Chưa vào game",
            status: live ? live.status : "OFFLINE",
            lastUpdated: live ? live.lastUpdated : "Chưa ghi nhận"
        });

    } catch (err) {
        console.error("Lỗi API Roblox:", err.message);
        return res.status(500).json({ error: "Lỗi kết nối API Roblox hoặc bị Rate Limit" });
    }
});

// Trả về file HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Server đang chạy trên port ${PORT}`));
