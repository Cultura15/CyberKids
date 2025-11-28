local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local LeaderboardAPI = {}

local BASE_URL = os.getenv("API_URL")
local UPDATE_URL = BASE_URL .. "/update/roblox/"
local FETCH_URL = BASE_URL .. "/today"


local showLeaderboardEvent = ReplicatedStorage:WaitForChild("ShowLeaderboard")
local leaderboardEvent = ReplicatedStorage:WaitForChild("LeaderboardEvent")
local refreshLeaderboardEvent = ReplicatedStorage:WaitForChild("RefreshLeaderboard")

local RegistrationModule = require(script.Parent.Registration)


function LeaderboardAPI.UpdateLeaderboardData(player, score, timeTaken)
	local robloxId = tostring(player.UserId)
	local endpoint = UPDATE_URL .. robloxId


	local requestData = {
		score = score or 0,
		totalTimeTaken = timeTaken or "00:00"
	}

	
	local jsonData = HttpService:JSONEncode(requestData)

	local success, response = pcall(function()
		return HttpService:PostAsync(endpoint, jsonData, Enum.HttpContentType.ApplicationJson)
	end)

	if success then
		print("? Leaderboard updated for", player.Name, "Score:", score, "Time:", timeTaken)
		local data = HttpService:JSONDecode(response)
		return data
	else
		warn("? Failed to update leaderboard for", player.Name, ":", response)
		return nil
	end
end

function LeaderboardAPI.FetchTodayLeaderboard()
	local success, response = pcall(function()
		return HttpService:GetAsync(FETCH_URL)
	end)

	if success then
		local data = HttpService:JSONDecode(response)
		print("? Fetched leaderboard data:", #data, "entries")
		return data
	else
		warn("? Failed to fetch leaderboard:", response)
		return {}
	end
end

function LeaderboardAPI.ShowLeaderboardToPlayer(player)
	
	local leaderboardData = LeaderboardAPI.FetchTodayLeaderboard()

	
	leaderboardEvent:FireClient(player, "CLEAR")

	
	local uniquePlayers = {}

	
	for _, entry in ipairs(leaderboardData) do
		local playerName = entry.student.robloxName or entry.student.realName or "Unknown Player"
		local robloxId = tonumber(entry.student.robloxId) or 0

		
		local uniqueKey = tostring(robloxId)

		
		if not uniquePlayers[uniqueKey] then
			uniquePlayers[uniqueKey] = true

			
			local timeInSeconds = LeaderboardAPI.ConvertTimeToSeconds(entry.totalTimeTaken)

			
			local playerData = {
				DisplayName = playerName,
				UserId = robloxId
			}

			leaderboardEvent:FireClient(player, "ADD", playerData, entry.score, timeInSeconds)
		end
	end

	
	showLeaderboardEvent:FireClient(player)
	print("? Sent", table.getn(uniquePlayers), "unique entries to", player.Name)
end

function LeaderboardAPI.RefreshLeaderboardForPlayer(player)
	print("?? Refresh requested by:", player.Name)

	
	local leaderboardData = LeaderboardAPI.FetchTodayLeaderboard()

	
	leaderboardEvent:FireClient(player, "CLEAR")

	
	local uniquePlayers = {}
	local entryCount = 0

	
	for _, entry in ipairs(leaderboardData) do
		local robloxId = tonumber(entry.student.robloxId) or 0

		
		local realName = nil
		for _, player in ipairs(Players:GetPlayers()) do
			if player.UserId == robloxId then
				local studentData = RegistrationModule.getStudentData(player)
				if studentData and studentData.realName and studentData.realName ~= "" then
					realName = studentData.realName
				end
			end
		end

		
		local playerName = realName or entry.student.realName or "Unknown Student"

		local robloxId = tonumber(entry.student.robloxId) or 0

		
		local uniqueKey = tostring(robloxId)

		
		if not uniquePlayers[uniqueKey] then
			uniquePlayers[uniqueKey] = true
			entryCount = entryCount + 1

		
			local timeInSeconds = LeaderboardAPI.ConvertTimeToSeconds(entry.totalTimeTaken)

			
			local playerData = {
				DisplayName = playerName,
				UserId = robloxId
			}

			leaderboardEvent:FireClient(player, "ADD", playerData, entry.score, timeInSeconds)
		end
	end

	
	leaderboardEvent:FireClient(player, "REFRESH_COMPLETE")
	print("? Leaderboard refreshed successfully for:", player.Name, "| Sent", entryCount, "unique entries")
end

function LeaderboardAPI.ConvertTimeToSeconds(timeString)
	
	if not timeString or timeString == "" then return 0 end

	
	local hours, minutes, seconds = timeString:match("(%d+):(%d+):(%d+)")
	if hours and minutes and seconds then
		return tonumber(hours) * 3600 + tonumber(minutes) * 60 + tonumber(seconds)
	end

	
	minutes, seconds = timeString:match("(%d+):(%d+)")
	if minutes and seconds then
		return tonumber(minutes) * 60 + tonumber(seconds)
	end

	return 0
end

function LeaderboardAPI.ShowLeaderboardToAllPlayers()
	for _, player in pairs(Players:GetPlayers()) do
		LeaderboardAPI.ShowLeaderboardToPlayer(player)
	end
end


refreshLeaderboardEvent.OnServerEvent:Connect(function(player)
	LeaderboardAPI.RefreshLeaderboardForPlayer(player)
end)

return LeaderboardAPI