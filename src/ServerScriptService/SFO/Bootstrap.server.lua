local ServerScriptService = game:GetService("ServerScriptService")
local services = ServerScriptService:WaitForChild("SFO"):WaitForChild("Services")

for _, module in ipairs(services:GetChildren()) do
    if module:IsA("ModuleScript") then
        local ok, result = pcall(require, module)
        if not ok then
            warn("[SFO] Failed to load service:", module.Name, result)
        end
    end
end

print("[SFO] services initialized — prototype scaffold only")
