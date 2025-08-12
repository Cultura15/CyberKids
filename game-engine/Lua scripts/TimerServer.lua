-- TimerServer.lua

local HttpService = game:GetService("HttpService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

local StartTimer = ReplicatedStorage:WaitForChild("StartTimer")
local StopTimer = ReplicatedStorage:WaitForChild("StopTimer")

-- Track timerId for each player (you get this back from the backend)
local playerTimerMap = {}

-- Start Timer
local function sendStartTime(player)
	local requestBody = {
		student = {
			robloxId = tostring(player.UserId),
			name = player.Name
		},
		challengeType = "INFORMATION_CLASSIFICATION_SORTING",
		startTime = os.date("!%Y-%m-%dT%H:%M:%SZ"),
		status = "start"
	}

	local jsonData = HttpService:JSONEncode(requestBody)

	local success, response = pcall(function()
		return HttpService:PostAsync("http://localhost:8080/api/timer/update", jsonData, Enum.HttpContentType.ApplicationJson)
	end)

	if success then
		print("? Timer started!")
		print(response)
		local responseData = HttpService:JSONDecode(response)
		playerTimerMap[player.UserId] = responseData.id -- Save timerId for this player
	else
		warn("? Failed to start timer:", response)
	end
end

-- End Timer
local function sendEndTime(player)
	local timerId = playerTimerMap[player.UserId]

	if not timerId then
		warn("? No timerId found for player:", player.Name)
		return
	end

	local requestBody = {
		timerId = timerId,
		endTime = os.date("!%Y-%m-%dT%H:%M:%SZ"),
		status = "end"
	}

	local jsonData = HttpService:JSONEncode(requestBody)

	local success, response = pcall(function()
		return HttpService:PostAsync("http://localhost:8080/api/timer/update", jsonData, Enum.HttpContentType.ApplicationJson)
	end)

	if success then
		print("? Timer ended!")
		print(response)
	else
		warn("? Failed to end timer:", response)
	end
end

-- When player joins ? start timer
Players.PlayerAdded:Connect(function(player)
	sendStartTime(player)

	local startTimeUnix = os.time()
	StartTimer:FireClient(player, startTimeUnix)
end)

-- When player leaves ? end timer
Players.PlayerRemoving:Connect(function(player)
	sendEndTime(player)

	local endTimeUnix = os.time()
	StopTimer:FireClient(player, endTimeUnix)
end)
