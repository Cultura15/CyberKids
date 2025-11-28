local HttpService = game:GetService("HttpService")
local RegistrationModule = require(script.Parent.Registration)

local TimerModule = {}


local API_URL = os.getenv("API_URL")
local CHALLENGE_TYPE = "INFORMATION_CLASSIFICATION_SORTING"


local activeTimers = {}
local startTimes = {}


local function getCurrentISOTime()
	return os.date("!%Y-%m-%dT%H:%M:%SZ")
end


local function formatTime(seconds)
	local minutes = math.floor(seconds / 60)
	local remainingSeconds = seconds % 60
	return string.format("%02d:%02d", minutes, remainingSeconds)
end

function TimerModule.startTimer(player, callback)
	local studentData = RegistrationModule.getStudentData(player)
	if not studentData then
		warn("? Timer start failed: Student not registered for", player.Name)
		if callback then callback(false, nil) end
		return nil
	end

	local requestBody = {
		status = "start",
		startTime = getCurrentISOTime(),
		challengeType = CHALLENGE_TYPE,
		student = {
			robloxId = tostring(studentData.robloxId or player.UserId),
			robloxName = studentData.robloxName or player.Name
		}
	}

	local jsonData = HttpService:JSONEncode(requestBody)

	task.spawn(function()
		local success, response = pcall(function()
			return HttpService:PostAsync(API_URL, jsonData, Enum.HttpContentType.ApplicationJson, false)
		end)

		if success then
			local responseData = HttpService:JSONDecode(response)
			local timerId = responseData.id
			activeTimers[player.UserId] = timerId
			startTimes[player.UserId] = os.time()
			print("?? Timer started for", player.Name, "Timer ID:", timerId)
			if callback then callback(true, timerId) end 
		else
			warn("? Failed to start timer for", player.Name, "Error:", response)
			if callback then callback(false, nil) end 
		end
	end)

	startTimes[player.UserId] = os.time()

	return true
end



function TimerModule.endTimer(player)
	local timerId = activeTimers[player.UserId]
	if not timerId then
		warn("? No active timer to end for", player.Name)
		return false
	end

	local requestBody = {
		status = "end",
		timerId = timerId,
		endTime = getCurrentISOTime()
	}

	local jsonData = HttpService:JSONEncode(requestBody)


	task.spawn(function()
		local success, response = pcall(function()
			return HttpService:PostAsync(API_URL, jsonData, Enum.HttpContentType.ApplicationJson, false)
		end)

		if success then
			local responseData = HttpService:JSONDecode(response)
			print("? Timer ended for", player.Name, "Time taken:", responseData.timeTaken or "unknown")
		else
			warn("? Failed to end timer for", player.Name, "Error:", response)
		end
	end)


	activeTimers[player.UserId] = nil
	startTimes[player.UserId] = nil
	return true
end


function TimerModule.getPlayerTime(player)
	local startTime = startTimes[player.UserId]
	if startTime then
		return os.difftime(os.time(), startTime)
	else
		return 0
	end
end


function TimerModule.getFormattedTime(player)
	local totalSeconds = TimerModule.getPlayerTime(player)
	return formatTime(totalSeconds)
end


function TimerModule.hasActiveTimer(player)
	return startTimes[player.UserId] ~= nil
end


function TimerModule.cleanupPlayerData(player)
	activeTimers[player.UserId] = nil
	startTimes[player.UserId] = nil
end

return TimerModule