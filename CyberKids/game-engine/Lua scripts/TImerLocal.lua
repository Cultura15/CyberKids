--LOCALSCRIPT

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local StartTimer = ReplicatedStorage:WaitForChild("StartTimer")
local StopTimer = ReplicatedStorage:WaitForChild("StopTimer")

local label = script.Parent
local runService = game:GetService("RunService")

local timerStart = 0
local timerRunning = false

-- Format seconds into MM:SS
local function formatTime(seconds)
	local minutes = math.floor(seconds / 60)
	local secs = seconds % 60
	return string.format("%02d:%02d", minutes, secs)
end

-- Update loop
runService.RenderStepped:Connect(function()
	if timerRunning then
		local elapsed = os.time() - timerStart
		label.Text = formatTime(elapsed)
	end
end)

StartTimer.OnClientEvent:Connect(function(serverStartTime)
	timerStart = serverStartTime
	timerRunning = true
end)

StopTimer.OnClientEvent:Connect(function(finalElapsed)
	label.Text = formatTime(finalElapsed)
	timerRunning = false
end)
