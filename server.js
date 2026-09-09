const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 7000;

app.use(express.json());
app.use(express.static(__dirname));

// Bộ nhớ lưu dữ liệu live của người dùng chạy Script
const liveData = {};

// Cấu hình Axios giả lập trình duyệt tránh Roblox rate-limit / 403
const robloxAxios = axios.create({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    timeout: 5000
});

// API nhận dữ liệu từ Script Lua trong Game
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

// API Tra cứu: Tra cứu BẤT KỲ username nào
app.get('/api/stats', async (req, res) => {
    const searchUser = (req.query.username || "").trim();
    if (!searchUser) return res.status(400).json({ error: "Vui lòng nhập Username" });

    try {
        // 1. Lấy UserId từ Roblox
        const userRes = await robloxAxios.post("https://users.roblox.com/v1/usernames/users", {
            usernames: [searchUser],
            excludeBannedUsers: false
        });

        if (!userRes.data || !userRes.data.data || userRes.data.data.length === 0) {
            return res.status(404).json({ error: "Không tìm thấy người dùng Roblox này!" });
        }

        const user = userRes.data.data[0];
        const userId = user.id;

        // 2. Lấy Avatar từ Roblox
        let avatarUrl = "https://tr.rbxcdn.com/30day-avatar-headshot";
        try {
            const avatarRes = await robloxAxios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=true`);
            if (avatarRes.data && avatarRes.data.data && avatarRes.data.data.length > 0) {
                avatarUrl = avatarRes.data.data[0].imageUrl;
            }
        } catch (e) {}

        // 3. Đọc dữ liệu Realtime (Nếu người này đang/đã chạy Script)
        const live = liveData[user.name.toLowerCase()];

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
            devilFruit: live ? live.devilFruit : "Chưa bật Script",
            sea: live ? live.sea : "Chưa vào game",
            status: live ? live.status : "OFFLINE",
            lastUpdated: live ? live.lastUpdated : "Chưa có dữ liệu"
        });

    } catch (err) {
        console.error("Lỗi:", err.message);
        return res.status(500).json({ error: "Lỗi kết nối tới hệ thống Roblox!" });
    }
});

// Phục vụ trang HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Server chạy trên port ${PORT}`));
