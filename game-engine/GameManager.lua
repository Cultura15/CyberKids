local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local ScoreModule = require(script.Parent.Score)
local TimerModule = require(script.Parent.Timer)
local LeaderboardAPI = require(script.Parent.LeaderboardAPI)

local GameEndedEvent = ReplicatedStorage:WaitForChild("RemoteEvents"):WaitForChild("GameEnded")
local EndTimerEvent = ReplicatedStorage:WaitForChild("TimerEvents"):WaitForChild("EndTimer")
local HidePlayerEvent = ReplicatedStorage:WaitForChild("HidePlayer")
local GameSummaryEvent = ReplicatedStorage:WaitForChild("RemoteEvents"):WaitForChild("GameSummary")


local destroyScoreEvent = ReplicatedStorage:WaitForChild("DestroyScore")
local destroyTimerEvent = ReplicatedStorage:WaitForChild("DestroyTimer")
local destroyProgressEvent = ReplicatedStorage:WaitForChild("DestroyProgress")
local destroyScenarioEvent = ReplicatedStorage:WaitForChild("DestroyScenario")
local destroyLeaderboardEvent = ReplicatedStorage:WaitForChild("DestroyLeaderboard")
local destroySprintEvent = ReplicatedStorage:WaitForChild("DestroySprint")

local BadgeService = game:GetService("BadgeService")
local Level1Badge = 4172270041765303


local GameManager = {}


local playerProgress = {}


local function AwardBadge(player, badgeId)
	local success, hasBadge = pcall(function()
		return BadgeService:UserHasBadgeAsync(player.UserId, badgeId)
	end)

	if success and not hasBadge then
		pcall(function()
			BadgeService:AwardBadge(player.UserId, badgeId)
		end)
	end
end





function GameManager.recordDrop(player)
	local userId = player.UserId
	playerProgress[userId] = (playerProgress[userId] or 0) + 1
	local totalRequired = _G.getActiveNPCCount(player) or 0


	if playerProgress[userId] >= totalRequired then
		GameManager.completeGame(player)
	end
end


function GameManager.completeGame(player)
	local userId = player.UserId
	local points = player:FindFirstChild("ScoreServer") and player.ScoreServer.Value or 0


	if player:GetAttribute("GameCompleted") then return end
	player:SetAttribute("GameCompleted", true)

	print("?? [GameManager] Game complete for", player.Name, "? Score:", points)
	
	destroyScoreEvent:FireClient(player)
	destroyTimerEvent:FireClient(player)
	destroyProgressEvent:FireClient(player)
	destroyScenarioEvent:FireClient(player)
	destroySprintEvent:FireClient(player)
	
	

	AwardBadge(player, Level1Badge)
	print("?? Awarded Level 1 Badge to", player.Name)


	
	local timeTaken = TimerModule.getFormattedTime(player) or "00:00"
	print("?? [GameManager] Time taken:", timeTaken, "for", player.Name)

	
	local timerEnded = TimerModule.endTimer(player)
	if not timerEnded then
		warn("[GameManager] ?? Timer may not have ended properly for", player.Name)
	end

	
	EndTimerEvent:FireClient(player)

	
	local success = ScoreModule.saveScore(player, points, "COMPLETED")
	if success then
		
		LeaderboardAPI.UpdateLeaderboardData(player, points, timeTaken)
		
		
		local GameCompletionAPI = require(script.Parent.GameCompleteAPI)
		local ChallengeType = "INFORMATION_CLASSIFICATION_SORTING" 

		GameCompletionAPI.NotifyGameComplete(player, ChallengeType)


		playerProgress[userId] = nil
		
		
		local leaderboardData = LeaderboardAPI.FetchTodayLeaderboard()
		local finalRank = nil

		for i, entry in ipairs(leaderboardData) do
			if tostring(entry.student.robloxId) == tostring(player.UserId) then
				finalRank = i
				break
			end
		end

		task.wait(3)
	
		GameSummaryEvent:FireClient(player, {
			Score = points,
			Time = timeTaken,
			Rank = finalRank,
			PlayerName = player.Name
		})


		
		GameEndedEvent:FireClient(player)

		
		wait(1) 
		LeaderboardAPI.ShowLeaderboardToPlayer(player)
		
		GameManager.freezePlayer(player)
		
		local ReplicatedStorage = game:GetService("ReplicatedStorage")
		local StartSpectateEvent = ReplicatedStorage:WaitForChild("StartSpectate")
		if StartSpectateEvent then
			StartSpectateEvent:FireClient(player)
		end
		
		for _, otherPlayer in pairs(game.Players:GetPlayers()) do
			if otherPlayer ~= player then
				HidePlayerEvent:FireClient(otherPlayer, player)
			end
		end

	else
		warn("[GameManager] ? Failed to submit score for", player.Name)
	end
end


function GameManager.onPlayerLeave(player)
	local userId = player.UserId
	if player:GetAttribute("GameCompleted") then return end

	print("?? [GameManager] Player left early, deleting unfinished timer for", player.Name)

	
	if TimerModule.hasActiveTimer and TimerModule.hasActiveTimer(player) then
		TimerModule.endTimer(player)
		EndTimerEvent:FireClient(player)
	end

	

	
	local HttpService = game:GetService("HttpService")
	local robloxId = tostring(userId)
	local backendUrl = "os.getenv("API_URL")/api/timer/delete-latest/" .. robloxId

	local success, response = pcall(function()
		return HttpService:RequestAsync({
			Url = backendUrl,
			Method = "DELETE",
			Headers = {
				["Content-Type"] = "application/json"
			}
		})
	end)

	if success and response.Success then
		print("??? [TimerAPI] Deleted unfinished timer for", player.Name)
	else
		warn("?? [TimerAPI] Failed to delete timer for", player.Name, response and response.StatusCode)
	end

	playerProgress[userId] = nil
end


function GameManager.resetProgress(player)
	playerProgress[player.UserId] = 0
	player:SetAttribute("GameCompleted", false)
end


function GameManager.getPlayerProgress(player)
	if not player then return 0 end
	return playerProgress[player.UserId] or 0
end


function GameManager.showLeaderboard(player)
	if player then
		LeaderboardAPI.ShowLeaderboardToPlayer(player)
	else
		LeaderboardAPI.ShowLeaderboardToAllPlayers()
	end
end

function GameManager.freezePlayer(player)
	local character = player.Character
	if not character then return end

	local humanoid = character:FindFirstChildOfClass("Humanoid")
	if humanoid then
		humanoid.WalkSpeed = 0
		humanoid.JumpPower = 0
	end

	
	local ReplicatedStorage = game:GetService("ReplicatedStorage")
	local FreezePlayerEvent = ReplicatedStorage:WaitForChild("FreezePlayer")

	if FreezePlayerEvent then
		FreezePlayerEvent:FireClient(player, true, true) 

	end
end


return GameManager