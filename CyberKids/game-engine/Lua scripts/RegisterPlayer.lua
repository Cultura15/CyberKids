-- RegisterPlayer.lua

local HttpService = game:GetService("HttpService")
local baseUrl = "http://localhost:8080/api/student/register"  -- Replace with your backend URL if hosted remotely

game.Players.PlayerAdded:Connect(function(player)
	-- You can choose to send either their PlayerName or RobloxId, or both, depending on your needs
	local robloxId = tostring(player.UserId)
	local playerName = player.Name

	local playerData = {
		robloxId = robloxId,
		name = playerName
	}

	-- Convert player data to JSON format
	local jsonData = HttpService:JSONEncode(playerData)

	local success, response = pcall(function()
		return HttpService:PostAsync(baseUrl, jsonData, Enum.HttpContentType.ApplicationJson)
	end)

	if success then
		print("Successfully registered player: " .. playerName)
	else
		warn("Failed to register player: " .. playerName)
	end
end)
