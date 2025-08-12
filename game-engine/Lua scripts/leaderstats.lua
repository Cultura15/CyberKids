-- Server-Side Script (leaderstats.lua)

game.Players.PlayerAdded:Connect(function(plr)
	-- Create a leaderstats folder for each player when they join
	local leaderstats = Instance.new("Folder")
	leaderstats.Name = "leaderstats"
	leaderstats.Parent = plr

	-- Create the points IntValue for the leaderboard
	local points = Instance.new("IntValue")
	points.Name = "Points"
	points.Parent = leaderstats
	points.Value = 0  -- Initialize points to 0 for new players

	-- (Optional) Persist points using DataStore (to save score between sessions)
	local DataStoreService = game:GetService("DataStoreService")
	local pointsStore = DataStoreService:GetDataStore("PlayerPoints")
	local success, errorMessage = pcall(function()
		local savedPoints = pointsStore:GetAsync(plr.UserId)
		if savedPoints then
			points.Value = savedPoints  -- Set the player's saved points
		end
	end)

	if not success then
		warn("Error loading points for player " .. plr.Name .. ": " .. errorMessage)
	end
end)

-- Prevent negative score when adding or deducting points
local function updatePoints(player, pointsToAdd)
	local leaderstats = player:FindFirstChild("leaderstats")
	if not leaderstats then return end

	local points = leaderstats:FindFirstChild("Points")
	if not points then return end

	-- Debugging: Check incoming points and the current value
	print("Current points:", points.Value)
	print("Points to add/deduct:", pointsToAdd)

	-- Ensure points never go below 0
	local newPointsValue = math.max(0, points.Value + pointsToAdd)
	points.Value = newPointsValue

	-- Debugging: Log the updated points
	print("Updated points:", points.Value)
end

-- Example: Handling PointsAdded event
game.ReplicatedStorage.PointsAdded.OnServerEvent:Connect(function(player, pointsToAdd)
	-- Debugging: Track the values being passed through the event
	print("Received PointsToAdd:", pointsToAdd)

	-- Update points to ensure it doesn't go negative
	updatePoints(player, pointsToAdd)
end)

-- Example: Handling PointsDeducted event
game.ReplicatedStorage.PointsDeducted.OnServerEvent:Connect(function(player, pointsToDeduct)
	-- Debugging: Track the values being passed through the event
	print("Received PointsToDeduct:", pointsToDeduct)

	-- Update points to ensure it doesn't go negative
	updatePoints(player, -pointsToDeduct)
end)
