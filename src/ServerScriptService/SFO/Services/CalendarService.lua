local CalendarService = {}

local VALID_STATUSES = {
    OnDuty = true,
    RestDay = true,
    PaidLeave = true,
    MissionPrep = true,
    InMission = true,
}

local playerStates = {}

function CalendarService.SetStatus(player, status)
    if not player or not VALID_STATUSES[status] then return false end
    playerStates[player.UserId] = {
        status = status,
        updatedAt = os.time(),
    }
    return true
end

function CalendarService.GetStatus(player)
    local state = playerStates[player.UserId]
    return state and state.status or "RestDay"
end

function CalendarService.CanInterruptLeave(player, severity, unitAffected)
    if CalendarService.GetStatus(player) ~= "PaidLeave" then return true end
    -- Only a defined major crisis affecting the player's unit can trigger a
    -- special recall workflow. The final recall policy must be server-configured.
    return severity == "critical" and unitAffected == true
end

function CalendarService.RemovePlayer(player)
    playerStates[player.UserId] = nil
end

return CalendarService
