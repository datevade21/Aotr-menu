local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")
local LocalPlayer = Players.LocalPlayer

local API_URL = "https://aotrmarket.onrender.com/api/update"
local requestFunc = (syn and syn.request) or (http and http.request) or http_request or (fluxus and fluxus.request) or request

task.spawn(function()
    while task.wait(3) do
        pcall(function()
            if requestFunc then
                local level = LocalPlayer:FindFirstChild("Data") and LocalPlayer.Data:FindFirstChild("Level") and LocalPlayer.Data.Level.Value or 0
                local beli = LocalPlayer:FindFirstChild("Data") and LocalPlayer.Data:FindFirstChild("Beli") and LocalPlayer.Data.Beli.Value or 0
                local fragments = LocalPlayer:FindFirstChild("Data") and LocalPlayer.Data:FindFirstChild("Fragments") and LocalPlayer.Data.Fragments.Value or 0
                local devilFruit = LocalPlayer:FindFirstChild("Data") and LocalPlayer.Data:FindFirstChild("DevilFruit") and LocalPlayer.Data.DevilFruit.Value or "None"
                if devilFruit == "" then devilFruit = "None" end

                local bounty = 0
                if LocalPlayer:FindFirstChild("leaderstats") and LocalPlayer.leaderstats:FindFirstChild("Bounty/Honor") then
                    bounty = LocalPlayer.leaderstats["Bounty/Honor"].Value
                end

                local sea = "Sea 1"
                if game.PlaceId == 4442272183 then 
                    sea = "Sea 2"
                elseif game.PlaceId == 7449423635 then 
                    sea = "Sea 3" 
                end

                requestFunc({
                    Url = API_URL,
                    Method = "POST",
                    Headers = { ["Content-Type"] = "application/json" },
                    Body = HttpService:JSONEncode({
                        username = LocalPlayer.Name,
                        level = level,
                        beli = beli,
                        fragments = fragments,
                        bounty = bounty,
                        devilFruit = devilFruit,
                        sea = sea,
                        status = "IN-GAME"
                    })
                })
            end
        end)
    end
end)
