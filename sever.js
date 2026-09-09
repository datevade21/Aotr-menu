const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 7000;

app.use(express.json());

// Cho phép phục vụ file tĩnh (index.html)
app.use(express.static(__dirname));

const liveData = {};

// API nhận dữ liệu từ Roblox Lua
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
        lastUpdated: new Date().toLocaleTimeString()
    };
    return res.json({ success: true });
});

// API xuất dữ liệu tra cứu
app.get('/api/stats', async (req, res) => {
    const username = (req.query.username || "").trim();
    if (!username) return res.status(400).json({ error: "Vui lòng nhập Username" });

    try {
        const userRes = await fetch("https://users.roblox.com/v1/usernames/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usernames: [username] })
        });
        const userData = await userRes.json();

        if (!userData.data || userData.data.length === 0) {
            return res.status(404).json({ error: "Không tìm thấy người dùng" });
        }

        const user = userData.data[0];
        const userId = user.id;

        const avatarRes = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=true`);
        const avatarData = await avatarRes.json();
        const avatarUrl = avatarData.data?.[0]?.imageUrl || "";

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
        return res.status(500).json({ error: "Lỗi kết nối API Roblox" });
    }
});

// Trả về file HTML sạch sẽ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Server đang chạy ở port ${PORT}`));
