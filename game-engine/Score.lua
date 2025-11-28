local HttpService = game:GetService("HttpService")
local RegistrationModule = require(script.Parent.Registration)

local ScoreModule = {}


ScoreModule.API_URL = os.getenv("API_URL")


ScoreModule.ChallengeType = {
	INFORMATION_CLASSIFICATION_SORTING = "INFORMATION_CLASSIFICATION_SORTING"
}


function ScoreModule.saveScore(player, points, completionStatus)
	local studentData = RegistrationModule.getStudentData(player)

	if not studentData then
		warn("[SCORE] ? Cannot save score: student not registered for player " .. player.Name)
		return false
	end

	local requestData = {
		student = {
			robloxId = tostring(player.UserId),
			robloxName = player.Name
		},
		challengeType = ScoreModule.ChallengeType.INFORMATION_CLASSIFICATION_SORTING,
		points = points,
		completionStatus = completionStatus,
		dateCompleted = os.date("!%Y-%m-%dT%H:%M:%SZ") 
	}

	local jsonData = HttpService:JSONEncode(requestData)

	local success, response = pcall(function()
		return HttpService:PostAsync(
			ScoreModule.API_URL,
			jsonData,
			Enum.HttpContentType.ApplicationJson,
			false
		)
	end)

	if success then
		print("[SCORE] ? Score saved successfully for " .. player.Name)
		return true
	else
		warn("[SCORE] ? Failed to save score for " .. player.Name .. " - Error: " .. response)
		return false
	end
end

return ScoreModule
