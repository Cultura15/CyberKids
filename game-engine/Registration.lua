local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")


local registrationEventsFolder = ReplicatedStorage:FindFirstChild("RegistrationEvents")
if not registrationEventsFolder then
	registrationEventsFolder = Instance.new("Folder")
	registrationEventsFolder.Name = "RegistrationEvents"
	registrationEventsFolder.Parent = ReplicatedStorage
end

local registrationStatusEvent = registrationEventsFolder:FindFirstChild("RegistrationStatus")
if not registrationStatusEvent then
	registrationStatusEvent = Instance.new("RemoteEvent")
	registrationStatusEvent.Name = "RegistrationStatus"
	registrationStatusEvent.Parent = registrationEventsFolder
end

local checkRegistrationEvent = registrationEventsFolder:FindFirstChild("CheckRegistration")
if not checkRegistrationEvent then
	checkRegistrationEvent = Instance.new("RemoteEvent")
	checkRegistrationEvent.Name = "CheckRegistration"
	checkRegistrationEvent.Parent = registrationEventsFolder
end

local RegistrationModule = {}


RegistrationModule.API_URL = os.getenv("API_URL")
local AUTO_REGISTER_ENDPOINT = "api/student/register"
local GET_STUDENT_ENDPOINT = "api/student/by-roblox-id/"


local registeredPlayers = {}
local onlineStatusCache = {}


function RegistrationModule.fetchStudentDataById(player, robloxId)

	local success, response = pcall(function()
		return HttpService:GetAsync(RegistrationModule.API_URL .. GET_STUDENT_ENDPOINT .. robloxId, false)
	end)

	if success then
		local responseData = HttpService:JSONDecode(response)
		local student = responseData.student

		registeredPlayers[player.UserId] = {
			student = student,
			needsManualRegister = not responseData.manualRegistered
		}

		
		registrationStatusEvent:FireClient(
			player,
			true,  
			false, 
			student
		)
		
		local dataReadyEvent = ReplicatedStorage:FindFirstChild("StudentDataReady")
		if dataReadyEvent then
			dataReadyEvent:Fire(player)
		end

		
		if student then
			print("[REGISTRATION] ? Student data received for player:", player.Name)
			print("  Name: " .. (student.robloxName or "N/A"))
			print("  Class Code: " .. (student.classCode or "N/A"))
			print("  Grade: " .. (student.grade or "N/A"))
			print("  Section: " .. (student.section or "N/A"))
		else
			print("[REGISTRATION] ?? No student data found in response for player:", player.Name)
		end

		return responseData
	else
		warn("[REGISTRATION] ? Failed to fetch student data for player: " .. player.Name .. " - Error: " .. response)

		registrationStatusEvent:FireClient(
			player,
			false, 
			true,  
			nil,
			"Failed to fetch student data"
		)
		return nil
	end
end


function RegistrationModule.registerPlayer(player, isOnline)
	print("[REGISTRATION] " .. (isOnline and "Registering" or "Setting offline") .. " player: " .. player.Name)

	local requestData = {
		robloxId = tostring(player.UserId),
		robloxName = player.Name,
		online = isOnline
	}

	local jsonData = HttpService:JSONEncode(requestData)

	local success, response = pcall(function()
		return HttpService:PostAsync(
			RegistrationModule.API_URL .. AUTO_REGISTER_ENDPOINT,
			jsonData,
			Enum.HttpContentType.ApplicationJson,
			false
		)
	end)

	if success then
		local responseData = HttpService:JSONDecode(response)

		if isOnline then
			onlineStatusCache[player.UserId] = true

			
			local studentRobloxId = responseData.student.robloxId or tostring(player.UserId)
			RegistrationModule.fetchStudentDataById(player, studentRobloxId)

			print("[REGISTRATION] ? Registered player: " .. player.Name .. " as online")
		else
			onlineStatusCache[player.UserId] = false
			print("[REGISTRATION] ? Set player: " .. player.Name .. " as offline")
		end

		return responseData
	else
		warn("[REGISTRATION] ? Failed to " .. (isOnline and "register" or "set offline") .. " player: " .. player.Name .. " - Error: " .. response)


		if isOnline then
			registrationStatusEvent:FireClient(player, false, true, nil, "Connection error")
		end

		return nil
	end
end


function RegistrationModule.isPlayerRegistered(player)
	local playerData = registeredPlayers[player.UserId]
	if playerData then
		return true, not playerData.needsManualRegister, playerData.student
	end
	return false, true, nil
end


function RegistrationModule.cleanupPlayerData(player)
	registeredPlayers[player.UserId] = nil
	onlineStatusCache[player.UserId] = nil
	print("[REGISTRATION] Cleaned up data for player: " .. player.Name)
end


function RegistrationModule.setAllPlayersOffline()
	for userId, isOnline in pairs(onlineStatusCache) do
		if isOnline then
			local player = Players:GetPlayerByUserId(userId)
			if player then
				pcall(function()
					RegistrationModule.registerPlayer(player, false)
				end)
			end
		end
	end
end


function RegistrationModule.getStudentData(player)
	local playerData = registeredPlayers[player.UserId]
	if playerData then
		return playerData.student
	end
	return nil
end

RegistrationModule.registeredPlayers = registeredPlayers
RegistrationModule.onlineStatusCache = onlineStatusCache


checkRegistrationEvent.OnServerEvent:Connect(function(player)
	RegistrationModule.fetchStudentDataById(player, tostring(player.UserId))
end)


Players.PlayerAdded:Connect(function(player)
	RegistrationModule.registerPlayer(player, true)
end)

Players.PlayerRemoving:Connect(function(player)
	RegistrationModule.registerPlayer(player, false)
	RegistrationModule.cleanupPlayerData(player)
end)

return RegistrationModule
