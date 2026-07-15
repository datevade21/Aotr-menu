-- Attack on Titan Revolution - Homeless Menu
-- Đẹp - Có nút Fix Lag + Join Discord

local player = game.Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

local screenGui = Instance.new("ScreenGui")
screenGui.Name = "HomelessMenu"
screenGui.ResetOnSpawn = false
screenGui.Parent = playerGui

local mainFrame = Instance.new("Frame")
mainFrame.Size = UDim2.new(0, 380, 0, 420)
mainFrame.Position = UDim2.new(0.5, -190, 0.5, -210)
mainFrame.BackgroundColor3 = Color3.fromRGB(10, 10, 18)
mainFrame.BorderSizePixel = 0
mainFrame.Parent = screenGui

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 20)
corner.Parent = mainFrame

local gradient = Instance.new("UIGradient")
gradient.Color = ColorSequence.new{
    ColorSequenceKeypoint.new(0, Color3.fromRGB(25, 25, 40)),
    ColorSequenceKeypoint.new(1, Color3.fromRGB(10, 10, 18))
}
gradient.Rotation = 90
gradient.Parent = mainFrame

-- Title
local title = Instance.new("TextLabel")
title.Size = UDim2.new(1, 0, 0, 70)
title.BackgroundTransparency = 1
title.Text = "⚔️ ATTACK ON TITAN REVOLUTION ⚔️"
title.TextColor3 = Color3.fromRGB(255, 80, 80)
title.TextScaled = true
title.Font = Enum.Font.GothamBlack
title.Parent = mainFrame

local subtitle = Instance.new("TextLabel")
subtitle.Size = UDim2.new(1, 0, 0, 30)
subtitle.Position = UDim2.new(0, 0, 0, 55)
subtitle.BackgroundTransparency = 1
subtitle.Text = "Homeless Menu"
subtitle.TextColor3 = Color3.fromRGB(180, 180, 255)
subtitle.TextScaled = true
subtitle.Font = Enum.Font.GothamBold
subtitle.Parent = mainFrame

-- Close Button
local closeBtn = Instance.new("TextButton")
closeBtn.Size = UDim2.new(0, 40, 0, 40)
closeBtn.Position = UDim2.new(1, -45, 0, 10)
closeBtn.BackgroundColor3 = Color3.fromRGB(220, 50, 50)
closeBtn.Text = "✕"
closeBtn.TextColor3 = Color3.new(1,1,1)
closeBtn.TextScaled = true
closeBtn.Font = Enum.Font.GothamBold
closeBtn.Parent = mainFrame
Instance.new("UICorner", closeBtn).CornerRadius = UDim.new(1,0)

-- Buttons
local function createButton(text, yPos, color)
    local btn = Instance.new("TextButton")
    btn.Size = UDim2.new(0.85, 0, 0, 55)
    btn.Position = UDim2.new(0.075, 0, 0, yPos)
    btn.BackgroundColor3 = color or Color3.fromRGB(40, 40, 70)
    btn.Text = text
    btn.TextColor3 = Color3.new(1,1,1)
    btn.TextScaled = true
    btn.Font = Enum.Font.GothamSemibold
    btn.Parent = mainFrame
    Instance.new("UICorner", btn).CornerRadius = UDim.new(0, 14)
    return btn
end

local fixLagBtn = createButton("🔧 Fix Lag & Đổi Đồ Hoạ", 110, Color3.fromRGB(0, 170, 255))
local discordBtn = createButton("🌐 Join Discord", 180, Color3.fromRGB(88, 101, 242))
local toggleBtn = createButton("🔴 TẮT MENU", 250, Color3.fromRGB(255, 60, 60))

-- Fix Lag Function
fixLagBtn.MouseButton1Click:Connect(function()
    settings().Rendering.QualityLevel = Enum.QualityLevel.Level01
    game:GetService("Lighting").GlobalShadows = false
    game:GetService("Lighting").Brightness = 1
    game:GetService("Lighting").ClockTime = 12
    print("✅ Đã Fix Lag + Giảm đồ hoạ!")
end)

-- Join Discord
discordBtn.MouseButton1Click:Connect(function()
    setclipboard("https://discord.gg/aotrhomeless")
    game:GetService("StarterGui"):SetCore("SendNotification", {
        Title = "Homeless Menu";
        Text = "Đã copy link Discord!";
        Duration = 5;
    })
end)

-- Toggle Menu
local menuVisible = true
toggleBtn.MouseButton1Click:Connect(function()
    menuVisible = not menuVisible
    mainFrame.Visible = menuVisible
    if menuVisible then
        toggleBtn.Text = "🔴 TẮT MENU"
        toggleBtn.BackgroundColor3 = Color3.fromRGB(255, 60, 60)
    else
        toggleBtn.Text = "🟢 BẬT MENU"
        toggleBtn.BackgroundColor3 = Color3.fromRGB(80, 255, 120)
    end
end)

closeBtn.MouseButton1Click:Connect(function()
    screenGui:Destroy()
end)

-- Drag Menu
local dragging = false
mainFrame.InputBegan:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseButton1 then
        dragging = true
    end
end)

game:GetService("UserInputService").InputChanged:Connect(function(input)
    if dragging and input.UserInputType == Enum.UserInputType.MouseMovement then
        local delta = input.Position - mainFrame.Position
        mainFrame.Position = UDim2.new(0, delta.X, 0, delta.Y)
    end
end)

game:GetService("UserInputService").InputEnded:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseButton1 then
        dragging = false
    end
end)

print("✅ Homeless Menu Loaded! Chúc farm vui!")
