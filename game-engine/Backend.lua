local HttpService = game:GetService("HttpService")

local BackendAPI = {}
BackendAPI.BASE_URL = os.getenv("API_URL")

local function makeRequest(method, endpoint, headers, body)
	local success, response = pcall(function()
		if method == "GET" then
			return HttpService:GetAsync(endpoint, true, headers)
		elseif method == "POST" then
			return HttpService:PostAsync(endpoint, HttpService:JSONEncode(body), Enum.HttpContentType.ApplicationJson, false, headers)
		end
	end)

	if not success then
		warn("[BackendAPI] ?? Request failed:", response)
		return nil
	end


	local ok, result = pcall(function()
		return HttpService:JSONDecode(response)
	end)

	if ok then
		return result
	else
		warn("[BackendAPI] ?? Failed to decode JSON response:", result)
		return nil
	end
end


function BackendAPI.GetQuestions(classCode)
	if not classCode or classCode == "" then
		warn("[BackendAPI] ?? Missing classCode when fetching questions.")
		return {}
	end

	local url = string.format("%s/student/getquestions?classCode=%s", BackendAPI.BASE_URL, classCode)
	print("[BackendAPI] Fetching questions from:", url)
	return makeRequest("GET", url)
end


function BackendAPI.SubmitAnswer(scenarioId, userAnswer)
	local url = BackendAPI.BASE_URL .. "/scenarios/game/submit-answer"
	local body = {
		scenarioId = scenarioId,
		userAnswer = userAnswer
	}

	print(string.format("[BackendAPI] Submitting answer for Scenario %s", scenarioId))
	return makeRequest("POST", url, nil, body)
end

return BackendAPI
