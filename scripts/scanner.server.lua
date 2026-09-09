-- FruitVault authorized Roblox/Luau scanner client
-- Place this Script in ServerScriptService of an experience YOU OWN.
-- Enable: Game Settings > Security > Allow HTTP Requests.
-- This script is not an executor and cannot be inserted into Blox Fruits.

local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")

local TRACKER_URL = "https://track-snowy.vercel.app"
local SCANNER_ID = "roblox-server-01"
local SCANNER_API_KEY = "REPLACE_WITH_YOUR_SCANNER_API_KEY"

local ALLOWED_ITEMS = {
    "godhuman", "sanguine_art", "cursed_dual_katana", "shark_anchor",
    "mirror_fractal", "dark_fragment", "valkyrie_helm", "skull_guitar",
    "control", "dough", "dragon", "magnet", "gas", "gravity", "kitsune",
    "tiger", "lightning", "yeti", "mammoth", "shadow", "spirit", "trex", "venom",
}

local function valueFrom(parent, name, fallback)
    local value = parent and parent:FindFirstChild(name)
    if value and value:IsA("ValueBase") then
        return value.Value
    end
    return fallback
end

-- Replace only this adapter when your OWN game stores these values elsewhere.
-- It reads replicated ValueBase objects; it does not inspect memory or private modules.
local function collectSnapshot(player)
    local data = player:FindFirstChild("Data") or player:FindFirstChild("leaderstats")
    local inventory = player:FindFirstChild("FruitVaultInventory")
    local items = {}

    for _, key in ipairs(ALLOWED_ITEMS) do
        local quantity = tonumber(valueFrom(inventory, key, 0)) or 0
        table.insert(items, {
            key = key,
            quantity = math.max(0, math.floor(quantity)),
            owned = quantity > 0,
        })
    end

    return {
        robloxUserId = tostring(player.UserId),
        username = player.Name,
        displayName = player.DisplayName,
        timestamp = DateTime.now():ToIsoDate(),
        stats = {
            level = tonumber(valueFrom(data, "Level", 0)) or 0,
            beli = tonumber(valueFrom(data, "Beli", 0)) or 0,
            fragments = tonumber(valueFrom(data, "Fragments", 0)) or 0,
            currentFruit = tostring(valueFrom(data, "Fruit", "Unknown")),
            race = tostring(valueFrom(data, "Race", "Unknown")),
            sea = math.clamp(tonumber(valueFrom(data, "Sea", 1)) or 1, 1, 3),
            melee = tostring(valueFrom(data, "Melee", "Unknown")),
            sword = tostring(valueFrom(data, "Sword", "Unknown")),
        },
        items = items,
    }
end

local function uploadPlayer(player)
    if SCANNER_API_KEY == "REPLACE_WITH_YOUR_SCANNER_API_KEY" then
        warn("FruitVault: configure SCANNER_API_KEY before scanning")
        return
    end

    local ok, response = pcall(function()
        return HttpService:RequestAsync({
            Url = TRACKER_URL .. "/api/scans",
            Method = "POST",
            Headers = {
                ["Content-Type"] = "application/json",
                ["Authorization"] = "Bearer " .. SCANNER_API_KEY,
                ["X-Scanner-Id"] = SCANNER_ID,
            },
            Body = HttpService:JSONEncode(collectSnapshot(player)),
        })
    end)

    if not ok then
        warn("FruitVault request failed:", response)
    elseif not response.Success then
        warn("FruitVault rejected scan:", response.StatusCode, response.Body)
    else
        print("FruitVault updated:", player.Name)
    end
end

Players.PlayerAdded:Connect(function(player)
    task.wait(5)
    uploadPlayer(player)
end)

for _, player in ipairs(Players:GetPlayers()) do
    task.spawn(uploadPlayer, player)
end

