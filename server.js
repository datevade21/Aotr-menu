const express = require('express');
const app = express();

// Render sẽ tự cấp Port qua process.env.PORT, nếu chạy thử ở máy thì mặc định dùng 6000
const PORT = process.env.PORT || 6000;

app.use(express.json());

const liveData = {};

// 1. Nhận dữ liệu từ script Lua trong game Roblox gửi về
app.post('/api/update', (req, res) => {
    const { username, game, level, beli, status } = req.body;
    if (!username) return res.status(400).json({ error: "Missing username" });

    liveData[username.toLowerCase()] = {
        game: game || "Blox Fruits",
        level: level || 0,
        beli: beli || 0,
        status: status || "IN-GAME",
        lastUpdated: new Date().toLocaleTimeString('vi-VN')
    };
    return res.json({ success: true });
});

// 2. Lấy thông tin từ Roblox API kết hợp với dữ liệu live từ game
app.get('/api/stats', async (req, res) => {
    const username = (req.query.username || "").trim();
    if (!username) return res.status(400).json({ error: "Vui lòng nhập Username" });

    try {
        // Lấy User ID từ Roblox API
        const userRes = await fetch("https://users.roblox.com/v1/usernames/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usernames: [username] })
        });
        const userData = await userRes.json();

        if (!userData.data || userData.data.length === 0) {
            return res.status(404).json({ error: "Không tìm thấy người dùng này trên Roblox" });
        }

        const user = userData.data[0];
        const userId = user.id;

        // Lấy ảnh Avatar đại diện
        const avatarRes = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=true`);
        const avatarData = await avatarRes.json();
        const avatarUrl = avatarData.data?.[0]?.imageUrl || "";

        // Kiểm tra xem người chơi có đang treo script gửi dữ liệu về không
        const live = liveData[username.toLowerCase()];

        return res.json({
            id: userId,
            username: user.name,
            displayName: user.displayName,
            avatarUrl: avatarUrl,
            game: live ? live.game : "Chưa vào game",
            level: live ? live.level : "Chưa bật script",
            beli: live ? live.beli : 0,
            status: live ? live.status : "OFFLINE",
            lastUpdated: live ? live.lastUpdated : "Chưa ghi nhận"
        });
    } catch (err) {
        return res.status(500).json({ error: "Lỗi kết nối tới Roblox API" });
    }
});

// 3. Giao diện Web HOMELESS STATS
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Homeless Stats</title>
        <style>
            * { box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            body { background-color: #0d1117; color: #c9d1d9; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }
            .card { background: #161b22; border: 1px solid #30363d; border-radius: 16px; width: 100%; max-width: 420px; padding: 24px; box-shadow: 0 12px 32px rgba(0,0,0,0.6); }
            h2 { color: #f59e0b; text-align: center; margin: 0 0 18px 0; font-size: 24px; letter-spacing: 1.5px; }
            .input-group { display: flex; gap: 8px; margin-bottom: 20px; }
            input { flex: 1; background: #0d1117; border: 1px solid #30363d; border-radius: 8px; padding: 12px 14px; color: #fff; font-size: 15px; outline: none; }
            input:focus { border-color: #f59e0b; }
            button { background: #f59e0b; color: #000; border: none; font-weight: bold; border-radius: 8px; padding: 0 20px; cursor: pointer; transition: 0.2s; }
            button:hover { background: #d97706; }
            .stats-box { display: none; background: #0d1117; border-radius: 12px; padding: 18px; border: 1px solid #21262d; margin-top: 10px; }
            .user-header { display: flex; align-items: center; gap: 14px; border-bottom: 1px solid #21262d; padding-bottom: 14px; margin-bottom: 14px; }
            .avatar { width: 52px; height: 52px; border-radius: 50%; border: 2px solid #f59e0b; background: #21262d; }
            .user-meta { flex: 1; }
            .display-name { font-weight: bold; font-size: 16px; color: #f0f6fc; }
            .username { font-size: 13px; color: #8b949e; }
            .badge { padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; text-align: center; }
            .badge-online { background: #23863622; color: #3fb950; border: 1px solid #23863655; }
            .badge-offline { background: #da363322; color: #f85149; border: 1px solid #da363355; }
            .stat-row { display: flex; justify-content: space-between; margin: 10px 0; font-size: 14px; color: #8b949e; }
            .stat-val { font-weight: bold; color: #58a6ff; }
            .beli-val { font-weight: bold; color: #3fb950; }
            .error { color: #f85149; font-size: 13px; text-align: center; margin-top: 10px; display: none; }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>HOMELESS STATS</h2>
            <div class="input-group">
                <input type="text" id="usernameInput" placeholder="Nhập Roblox Username...">
                <button onclick="startTracking()">Tra cứu</button>
            </div>
            <div id="errorMsg" class="error"></div>
            <div id="statsBox" class="stats-box">
                <div class="user-header">
                    <img id="dispAvatar" class="avatar" src="" alt="avatar">
                    <div class="user-meta">
                        <div id="dispDisplayName" class="display-name">---</div>
                        <div id="dispUsername" class="username">@---</div>
                    </div>
                    <span class="badge" id="dispStatus">OFFLINE</span>
                </div>
                <div class="stat-row">
                    <span>Trò chơi</span>
                    <span class="stat-val" id="dispGame" style="color:#c9d1d9;">---</span>
                </div>
                <div class="stat-row">
                    <span>LEVEL</span>
                    <span class="stat-val" id="dispLevel">---</span>
                </div>
                <div class="stat-row">
                    <span>TIỀN / BELI</span>
                    <span class="beli-val" id="dispBeli">$0</span>
                </div>
                <div class="stat-row" style="font-size: 11px; margin-bottom: 0;">
                    <span>Cập nhật lúc:</span>
                    <span id="dispTime" style="color: #8b949e;">--:--:--</span>
                </div>
            </div>
        </div>

        <script>
            let loopId = null;

            async function fetchStats() {
                const user = document.getElementById('usernameInput').value.trim();
                const errDiv = document.getElementById('errorMsg');
                const statsBox = document.getElementById('statsBox');

                if (!user) return;

                try {
                    const res = await fetch('/api/stats?username=' + encodeURIComponent(user));
                    const data = await res.json();

                    if (!res.ok) {
                        errDiv.innerText = data.error;
                        errDiv.style.display = 'block';
                        statsBox.style.display = 'none';
                        return;
                    }

                    errDiv.style.display = 'none';
                    statsBox.style.display = 'block';
                    
                    document.getElementById('dispAvatar').src = data.avatarUrl;
                    document.getElementById('dispDisplayName').innerText = data.displayName;
                    document.getElementById('dispUsername').innerText = '@' + data.username;
                    document.getElementById('dispGame').innerText = data.game;
                    document.getElementById('dispLevel').innerText = typeof data.level === 'number' ? 'Lv. ' + data.level.toLocaleString() : data.level;
                    document.getElementById('dispBeli').innerText = '$' + Number(data.beli).toLocaleString();
                    document.getElementById('dispTime').innerText = data.lastUpdated;

                    const statusBadge = document.getElementById('dispStatus');
                    statusBadge.innerText = data.status;
                    statusBadge.className = 'badge ' + (data.status === 'ONLINE' || data.status === 'IN-GAME' ? 'badge-online' : 'badge-offline');
                } catch (e) {
                    errDiv.innerText = 'Lỗi kết nối tới máy chủ';
                    errDiv.style.display = 'block';
                }
            }

            function startTracking() {
                if (loopId) clearInterval(loopId);
                fetchStats();
                loopId = setInterval(fetchStats, 3000);
            }
        </script>
    </body>
    </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});
