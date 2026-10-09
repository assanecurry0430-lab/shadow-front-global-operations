local ReplicatedStorage = game:GetService("ReplicatedStorage")
local SFOConfig = require(ReplicatedStorage:WaitForChild("SFO"):WaitForChild("Shared"):WaitForChild("SFOConfig"))

local MissionRewardService = {}

-- Server-only: never accept a reward amount supplied by a client.
function MissionRewardService.CalculateReward(difficulty, objectivesCompleted, objectivesTotal, eligibleBonuses)
    difficulty = math.clamp(math.floor(tonumber(difficulty) or 1), 1, 5)
    local reward = SFOConfig.MissionRewards[difficulty]
    local total = reward.Base
    if objectivesCompleted >= objectivesTotal and objectivesTotal > 0 then
        total += reward.Completion
    end

    -- Only allowlisted bonus flags, computed and verified by server mission logic.
    eligibleBonuses = eligibleBonuses or {}
    if eligibleBonuses.protectedAllies == true then total += math.floor(reward.Completion * 0.15) end
    if eligibleBonuses.secondaryObjective == true then total += math.floor(reward.Completion * 0.20) end
    return total
end

function MissionRewardService.Award(player, amount)
    assert(typeof(player) == "Instance" and player:IsA("Player"), "Expected Player")
    amount = math.floor(tonumber(amount) or 0)
    if amount <= 0 or amount > 50000 then
        warn("Rejected invalid SFO mission payout")
        return false
    end

    -- Prototype only: production implementation must use a server-owned profile
    -- and DataStoreService transaction pattern. This leaderstats example is not
    -- a persistent economy and should not be treated as final persistence.
    local stats = player:FindFirstChild("leaderstats")
    local cash = stats and stats:FindFirstChild("Dollars")
    if not cash or not cash:IsA("IntValue") then return false end
    cash.Value += amount
    return true
end

return MissionRewardService
