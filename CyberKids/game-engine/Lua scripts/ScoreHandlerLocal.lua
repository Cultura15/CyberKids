-- Client-Side Script to Fire Points Events (pointshandler.lua)

local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Fire PointsAdded event when the player completes a task
game.ReplicatedStorage.PointsAdded.OnClientEvent:Connect(function(pointsToAdd)
	print("Points to Add:", pointsToAdd)  -- Debugging print
	if pointsToAdd > 0 then
		game.ReplicatedStorage.PointsAdded:FireServer(pointsToAdd)  -- Sends points to the server to add
	else
		warn("Invalid Points to Add:", pointsToAdd)  -- Print a warning if the points are zero or negative
	end
end)

-- Fire PointsDeducted event when the player answers incorrectly
game.ReplicatedStorage.PointsDeducted.OnClientEvent:Connect(function(pointsToDeduct)
	print("Points to Deduct:", pointsToDeduct)  -- Debugging print
	if pointsToDeduct > 0 then
		game.ReplicatedStorage.PointsDeducted:FireServer(pointsToDeduct)  -- Sends points to the server to deduct
	else
		warn("Invalid Points to Deduct:", pointsToDeduct)  -- Print a warning if the points are zero or negative
	end
end)
