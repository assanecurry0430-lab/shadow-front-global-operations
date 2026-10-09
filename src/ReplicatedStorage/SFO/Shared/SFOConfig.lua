local SFOConfig = {}

SFOConfig.GameName = "SHADOW FRONT: GLOBAL OPERATIONS"
SFOConfig.Currency = "USD"
SFOConfig.Diplomacy = {
    TickSeconds = 300,
    MinorIncidentChance = 0.08,
    MajorChangeMinimumDays = 3,
    MajorChangeMaximumDays = 14,
}
SFOConfig.MissionRewards = {
    [1] = { Base = 500, Completion = 200 },
    [2] = { Base = 1000, Completion = 500 },
    [3] = { Base = 2000, Completion = 1000 },
    [4] = { Base = 3500, Completion = 2000 },
    [5] = { Base = 5000, Completion = 4000 },
}
SFOConfig.Phone = {
    MaxHistory = 100,
    CooldownSeconds = 2,
}
SFOConfig.Housing = {
    MinimumPrice = 10000,
    MaximumPrice = 250000,
}
return SFOConfig
