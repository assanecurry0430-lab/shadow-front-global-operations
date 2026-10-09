local DiplomacyService = {}

-- Relationship score: -100 hostile to +100 friendly.
-- A relationship score never changes ownership of a base by itself.
local relationships = {}
local lastMajorChange = {}

local function key(a, b)
    if a < b then return a .. "::" .. b end
    return b .. "::" .. a
end

function DiplomacyService.SetRelation(countryA, countryB, score)
    if type(countryA) ~= "string" or type(countryB) ~= "string" or countryA == countryB then
        return false
    end
    relationships[key(countryA, countryB)] = math.clamp(math.floor(score), -100, 100)
    return true
end

function DiplomacyService.GetRelation(countryA, countryB)
    return relationships[key(countryA, countryB)] or 0
end

function DiplomacyService.ApplyIncident(countryA, countryB, impact, now)
    now = now or os.time()
    local pair = key(countryA, countryB)
    local score = DiplomacyService.GetRelation(countryA, countryB)
    impact = math.clamp(math.floor(impact), -10, 10)
    relationships[pair] = math.clamp(score + impact, -100, 100)
    -- This records a cooldown marker for major changes; game event logic must
    -- decide whether an event qualifies as major.
    lastMajorChange[pair] = lastMajorChange[pair] or 0
    return relationships[pair]
end

function DiplomacyService.CanMakeMajorChange(countryA, countryB, now)
    now = now or os.time()
    local pair = key(countryA, countryB)
    local last = lastMajorChange[pair] or 0
    return (now - last) >= (3 * 24 * 60 * 60)
end

return DiplomacyService
