local PhoneNotificationService = {}
local histories = {}

local PRIORITY = { info = 1, service = 2, caution = 3, urgent = 4, critical = 5 }

local function canReceive(player, notification)
    -- Replace with real rank/unit/leave/incident authorization checks.
    if not player or not player:IsDescendantOf(game) then return false end
    if typeof(notification) ~= "table" then return false end
    if type(notification.title) ~= "string" or type(notification.body) ~= "string" then return false end
    if #notification.title > 100 or #notification.body > 600 then return false end
    return true
end

function PhoneNotificationService.Push(player, notification)
    if not canReceive(player, notification) then return false end
    notification.priority = PRIORITY[notification.priority] and notification.priority or "info"
    notification.createdAt = os.time()
    histories[player.UserId] = histories[player.UserId] or {}
    local history = histories[player.UserId]
    table.insert(history, 1, notification)
    while #history > 100 do table.remove(history) end

    -- UI/RemoteEvent delivery is intentionally left to the integration layer.
    -- Never expose confidential briefings to clients who lack authorization.
    return true
end

function PhoneNotificationService.GetHistory(player)
    local result = {}
    for _, item in ipairs(histories[player.UserId] or {}) do
        table.insert(result, table.clone(item))
    end
    return result
end

function PhoneNotificationService.RemovePlayer(player)
    histories[player.UserId] = nil
end

return PhoneNotificationService
