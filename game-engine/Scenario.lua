local HttpService = game:GetService("HttpService")

local ScenarioAPI = {}

local BASE_URL = os.getenv("API_URL")


local function safeDecode(response)
	local success, result = pcall(function()
		return HttpService:JSONDecode(response)
	end)
	if not success then
		warn("[ScenarioAPI] ? JSON decode failed:", result)
	end
	return success and result or nil
end


function ScenarioAPI.getScenariosByClass(classCode)
	if not classCode or classCode == "" then
		warn("[ScenarioAPI] ?? Missing classCode")
		return {}
	end

	local url = BASE_URL .. "/getquestions?classCode=" .. classCode
	local success, response = pcall(function()
		return HttpService:GetAsync(url, false)
	end)

	if not success then
		warn("[ScenarioAPI] ? Failed to fetch scenarios:", response)
		return {}
	end

	local data = safeDecode(response)
	if data and type(data) == "table" then
		return data
	else
		warn("[ScenarioAPI] ?? No scenarios returned for classCode:", classCode)
		return {}
	end
end

return ScenarioAPI
