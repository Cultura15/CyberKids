--Savescore.lua

local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")

local baseUrl = "http://localhost:8080/api/scores/save-score"  

local function sendScoreToBackend(player)
	local leaderstats = player:FindFirstChild("leaderstats")
	if not leaderstats then return end

	local points = leaderstats:FindFirstChild("Points")
	if not points then return end

	-- Prepare the data to send to the backend
	local scoreData = {
		points = points.Value,
		student = {
			robloxId = tostring(player.UserId),
			name = player.Name
		},
		challengeType = "INFORMATION_CLASSIFICATION_SORTING", 
		completionStatus = "Completed",  
		dateCompleted = os.date("%Y-%m-%dT%H:%M:%S")  
	}
     
	local jsonData = HttpService:JSONEncode(scoreData)

	-- Send the data to the backend API
	local success, response = pcall(function()
		return HttpService:PostAsync(baseUrl, jsonData, Enum.HttpContentType.ApplicationJson)
	end)

	if success then
		print("Score sent to backend for", player.Name)
	else
		warn("Failed to send score:", response)
	end
end

-- Example: Automatically save score when player leaves
Players.PlayerRemoving:Connect(function(player)
	sendScoreToBackend(player)
end)
