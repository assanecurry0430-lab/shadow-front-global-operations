local HousingService = {}

-- Prototype in-memory ownership only. Add profile persistence and transaction
-- locking before this is used in a published experience.
local ownership = {}

function HousingService.Purchase(player, propertyId, price, profile)
    if not player or type(propertyId) ~= "string" or #propertyId > 80 then
        return false, "invalid_request"
    end
    price = math.floor(tonumber(price) or 0)
    if price < 1 or price > 10000000 then return false, "invalid_price" end
    if not profile or type(profile.balance) ~= "number" then return false, "profile_unavailable" end
    if ownership[propertyId] then return false, "already_owned" end
    if profile.balance < price then return false, "insufficient_funds" end

    -- In production, use an atomic profile transaction to prevent double buying.
    profile.balance -= price
    ownership[propertyId] = player.UserId
    return true, "purchased"
end

function HousingService.GetOwner(propertyId)
    return ownership[propertyId]
end

return HousingService
